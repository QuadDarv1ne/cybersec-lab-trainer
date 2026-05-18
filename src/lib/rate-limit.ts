import { NextResponse } from "next/server";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const config: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000,
};

// In-memory fallback store
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanupInterval(): void {
  if (cleanupInterval !== null) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

function stopCleanupInterval(): void {
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', stopCleanupInterval);
  process.on('SIGINT', stopCleanupInterval);
}

startCleanupInterval();

async function inMemoryRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + config.windowMs });
    return { success: true, limit: config.maxRequests, remaining: config.maxRequests - 1, reset: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { success: false, limit: config.maxRequests, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit: config.maxRequests, remaining: config.maxRequests - record.count, reset: record.resetTime };
}

let upstashRatelimit: {
  limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
} | null = null;

async function getUpstashRatelimit() {
  if (upstashRatelimit) return upstashRatelimit;

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const { Redis } = await import('@upstash/redis');
  const { Ratelimit } = await import('@upstash/ratelimit');

  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });

  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs}ms`),
    analytics: true,
    prefix: 'cybersec',
  });

  return upstashRatelimit;
}

export async function rateLimit(ip: string): Promise<{ response: NextResponse | null; remaining: number; reset: number }> {
  const limiter = await getUpstashRatelimit();

  let result: { success: boolean; limit: number; remaining: number; reset: number };

  if (limiter) {
    result = await limiter.limit(ip);
  } else {
    result = await inMemoryRateLimit(ip);
  }

  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil((result.reset - Date.now()) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)) } }
      ),
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return { response: null, remaining: result.remaining, reset: result.reset };
}

export function getClientIP(request: Request): string {
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

export function addRateLimitHeaders(response: NextResponse, remaining: number, reset: number): void {
  response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(reset / 1000)));
}
