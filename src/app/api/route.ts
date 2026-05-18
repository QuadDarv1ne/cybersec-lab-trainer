import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizResultSchema, progressUpdateSchema, glossarySearchSchema } from "@/lib/validations/api";
import { db } from "@/lib/db";
import { glossaryTerms } from "@/lib/data/glossary-data";
import { rateLimit, getClientIP, addRateLimitHeaders } from "@/lib/rate-limit";

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
      const [progressRecords, quizResults] = await Promise.all([
        db.progress.findMany({
          where: { userId },
          orderBy: { lastAccessed: 'desc' },
        }),
        db.quizResult.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
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

      const response = NextResponse.json({ completedModules, quizScores });
      addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
      return response;
    }
  } catch {
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  const response = NextResponse.json({ message: "Hello, world!" });
  addRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.reset);
  return response;
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
        results = results.filter((term) =>
          term.category.toLowerCase().includes(data.category!.toLowerCase())
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

        result = { quizResult, answers: data.answers?.length ?? 0, message: "Quiz answers saved" };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown request type: ${type}. Expected: progress, quiz-answers, glossary-search` },
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
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}