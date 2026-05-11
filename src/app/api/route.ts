import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quizAnswerSchema, quizAnswersSchema, progressUpdateSchema, glossarySearchSchema } from "@/lib/validations/api";
import { db } from "@/lib/db";
import { glossaryTerms } from "@/lib/data/glossary-data";

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // Maximum requests per window
  windowMs: 60 * 1000, // 1 minute in milliseconds
};

// Store for tracking requests (in-memory, use Redis for production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 * @param ip - Client IP address
 * @returns Response if rate limit exceeded, null otherwise
 */
function rateLimit(ip: string): NextResponse | null {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // Reset the counter if window has passed
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return null;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((record.resetTime - now) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
    );
  }

  // Increment counter
  record.count += 1;
  requestCounts.set(ip, record);
  return null;
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

/**
 * Apply rate limiting to a request and add headers to response
 */
function applyRateLimit(request: Request): NextResponse | null {
  const ip = getClientIP(request);
  const rateLimitResponse = rateLimit(ip);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  return null;
}

function addRateLimitHeaders(response: NextResponse): void {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT.maxRequests - 1));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(Date.now() / 1000 + RATE_LIMIT.windowMs / 1000)));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const response = NextResponse.json({ message: "Hello, world!" });
  addRateLimitHeaders(response);
  return response;
}

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
      addRateLimitHeaders(response);
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

      case 'quiz-answer': {
        const data = quizAnswerSchema.parse(payload);

        // Store individual quiz answer (could be used for analytics)
        const quizResult = {
          userId,
          questionId: data.questionId,
          answerIndex: data.answerIndex,
          timestamp: new Date().toISOString(),
        };

        result = { quizResult, message: "Quiz answer recorded" };
        break;
      }

      case 'quiz-answers': {
        const data = quizAnswersSchema.parse(payload);
        const quizId = typeof body.quizId === 'string' ? body.quizId : undefined;
        const score = typeof body.score === 'number' ? body.score : undefined;
        const total = typeof body.total === 'number' ? body.total : undefined;

        if (!quizId || score === undefined || total === undefined) {
          return NextResponse.json(
            { error: "quizId, score, and total are required for quiz answers" },
            { status: 400 }
          );
        }

        const quizResult = await db.quizResult.create({
          data: {
            userId,
            quizId,
            score,
            total,
            percentage: total > 0 ? (score / total) * 100 : 0,
          },
        });

        result = { quizResult, answers: data.length, message: "Quiz answers saved" };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown request type: ${type}. Expected: progress, quiz-answer, quiz-answers, glossary-search` },
          { status: 400 }
        );
    }

    const response = NextResponse.json({
      message: "Success",
      type,
      ...result,
    });

    addRateLimitHeaders(response);
    return response;
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}