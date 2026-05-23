import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';
import { generateCsrfToken, hashToken, getCsrfCookieName, getCsrfHeaderName } from './csrf';

/**
 * Perform constant-time string comparison to prevent timing attacks.
 * Uses crypto.timingSafeEqual under the hood.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Set CSRF token as an HTTP-only cookie and return the token value
 * that the client must include in the X-CSRF-Token header.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(getCsrfCookieName(), token, {
    httpOnly: false, // Client JS needs to read it for the Double Submit Cookie pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Validate that the CSRF token from the cookie matches the one from the header.
 * Implements the Double Submit Cookie pattern with constant-time comparison.
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(getCsrfCookieName())?.value;
  const headerToken = request.headers.get(getCsrfHeaderName());

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Hash tokens first, then use constant-time comparison on hashes
  const cookieHash = hashToken(cookieToken);
  const headerHash = hashToken(headerToken);

  return constantTimeCompare(cookieHash, headerHash);
}
