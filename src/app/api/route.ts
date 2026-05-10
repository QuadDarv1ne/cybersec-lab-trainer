import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const ip = getClientIP(request);
  const rateLimitResponse = rateLimit(ip);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Add rate limit headers to response
  const response = NextResponse.json({ message: "Hello, world!" });
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT.maxRequests - 1));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(Date.now() / 1000 + RATE_LIMIT.windowMs / 1000)));

  return response;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rateLimitResponse = rateLimit(ip);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    const response = NextResponse.json({ 
      message: "Request received",
      received: body 
    });
    
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT.maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT.maxRequests - 1));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(Date.now() / 1000 + RATE_LIMIT.windowMs / 1000)));

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}