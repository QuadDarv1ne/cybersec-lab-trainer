import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizResultSchema, progressUpdateSchema, glossarySearchSchema, batchSyncSchema, challengeBatchSchema } from "@/lib/validations/api";
import { db } from "@/lib/db";
import { glossaryTerms } from "@/lib/data/glossary-data";
import { rateLimit, getClientIP, addRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

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
      const [progressRecords, quizResults, challengeProgress] = await Promise.all([
        db.progress.findMany({
          where: { userId },
          orderBy: { lastAccessed: 'desc' },
        }),
        db.quizResult.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        db.challengeProgress.findMany({
          where: { userId },
        }),
      ]);

      const completedModules = progressRecords
        .filter((p) => p.completed)
        .map((p) => p.moduleId);

      const quizScores: Record<string, number> = {};
      for (const result of quizResults) {
        if (!quizScores[result.quizId] || result.percentage > quizScores[result.quizId]) {
          quizScores[result.quizId] = result.percentage;
        }
      }

      const challenges: Record<string, { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> }> = {};
      for (const cp of challengeProgress) {
        challenges[cp.challengeType] = {
          correct: cp.correct,
          total: cp.total,
          answered: (cp.answered as number[]) ?? [],
          selectedOptions: (cp.selectedOptions as Record<string, number>) ?? {},
        };
      }

      const response = NextResponse.json({ completedModules, quizScores, challenges });
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
      return response;
    }
  } catch (error) {
    logger.error('Failed to load progress:', error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  return NextResponse.json(
    { error: `Unknown action. Expected: load-progress` },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    // glossary-search is public (no auth needed) — apply rate limit
    if (type === 'glossary-search') {
      const rateLimitResult = await applyRateLimit(request);
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
    const rateLimitResult = await applyRateLimit(request);
    if (rateLimitResult.response) {
      return rateLimitResult.response;
    }

    let result: Record<string, unknown>;

    switch (type) {
      case 'progress': {
        const data = progressUpdateSchema.parse(payload);

        const progress = await db.progress.upsert({
          where: {
            userId_moduleId: { userId, moduleId: data.moduleId },
          },
          create: {
            userId,
            moduleId: data.moduleId,
            completed: data.completed,
            score: data.score ?? 0,
            lastAccessed: new Date(),
          },
          update: {
            completed: data.completed,
            score: data.score ?? 0,
            lastAccessed: new Date(),
          },
        });

        result = { progress };
        break;
      }

      case 'quiz-answers': {
        const data = quizResultSchema.parse(payload);

        const quizResult = await db.quizResult.upsert({
          where: {
            userId_quizId: { userId, quizId: data.quizId },
          },
          create: {
            userId,
            quizId: data.quizId,
            score: data.score,
            total: data.total,
            percentage: data.total > 0 ? (data.score / data.total) * 100 : 0,
          },
          update: {
            score: data.score,
            total: data.total,
            percentage: data.total > 0 ? (data.score / data.total) * 100 : 0,
          },
        });

        result = { quizResult, message: "Quiz result saved" };
        break;
      }

      case 'batch-sync': {
        const data = batchSyncSchema.parse(payload);
        const { modules, quizzes } = data;

        if (modules.length === 0 && quizzes.length === 0) {
          result = { saved: { modules: 0, quizzes: 0 } };
          break;
        }

        const [moduleResults, quizResults] = await Promise.all([
          modules.length > 0
            ? Promise.all(modules.map((m) =>
                db.progress.upsert({
                  where: { userId_moduleId: { userId, moduleId: m.moduleId } },
                  create: { userId, moduleId: m.moduleId, completed: m.completed, score: m.score ?? 0, lastAccessed: new Date() },
                  update: { completed: m.completed, score: m.score ?? 0, lastAccessed: new Date() },
                })
              ))
            : Promise.resolve([]),
          quizzes.length > 0
            ? Promise.all(quizzes.map((q) =>
                db.quizResult.upsert({
                  where: { userId_quizId: { userId, quizId: q.quizId } },
                  create: { userId, quizId: q.quizId, score: q.score, total: q.total, percentage: q.total > 0 ? (q.score / q.total) * 100 : 0 },
                  update: { score: q.score, total: q.total, percentage: q.total > 0 ? (q.score / q.total) * 100 : 0 },
                })
              ))
            : Promise.resolve([]),
        ]);

        result = { saved: { modules: moduleResults.length, quizzes: quizResults.length }, message: "Batch sync completed" };
        break;
      }

      case 'challenge-progress-sync': {
        const data = challengeBatchSchema.parse(payload);
        const { challenges } = data;

        if (challenges.length === 0) {
          result = { saved: { challenges: 0 } };
          break;
        }

        const challengeResults = await Promise.all(
          challenges.map((c) =>
            db.challengeProgress.upsert({
              where: { userId_challengeType: { userId, challengeType: c.challengeType } },
              create: {
                userId,
                challengeType: c.challengeType,
                correct: c.correct,
                total: c.total,
                answered: c.answered ?? [],
                selectedOptions: c.selectedOptions ?? {},
              },
              update: {
                correct: c.correct,
                total: c.total,
                answered: c.answered ?? [],
                selectedOptions: c.selectedOptions ?? {},
              },
            })
          )
        );

        result = { saved: { challenges: challengeResults.length }, message: "Challenge progress sync completed" };
        break;
      }

      case 'reset-progress': {
        await db.$transaction([
          db.progress.deleteMany({ where: { userId } }),
          db.quizResult.deleteMany({ where: { userId } }),
          db.challengeProgress.deleteMany({ where: { userId } }),
        ]);

        result = { message: "Progress reset successfully" };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown request type. Expected: progress, quiz-answers, glossary-search, batch-sync, challenge-progress-sync, reset-progress` },
          { status: 400 }
        );
    }

    const response = NextResponse.json({
      message: "Success",
      type,
      ...result,
    });

    addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details },
        { status: 400 }
      );
    }
    logger.error('API POST error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}