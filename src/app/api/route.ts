import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizResultSchema, progressUpdateSchema, glossarySearchSchema, batchSyncSchema, challengeBatchSchema, itemProgressBatchSchema, notesSyncSchema, noteDeleteSchema, studySessionsSyncSchema } from "@/lib/validations/api";
import { getDbAdapter } from "@/lib/db-adapter";
import { glossaryTerms } from "@/lib/data/glossary-data";
import { modules } from "@/lib/data/modules-data";
import { quizCategories } from "@/lib/data/quiz-data";
import { rateLimit, getClientIP, addRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf-server";
import { getCsrfCookieName, getCsrfHeaderName } from "@/lib/csrf";

// Build sets of valid IDs for validation
const validModuleIds = new Set(modules.map((m) => m.id));
const validQuizIds = new Set(quizCategories.map((c) => c.id));

/** Normalize a date value that may be a Date object or ISO string (MongoDB) */
function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === 'string') return new Date(val);
  return new Date();
}

/** Normalize milliseconds from a date value */
function toTime(val: unknown): number {
  return toDate(val).getTime();
}

async function applyRateLimit(request: Request): Promise<{ response: NextResponse | null; remaining: number; reset: number }> {
  const ip = getClientIP(request);
  return rateLimit(ip);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rateLimitResult = await applyRateLimit(request);
  if (rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const userId = session.user.id;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'load-progress') {
      const adapter = getDbAdapter();
      const [progressRecords, quizResults, challengeProgressRecords, itemProgressRecords, notesRecords, studySessionRecords] = await Promise.all([
        adapter.progress.findMany({ userId }),
        adapter.quizResult.findMany({ userId }),
        adapter.challengeProgress.findMany({ userId }),
        adapter.itemProgress.findMany({ userId }),
        adapter.note.findMany({ userId }),
        adapter.studySession.findMany({ userId }),
      ]);

      const completedModules = progressRecords
        .filter((p) => p.completed)
        .map((p) => p.moduleId) as string[];

      const quizScores: Record<string, number> = {};
      for (const result of quizResults) {
        if (!quizScores[result.quizId as string] || (result.percentage as number) > quizScores[result.quizId as string]) {
          quizScores[result.quizId as string] = result.percentage as number;
        }
      }

      const challenges: Record<string, { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> }> = {};
      for (const cp of challengeProgressRecords) {
        let answered: number[] = [];
        let selectedOptions: Record<string, number> = {};
        try {
          if (cp.answered) answered = JSON.parse(cp.answered as string);
        } catch { /* corrupted data, default to empty */ }
        try {
          if (cp.selectedOptions) selectedOptions = JSON.parse(cp.selectedOptions as string);
        } catch { /* corrupted data, default to empty */ }
        challenges[cp.challengeType as string] = {
          correct: cp.correct as number,
          total: cp.total as number,
          answered,
          selectedOptions,
        };
      }

      // Build item-level progress map
      const itemProgress: Record<string, string[]> = {};
      for (const ip of itemProgressRecords) {
        let itemIds: string[] = [];
        try {
          if (ip.itemIds) itemIds = JSON.parse(ip.itemIds as string);
        } catch { /* corrupted data, default to empty */ }
        itemProgress[ip.moduleId as string] = itemIds;
      }

      // Extract CSRF viewed challenges from item progress for backward compatibility
      const csrfViewedChallenges = itemProgress['csrf'] ?? [];

      // Build notes map
      const notes: Record<string, { id: string; itemId: string; moduleId: string; moduleName: string; content: string; createdAt: number; updatedAt: number }> = {};
      for (const note of notesRecords) {
        notes[note.id as string] = {
          id: note.id as string,
          itemId: note.itemId as string,
          moduleId: note.moduleId as string,
          moduleName: note.moduleName as string,
          content: note.content as string,
          createdAt: toTime(note.createdAt),
          updatedAt: toTime(note.updatedAt),
        };
      }

      // Build study sessions array
      const studySessions = studySessionRecords.map((ss) => ({
        id: ss.id as string,
        date: ss.date as string,
        durationMs: ss.durationMs as number,
        pageType: ss.pageType as string,
        xpEarned: ss.xpEarned as number,
        createdAt: toTime(ss.createdAt),
      }));

      // Calculate totalXP from study sessions
      const totalXP = studySessionRecords.reduce((sum, ss) => sum + (ss.xpEarned as number), 0);

      // Build quiz history from quiz results
      const quizHistory = quizResults.map((qr) => ({
        id: qr.id as string,
        categoryId: qr.quizId as string,
        categoryName: qr.quizId as string,
        score: qr.score as number,
        correct: qr.score as number,
        total: qr.total as number,
        answers: [] as (boolean | null)[],
        timestamp: toTime(qr.createdAt),
      }));

      await setCsrfCookie();
      const response = NextResponse.json({ completedModules, quizScores, quizHistory, challenges, itemProgress, csrfViewedChallenges, notes, studySessions, totalXP, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() });
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
      return response;
    }
  } catch (error) {
    logger.error('Failed to load progress:', error);
    await setCsrfCookie();
    const response = NextResponse.json({ error: "Failed to load progress", csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() }, { status: 500 });
    addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
    return response;
  }

  await setCsrfCookie();
  const response = NextResponse.json(
    { error: `Unknown action. Expected: load-progress`, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() },
    { status: 400 }
  );
  addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
  return response;
}

