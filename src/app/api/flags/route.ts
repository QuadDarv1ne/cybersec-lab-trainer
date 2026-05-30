/**
 * CTF Flag Submission API
 *
 * POST /api/flags
 * Body: { labId: string, flagKey: string, flagValue: string }
 *
 * Server-side flag verification — flag values are never sent to the client.
 * Prevents double-scoring and validates all inputs.
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDbAdapter } from '@/lib/db-adapter';
import { rateLimit, getClientIP, addRateLimitHeaders } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { setCsrfCookie, validateCsrfToken, constantTimeCompare } from '@/lib/csrf-server';
import { getCsrfCookieName, getCsrfHeaderName } from '@/lib/csrf';
import { createHash } from 'crypto';

/** Hash a flag value for more secure storage (prevents DB compromise from revealing flags) */
function hashFlagValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const flagSubmissionSchema = z.object({
  labId: z.string().min(1).max(100),
  flagKey: z.string().min(1).max(100),
  flagValue: z.string().min(1).max(200),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'list-labs') {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      await setCsrfCookie();
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const ip = getClientIP(request);
    const rl = await rateLimit(ip);
    if (rl.response) {
      await setCsrfCookie();
      return rl.response;
    }

    const adapter = getDbAdapter();

    try {
      const labs = await adapter.lab.findMany({}, { flags: true });

      // Never send flagValue to the client!
      const sanitizedLabs = labs.map((lab) => {
        const l = lab as Record<string, unknown> & { flags?: Array<Record<string, unknown>> };
        return {
          id: l.id,
          number: l.number,
          title: l.title,
          description: l.description,
          goal: l.goal,
          tools: l.tools,
          difficulty: l.difficulty,
          category: l.category,
          flags: (l.flags ?? []).map((flag) => ({
            flagKey: flag.flagKey,
            points: flag.points,
            hint: flag.hint,
          })),
        };
      });

      await setCsrfCookie();
      const response = NextResponse.json({ labs: sanitizedLabs });
      addRateLimitHeaders(response, rl.remaining, rl.reset);
      return response;
    } catch (error) {
      logger.error('List labs error:', error);
      await setCsrfCookie();
      const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      addRateLimitHeaders(response, rl.remaining, rl.reset);
      return response;
    }
  }

  const response = NextResponse.json({ error: 'Unknown action. Expected: list-labs' }, { status: 400 });
  await setCsrfCookie();
  return response;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const ip = getClientIP(request);
  const rl = await rateLimit(ip);
  if (rl.response) return rl.response;

  const userId = session.user.id;

  // Validate CSRF
  const csrfValid = await validateCsrfToken(request);
  if (!csrfValid) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response = NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    addRateLimitHeaders(response, rl.remaining, rl.reset);
    return response;
  }

  const parsed = flagSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const response = NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    addRateLimitHeaders(response, rl.remaining, rl.reset);
    return response;
  }

  const { labId, flagKey, flagValue } = parsed.data;
  const adapter = getDbAdapter();

  try {
    // Check if flag was already submitted correctly by this user
    const existingCorrect = await adapter.flagSubmission.findFirst({
      userId, labId, flagKey, correct: true,
    } as Record<string, unknown>);

    if (existingCorrect) {
      await setCsrfCookie();
      const response = NextResponse.json({
        correct: true,
        points: 0,
        alreadyFound: true,
        message: 'Этот флаг уже найден ранее.',
        csrfCookieName: getCsrfCookieName(),
        csrfHeaderName: getCsrfHeaderName(),
      });
      addRateLimitHeaders(response, rl.remaining, rl.reset);
      return response;
    }

    // Find the flag in the database
    const flag = await adapter.labFlag.findFirst({
      labId, flagKey,
    } as Record<string, unknown>);

    if (!flag) {
      await setCsrfCookie();
      const response = NextResponse.json({ correct: false, message: 'Флаг не найден' }, { status: 404 });
      addRateLimitHeaders(response, rl.remaining, rl.reset);
      return response;
    }

    // Use constant-time comparison to prevent timing attacks
    const storedHash = hashFlagValue(flag.flagValue as string);
    const submittedHash = hashFlagValue(flagValue);
    const correct = constantTimeCompare(storedHash, submittedHash);

    // Only record the first attempt and the correct submission
    // Store hashed flag value instead of plaintext
    const previousAttempts = await adapter.flagSubmission.findMany({
      userId, labId, flagKey,
    } as Record<string, unknown>);

    if (previousAttempts.length === 0 || correct) {
      await adapter.flagSubmission.create({
        userId, labId, flagKey, flagValue: submittedHash, correct,
      });
    }

    if (correct) {
      // Update lab progress
      const existing = await adapter.labProgress.findUnique({
        userId, labId,
      } as Record<string, unknown>);

      if (existing) {
        const newFlagsFound = (existing.flagsFound as number) + 1;
        const lab = await adapter.lab.findUnique({ id: labId }, { flags: true });
        const totalFlags = lab?.flags?.length ?? 0;
        const newScore = (existing.score as number) + flag.points;
        const isComplete = newFlagsFound >= totalFlags;

        await adapter.labProgress.update(
          { userId, labId } as Record<string, unknown>,
          {
            flagsFound: newFlagsFound,
            totalFlags,
            score: newScore,
            status: isComplete ? 'completed' : 'in_progress',
            ...(isComplete ? { completedAt: new Date() } : {}),
          }
        );
      } else {
        const lab = await adapter.lab.findUnique({ id: labId }, { flags: true });
        const totalFlags = lab?.flags?.length ?? 0;
        const isComplete = 1 >= totalFlags;

        await adapter.labProgress.create({
          userId, labId,
          flagsFound: 1,
          totalFlags,
          score: flag.points,
          status: isComplete ? 'completed' : 'in_progress',
          startedAt: new Date(),
          ...(isComplete ? { completedAt: new Date() } : {}),
        });
      }
    }

    await setCsrfCookie();
    const response = NextResponse.json({
      correct,
      points: correct ? flag.points : 0,
      message: correct
        ? `Флаг принят! +${flag.points} баллов`
        : 'Неверный флаг. Попробуйте ещё раз.',
      csrfCookieName: getCsrfCookieName(),
      csrfHeaderName: getCsrfHeaderName(),
    });
    addRateLimitHeaders(response, rl.remaining, rl.reset);
    return response;
  } catch (error) {
    logger.error('Flag submission error:', error);
    await setCsrfCookie();
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    addRateLimitHeaders(response, rl.remaining, rl.reset);
    return response;
  }
}
