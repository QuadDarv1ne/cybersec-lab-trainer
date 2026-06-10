import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizResultSchema, progressUpdateSchema, glossarySearchSchema, batchSyncSchema, challengeBatchSchema, itemProgressBatchSchema, notesSyncSchema, noteDeleteSchema, studySessionsSyncSchema, quizHistorySyncSchema } from "@/lib/validations/api";
import { getDbAdapter } from "@/lib/db-adapter";
import { glossaryTerms } from "@/lib/data/glossary-data";
import { modules } from "@/lib/data/modules-data";
import { quizCategories } from "@/lib/data/quiz-data";
import { rateLimit, getClientIP, addRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { XP_REWARDS } from "@/lib/xp-system";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf-server";
import { getCsrfCookieName, getCsrfHeaderName } from "@/lib/csrf";
import { sanitizeNoteContent } from "@/lib/sanitize";
import { generateUUID } from "@/lib/utils";

// Build sets of valid IDs for validation
const validModuleIds = new Set(modules.map((m) => m.id));
const validQuizIds = new Set(quizCategories.map((c) => c.id));

/** Normalize a date value that may be a Date object or ISO string (MongoDB) */
function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === 'string') return new Date(val);
  if (val === null || val === undefined) {
    throw new Error(`Invalid date value: ${val}`);
  }
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

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {

    if (action === 'leaderboard') {
      const timeframe = url.searchParams.get('timeframe') || 'all';
      const adapter = getDbAdapter();

      if (adapter.type === 'mongodb') {
        // MongoDB leaderboard
        const { UserModel, StudySessionModel, ProgressModel, QuizResultModel, ChallengeProgressModel } = await import('@/lib/mongoose-schema');
        const match: Record<string, unknown> = {};
        if (timeframe === 'weekly') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          match.createdAt = { $gte: weekAgo };
        }
        const sessions = await StudySessionModel.aggregate([
          { $match: match },
          { $group: { _id: '$userId', totalXP: { $sum: '$xpEarned' } } },
          { $sort: { totalXP: -1 } },
          { $limit: 50 },
        ]);
        const userIds = sessions.map((s: { _id: string }) => s._id);
        const [progressCounts, quizResults, challengeProgress, users] = await Promise.all([
          ProgressModel.aggregate([
            { $match: { userId: { $in: userIds }, completed: true } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ]),
          QuizResultModel.find({ userId: { $in: userIds } }).lean(),
          ChallengeProgressModel.find({ userId: { $in: userIds } }).lean(),
          UserModel.find({ _id: { $in: userIds } }).lean(),
        ]);
        const progressMap = Object.fromEntries(progressCounts.map((p: { _id: string; count: number }) => [p._id, p.count]));
        const quizByUser = new Map<string, Array<{ quizId: string; score: number; total: number }>>();
        for (const qr of quizResults as unknown as Array<{ userId: string; quizId: string; score: number; total: number }>) {
          if (!quizByUser.has(qr.userId)) quizByUser.set(qr.userId, []);
          quizByUser.get(qr.userId)!.push({ quizId: qr.quizId, score: qr.score, total: qr.total });
        }
        const challengeByUser = new Map<string, number>();
        for (const cp of challengeProgress as unknown as Array<{ userId: string; correct: number }>) {
          challengeByUser.set(cp.userId, (challengeByUser.get(cp.userId) ?? 0) + cp.correct);
        }
        const userMap = Object.fromEntries((users as unknown as Array<{ _id: string; name: string | null; email: string | null; image: string | null }>).map((u) => [String(u._id), u]));
        const { calculateLevel } = await import('@/lib/xp-system');
        const totalModules = modules.length;
        const leaderboard = [];
        for (const s of sessions) {
          const user = userMap[s._id];
          if (user) {
            const uid = String(user._id);
            const sessionXP = s.totalXP;
            const completedModules = progressMap[uid] ?? 0;
            const moduleXP = completedModules * XP_REWARDS.completeModule;
            const moduleBonusesXP = (completedModules >= 1 ? XP_REWARDS.firstModuleComplete : 0)
              + (completedModules >= totalModules ? XP_REWARDS.allModulesComplete : 0);

            // Deduplicate quiz scores per quizId
            const userQuizzes = quizByUser.get(uid) ?? [];
            const bestScores = new Map<string, number>();
            for (const qr of userQuizzes) {
              const pct = qr.total > 0 ? (qr.score / qr.total) * 100 : 0;
              bestScores.set(qr.quizId, Math.max(bestScores.get(qr.quizId) ?? 0, pct));
            }
            let quizXP = 0;
            for (const pct of bestScores.values()) {
              quizXP += XP_REWARDS.quizPass + Math.round(pct * XP_REWARDS.quizBonusPerPercent);
            }

            const challengeXP = (challengeByUser.get(uid) ?? 0) * XP_REWARDS.challengeCorrect;
            const totalXP = sessionXP + moduleXP + moduleBonusesXP + quizXP + challengeXP;
            leaderboard.push({
              id: user._id,
              name: user.name,
              email: user.email,
              image: user.image,
              totalXP,
              level: calculateLevel(totalXP),
              completedModules,
            });
          }
        }
        return NextResponse.json({ leaderboard });
      }

      // SQLite/PostgreSQL leaderboard
      const { db } = await import('@/lib/db');
      const { calculateLevel } = await import('@/lib/xp-system');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const totalModules = modules.length;

      const users = await db.user.findMany({
        where: { role: 'STUDENT' },
        select: {
          id: true, name: true, email: true, image: true,
          studySessions: timeframe === 'weekly' ? {
            where: { createdAt: { gte: weekAgo } },
            select: { xpEarned: true },
          } : { select: { xpEarned: true } },
          progress: { where: { completed: true }, select: { moduleId: true } },
          challengeProgress: { select: { correct: true } },
          quizResults: { select: { quizId: true, score: true, total: true } },
        },
        take: 50,
      });

      const leaderboard = users
        .map((u: {
          id: string; name: string | null; email: string | null; image: string | null;
          studySessions: { xpEarned: number }[];
          progress: { moduleId: string }[];
          challengeProgress: { correct: number }[];
          quizResults: { quizId: string; score: number; total: number }[];
        }) => {
          const sessionXP = u.studySessions.reduce((sum: number, s: { xpEarned: number }) => sum + s.xpEarned, 0);
          const moduleCount = u.progress.length;
          const moduleXP = moduleCount * XP_REWARDS.completeModule;
          const moduleBonusesXP = (moduleCount >= 1 ? XP_REWARDS.firstModuleComplete : 0)
            + (moduleCount >= totalModules ? XP_REWARDS.allModulesComplete : 0);

          // Deduplicate quiz scores: use best score per quizId (matches load-progress)
          const bestScores = new Map<string, number>();
          for (const qr of u.quizResults) {
            const pct = qr.total > 0 ? (qr.score / qr.total) * 100 : 0;
            bestScores.set(qr.quizId, Math.max(bestScores.get(qr.quizId) ?? 0, pct));
          }
          let quizXP = 0;
          for (const pct of bestScores.values()) {
            quizXP += XP_REWARDS.quizPass + Math.round(pct * XP_REWARDS.quizBonusPerPercent);
          }

          const correctAnswers = u.challengeProgress.reduce((sum: number, cp: { correct: number }) => sum + cp.correct, 0);
          const challengeXP = correctAnswers * XP_REWARDS.challengeCorrect;

          const totalXP = sessionXP + moduleXP + moduleBonusesXP + quizXP + challengeXP;
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            totalXP,
            level: calculateLevel(totalXP),
            completedModules: moduleCount,
          };
        })
        .sort((a: { totalXP: number }, b: { totalXP: number }) => b.totalXP - a.totalXP);

      return NextResponse.json({ leaderboard });
    }

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
        } catch (e) { logger.warn('Corrupted challenge answered data, defaulting to empty', e); }
        try {
          if (cp.selectedOptions) selectedOptions = JSON.parse(cp.selectedOptions as string);
        } catch (e) { logger.warn('Corrupted challenge selectedOptions data, defaulting to empty', e); }
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
        } catch (e) { logger.warn('Corrupted itemProgress itemIds data, defaulting to empty', e); }
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

      // Calculate totalXP from all sources (must match client-side logic)
      // 1. Study sessions XP
      const sessionXP = studySessionRecords.reduce((sum, ss) => sum + (ss.xpEarned as number), 0);

      // 2. Module completion XP (base + bonuses)
      const moduleCount = completedModules.length;
      const moduleXP = moduleCount * XP_REWARDS.completeModule;
      const moduleBonusesXP = (moduleCount >= 1 ? XP_REWARDS.firstModuleComplete : 0)
        + (moduleCount >= modules.length ? XP_REWARDS.allModulesComplete : 0);

      // 3. Quiz XP (base + percentage bonus)
      let quizXP = 0;
      for (const score of Object.values(quizScores)) {
        quizXP += XP_REWARDS.quizPass + Math.round(score * XP_REWARDS.quizBonusPerPercent);
      }

      // 4. Challenge XP
      const challengeXP = challengeProgressRecords.reduce((sum, cp) => sum + (cp.correct as number), 0) * XP_REWARDS.challengeCorrect;

      const totalXP = sessionXP + moduleXP + moduleBonusesXP + quizXP + challengeXP;

      // Build quiz history from quiz results
      const quizHistory = quizResults.map((qr) => {
        const category = quizCategories.find((c) => c.id === qr.quizId);
        return {
          id: qr.id as string,
          categoryId: qr.quizId as string,
          categoryName: category?.name ?? (qr.quizId as string),
          score: qr.score as number,
          correct: qr.score as number,
          total: qr.total as number,
          answers: [] as (boolean | null)[],
          timestamp: toTime(qr.createdAt),
        };
      });

      await setCsrfCookie();
      const response = NextResponse.json({ completedModules, quizScores, quizHistory, challenges, itemProgress, csrfViewedChallenges, notes, studySessions, totalXP, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() });
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
      return response;
    }
  } catch (error) {
    const actionLabel = action === 'leaderboard' ? 'leaderboard' : 'progress';
    logger.error(`Failed to load ${actionLabel}:`, error);
    try { await setCsrfCookie(); } catch (e) { logger.warn('Failed to set CSRF cookie in load-progress', e); }
    const response = NextResponse.json({ error: `Failed to load ${actionLabel}`, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() }, { status: 500 });
    addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
    return response;
  }

    try { await setCsrfCookie(); } catch (e) { logger.warn('Failed to set CSRF cookie in error handler', e); }
  const response = NextResponse.json(
    { error: `Unknown action. Expected: load-progress, leaderboard`, csrfCookieName: getCsrfCookieName(), csrfHeaderName: getCsrfHeaderName() },
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

    const body = await request.json() ?? {};
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

    // Apply rate limit BEFORE CSRF validation to protect server resources
    rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult.response) {
      return rateLimitResult.response;
    }

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

        // Use atomic batch operations — either all succeed or none do
        // This prevents partial syncs that corrupt user state (e.g., modules saved but quizzes fail)
        let savedModules = 0;
        let savedQuizzes = 0;
        try {
          if (modules.length > 0) {
            savedModules = await adapter.batchUpsertProgress(
              userId,
              modules.map((m) => ({ moduleId: m.moduleId, completed: m.completed, score: m.score ?? 0 }))
            );
          }
          if (quizzes.length > 0) {
            savedQuizzes = await adapter.batchUpsertQuizResults(
              userId,
              quizzes.map((q) => ({ quizId: q.quizId, score: q.score, total: q.total }))
            );
          }
        } catch (error) {
          logger.error('Batch-sync transaction failed, all changes rolled back:', error);
          throw new Error('Batch sync failed — transaction rolled back for data consistency');
        }

        result = { saved: { modules: savedModules, quizzes: savedQuizzes }, message: "Batch sync completed atomically" };
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
        const challengeResults = await Promise.allSettled(
          challenges.map((c) =>
            adapter.challengeProgress.upsert(
              { userId, challengeType: c.challengeType },
              { userId, challengeType: c.challengeType, correct: c.correct, total: c.total, answered: c.answered ? JSON.stringify(c.answered) : null, selectedOptions: c.selectedOptions ? JSON.stringify(c.selectedOptions) : null, updatedAt: now },
              { correct: c.correct, total: c.total, answered: c.answered ? JSON.stringify(c.answered) : null, selectedOptions: c.selectedOptions ? JSON.stringify(c.selectedOptions) : null, updatedAt: now }
            )
          )
        );
        const succeeded = challengeResults.filter((r) => r.status === 'fulfilled').length;
        const failed = challengeResults.filter((r) => r.status === 'rejected');
        if (failed.length > 0) {
          logger.warn(`${failed.length} challenge upsert(s) failed during sync`);
        }

        result = { saved: { challenges: succeeded }, message: "Challenge progress sync completed" };
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

        const itemResults = await Promise.allSettled(
          items.map((item) =>
            adapter.itemProgress.upsert(
              { userId, moduleId: item.moduleId },
              { userId, moduleId: item.moduleId, itemIds: JSON.stringify(item.itemIds), updatedAt: new Date().toISOString() },
              { itemIds: JSON.stringify(item.itemIds), updatedAt: new Date().toISOString() }
            )
          )
        );
        const succeeded = itemResults.filter((r) => r.status === 'fulfilled').length;
        const failed = itemResults.filter((r) => r.status === 'rejected');
        if (failed.length > 0) {
          logger.warn(`${failed.length} item upsert(s) failed during sync`);
        }

        result = { saved: { items: succeeded }, message: "Item progress sync completed" };
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
            const noteId = note.id || `note-${Date.now()}-${generateUUID().slice(0, 8)}`;
            // Sanitize on server-side to prevent XSS if client-side sanitization is bypassed
            const sanitizedContent = sanitizeNoteContent(note.content);
            await adapter.note.upsert(
              { id: noteId },
              { userId, itemId: note.itemId, moduleId: note.moduleId, moduleName: note.moduleName, content: sanitizedContent },
              { itemId: note.itemId, moduleId: note.moduleId, moduleName: note.moduleName, content: sanitizedContent }
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

        // Execute session upserts sequentially with error handling (similar to notes-sync)
        let savedCount = 0;
        for (const session of sessions) {
          try {
            const sessionId = session.id || `session-${Date.now()}-${generateUUID().slice(0, 8)}`;
            await adapter.studySession.upsert(
              { id: sessionId },
              { userId, id: sessionId, date: session.date, durationMs: session.durationMs, pageType: session.pageType, xpEarned: session.xpEarned ?? 0 },
              { date: session.date, durationMs: session.durationMs, pageType: session.pageType, xpEarned: session.xpEarned ?? 0 }
            );
            savedCount++;
          } catch (error) {
            logger.error('[API] Study session upsert failed:', error);
          }
        }

        result = { saved: { sessions: savedCount }, message: "Study sessions sync completed" };
        break;
      }

      case 'quiz-history-sync': {
        const data = quizHistorySyncSchema.parse(payload);
        const adapter = getDbAdapter();
        const { quizHistory } = data;

        if (quizHistory.length === 0) {
          result = { saved: { quizHistory: 0 } };
          break;
        }

        // Execute quiz history upserts sequentially with error handling
        let savedCount = 0;
        for (const qh of quizHistory) {
          try {
            const id = qh.id || `quiz-${Date.now()}-${generateUUID().slice(0, 8)}`;
            const percentage = qh.total > 0 ? (qh.score / qh.total) * 100 : 0;
            await adapter.quizResult.create(
              { userId, id, quizId: qh.categoryId, score: qh.score, total: qh.total, percentage, createdAt: new Date(qh.timestamp) }
            );
            savedCount++;
          } catch (error) {
            logger.error('[API] Quiz history create failed:', error);
          }
        }

        result = { saved: { quizHistory: savedCount }, message: "Quiz history sync completed" };
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
      const details = error.format();
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