export async function POST(request: Request) {
  let rateLimitResult: Awaited<ReturnType<typeof applyRateLimit>> | null = null;

  try {
    // Reject oversized payloads before parsing to prevent memory exhaustion DoS
    const contentLength = request.headers.get('content-length');
    const contentLengthNum = contentLength ? Number(contentLength) : NaN;
    if (!isNaN(contentLengthNum) && contentLengthNum > 1_048_576) {
      return NextResponse.json(
        { error: 'Request body too large (max 1 MB)' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { type, payload } = body;

    // glossary-search is public (no auth needed) — apply rate limit
    if (type === 'glossary-search') {
      rateLimitResult = await applyRateLimit(request);
      if (rateLimitResult.response) {
        return rateLimitResult.response;
      }

      const data = glossarySearchSchema.parse(payload);
      const query = data.query.toLowerCase();

      let results = glossaryTerms.filter((term) =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query)
      );

      if (data.category) {
        const category = data.category;
        results = results.filter((term) =>
          term.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      const response = NextResponse.json({
        message: "Success",
        type,
        results,
        count: results.length,
      });
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
      return response;
    }

    // All other endpoints require authentication — check before consuming rate limit
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    // Apply rate limit only for authenticated requests
    rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // Validate CSRF token for all authenticated POST requests
    const csrfValid = await validateCsrfToken(request);
    if (!csrfValid) {
      return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
    }

    let result: Record<string, unknown>;

    switch (type) {
      case 'progress': {
        const data = progressUpdateSchema.parse(payload);
        const adapter = getDbAdapter();

        const progress = await adapter.progress.upsert(
          { userId, moduleId: data.moduleId },
          { userId, moduleId: data.moduleId, completed: data.completed, score: data.score ?? 0, lastAccessed: new Date().toISOString() },
          { completed: data.completed, score: data.score ?? 0, lastAccessed: new Date().toISOString() }
        );

        result = { progress };
        break;
      }

      case 'quiz-answers': {
        const data = quizResultSchema.parse(payload);
        const adapter = getDbAdapter();
        const percentage = data.total > 0 ? (data.score / data.total) * 100 : 0;

        const quizResult = await adapter.quizResult.upsert(
          { userId, quizId: data.quizId },
          { userId, quizId: data.quizId, score: data.score, total: data.total, percentage, createdAt: new Date().toISOString() },
          { score: data.score, total: data.total, percentage }
        );

        result = { quizResult, message: "Quiz result saved" };
        break;
      }

      case 'batch-sync': {
        const data = batchSyncSchema.parse(payload);
        const adapter = getDbAdapter();
        let { modules, quizzes } = data;

        // Validate module IDs against known valid IDs
        const invalidModuleIds = modules.filter((m) => !validModuleIds.has(m.moduleId)).map((m) => m.moduleId);
        if (invalidModuleIds.length > 0) {
          logger.warn('Ignoring unknown module IDs:', invalidModuleIds);
          modules = modules.filter((m) => validModuleIds.has(m.moduleId));
        }

        // Validate quiz IDs against known valid IDs
        const invalidQuizIds = quizzes.filter((q) => !validQuizIds.has(q.quizId)).map((q) => q.quizId);
        if (invalidQuizIds.length > 0) {
          logger.warn('Ignoring unknown quiz IDs:', invalidQuizIds);
          quizzes = quizzes.filter((q) => validQuizIds.has(q.quizId));
        }

        if (modules.length === 0 && quizzes.length === 0) {
          const warning = invalidModuleIds.length > 0 || invalidQuizIds.length > 0
            ? 'All provided IDs were invalid'
            : 'No modules or quizzes to sync';
          result = { saved: { modules: 0, quizzes: 0 }, warning };
          break;
        }

        const now = new Date().toISOString();
        const savePromises: Promise<unknown>[] = [];
        if (modules.length > 0) {
          for (const m of modules) {
            savePromises.push(
              adapter.progress.upsert(
                { userId, moduleId: m.moduleId },
                { userId, moduleId: m.moduleId, completed: m.completed, score: m.score ?? 0, lastAccessed: now },
                { completed: m.completed, score: m.score ?? 0, lastAccessed: now }
              )
            );
          }
        }
        if (quizzes.length > 0) {
          for (const q of quizzes) {
            const pct = q.total > 0 ? (q.score / q.total) * 100 : 0;
            savePromises.push(
              adapter.quizResult.upsert(
                { userId, quizId: q.quizId },
                { userId, quizId: q.quizId, score: q.score, total: q.total, percentage: pct, createdAt: now },
                { score: q.score, total: q.total, percentage: pct }
              )
            );
          }
        }

        const results = await Promise.allSettled(savePromises);
        const failures = results.filter((r) => r.status === 'rejected');
        if (failures.length > 0) {
          throw new Error(`${failures.length} upsert(s) failed`);
        }

        const moduleResults = results.slice(0, modules.length);
        const quizResults = results.slice(modules.length);
        result = { saved: { modules: moduleResults.length, quizzes: quizResults.length }, message: "Batch sync completed" };
        break;
      }

      case 'challenge-progress-sync': {
        const data = challengeBatchSchema.parse(payload);
        const adapter = getDbAdapter();
        const { challenges } = data;

        if (challenges.length === 0) {
          result = { saved: { challenges: 0 } };
          break;
        }

        const now = new Date().toISOString();
        const challengeResults = await Promise.all(
          challenges.map((c) =>
            adapter.challengeProgress.upsert(
              { userId, challengeType: c.challengeType },
              { userId, challengeType: c.challengeType, correct: c.correct, total: c.total, answered: c.answered ? JSON.stringify(c.answered) : null, selectedOptions: c.selectedOptions ? JSON.stringify(c.selectedOptions) : null, updatedAt: now },
              { correct: c.correct, total: c.total, answered: c.answered ? JSON.stringify(c.answered) : null, selectedOptions: c.selectedOptions ? JSON.stringify(c.selectedOptions) : null, updatedAt: now }
            )
          )
        );

        result = { saved: { challenges: challengeResults.length }, message: "Challenge progress sync completed" };
        break;
      }

      case 'item-progress-sync': {
        const data = itemProgressBatchSchema.parse(payload);
        const adapter = getDbAdapter();
        const { items } = data;

        if (items.length === 0) {
          result = { saved: { items: 0 } };
          break;
        }

        const itemResults = await Promise.all(
          items.map((item) =>
            adapter.itemProgress.upsert(
              { userId, moduleId: item.moduleId },
              { userId, moduleId: item.moduleId, itemIds: JSON.stringify(item.itemIds), updatedAt: new Date().toISOString() },
              { itemIds: JSON.stringify(item.itemIds), updatedAt: new Date().toISOString() }
            )
          )
        );

        result = { saved: { items: itemResults.length }, message: "Item progress sync completed" };
        break;
      }

      case 'notes-sync': {
        const data = notesSyncSchema.parse(payload);
        const adapter = getDbAdapter();
        const { notes } = data;

        if (notes.length === 0) {
          result = { saved: { notes: 0 } };
          break;
        }

        // Execute note upserts sequentially with error handling
        let savedCount = 0;
        for (const note of notes) {
          try {
            const noteId = note.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            await adapter.note.upsert(
              { id: noteId },
              { userId, itemId: note.itemId, moduleId: note.moduleId, moduleName: note.moduleName, content: note.content },
              { itemId: note.itemId, moduleId: note.moduleId, moduleName: note.moduleName, content: note.content }
            );
            savedCount++;
          } catch (error) {
            logger.error(`[API] Note upsert failed for ${note.itemId}:`, error);
          }
        }

        result = { saved: { notes: savedCount }, message: "Notes sync completed" };
        break;
      }

      case 'note-delete': {
        const data = noteDeleteSchema.parse(payload);
        const adapter = getDbAdapter();
        const { noteId } = data;

        // Always return success to avoid leaking note existence information
        await adapter.note.deleteMany({
          id: noteId,
          userId,
        });

        result = { message: "Note deleted" };
        break;
      }

      case 'study-sessions-sync': {
        const data = studySessionsSyncSchema.parse(payload);
        const adapter = getDbAdapter();
        const { sessions } = data;

        if (sessions.length === 0) {
          result = { saved: { sessions: 0 } };
          break;
        }

        // Execute session inserts sequentially with error handling
        let savedCount = 0;
        for (const session of sessions) {
          try {
            await adapter.studySession.createMany([{
              userId,
              id: session.id || undefined,
              date: session.date,
              durationMs: session.durationMs,
              pageType: session.pageType,
              xpEarned: session.xpEarned ?? 0,
            }]);
            savedCount++;
          } catch (error) {
            logger.error('[API] Study session insert failed:', error);
          }
        }

        result = { saved: { sessions: savedCount }, message: "Study sessions sync completed" };
        break;
      }

      case 'reset-progress': {
        const adapter = getDbAdapter();
        await adapter.deleteAllForUser(userId);

        result = { message: "Progress reset successfully" };
        break;
      }

      default: {
        const response = NextResponse.json(
          { error: `Unknown request type. Expected: progress, quiz-answers, glossary-search, batch-sync, challenge-progress-sync, item-progress-sync, notes-sync, note-delete, study-sessions-sync, reset-progress` },
          { status: 400 }
        );
        addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
        return response;
      }
    }

    const response = NextResponse.json({
      message: "Success",
      type,
      ...result,
    });

    addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
    return response;
  } catch (error) {
    // Handle malformed JSON body — request.json() throws TypeError in Next.js,
    // not SyntaxError. Also check error message for JSON-related patterns.
    const errorMsg = error instanceof Error ? error.message : '';
    const isJsonParseError =
      error instanceof SyntaxError ||
      (error instanceof TypeError && /JSON|Unexpected token|unexpected end|bad response/i.test(errorMsg)) ||
      (typeof error === 'object' && error !== null && 'message' in error && /JSON|Unexpected token/i.test((error as Error).message));

    if (isJsonParseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const rl = rateLimitResult ?? { remaining: 0, reset: 0 };
    if (error instanceof z.ZodError) {
      const details = error.flatten().fieldErrors;
      const response = NextResponse.json(
        { error: "Validation failed", details },
        { status: 400 }
      );
      addRateLimitHeaders(response, rl.remaining, rl.reset);
      return response;
    }
    logger.error('API POST error:', error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    addRateLimitHeaders(response, rl.remaining, rl.reset);
    return response;
  }
}