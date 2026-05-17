import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizResultSchema, progressUpdateSchema, glossarySearchSchema } from "@/lib/validations/api";
import { db } from "@/lib/db";
import { glossaryTerms } from "@/lib/data/glossary-data";

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // Maximum requests per window
  windowMs: 60 * 1000, // 1 minute in milliseconds
};

// Store for tracking requests (in-memory, use Redis for production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup of expired entries — runs once per module lifetime
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanupInterval(): void {
  if (cleanupInterval !== null) return; // already running
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

// Start cleanup on first module load
startCleanupInterval();

// Clean up interval on process shutdown (prevents leak in dev hot-reload / serverless cold start)
function stopCleanupInterval(): void {
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', stopCleanupInterval);
  process.on('SIGINT', stopCleanupInterval);
  // In Next.js dev mode the module is re-evaluated on each rebuild;
  // SIGTERM/SIGINT won't fire between hot-reloads, but the guard in
  // startCleanupInterval prevents duplicate intervals regardless.
}

/**
 * Rate limiting middleware
 * @param ip - Client IP address
 * @returns Rate limit error response with count, or null with the current count
 */
function rateLimit(ip: string): { response: NextResponse | null; count: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { response: null, count: 1 };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return {
      response: NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil((record.resetTime - now) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
      ),
      count: record.count,
    };
  }

  record.count += 1;
  requestCounts.set(ip, record);
  return { response: null, count: record.count };
}

/**
 * Get client IP from request
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function applyRateLimit(request: Request): { response: NextResponse | null; count: number } {
  const ip = getClientIP(request);
  return rateLimit(ip);
}

function addRateLimitHeaders(response: NextResponse, currentCount: number): void {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT.maxRequests - currentCount)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(Date.now() / 1000 + RATE_LIMIT.windowMs / 1000)));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rateLimitResult = applyRateLimit(request);
  if (rateLimitResult.response) {
    return rateLimitResult.response;
  }
  const requestCount = rateLimitResult.count;

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
      addRateLimitHeaders(response, requestCount);
      return response;
    }
  } catch {
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  const response = NextResponse.json({ message: "Hello, world!" });
  addRateLimitHeaders(response, requestCount);
  return response;
}

export async function POST(request: Request) {
  const rateLimitResult = applyRateLimit(request);
  if (rateLimitResult.response) {
    return rateLimitResult.response;
  }
  const requestCount = rateLimitResult.count;

  try {
    const body = await request.json();
    const { type, payload } = body;

    // glossary-search is public (no auth needed)
    if (type === 'glossary-search') {
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
      addRateLimitHeaders(response, requestCount);
      return response;
    }

    // All other endpoints require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

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

    addRateLimitHeaders(response, requestCount);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as { flatten?: () => { fieldErrors: Record<string, string[]> } };
      const details = zodError.flatten?.()?.fieldErrors ?? error.message;
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