import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';
import { generateCsrfToken, hashToken, getCsrfCookieName, getCsrfHeaderName } from './csrf';

/**
 * Perform constant-time string comparison to prevent timing attacks.
 * Uses crypto.timingSafeEqual under the hood.
 * Pads inputs to the same length to avoid timing leak from length mismatch.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  // Pad both strings to the same length with null bytes
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');
  const aBuf = Buffer.from(aPadded, 'utf8');
  const bBuf = Buffer.from(bPadded, 'utf8');
  return timingSafeEqual(aBuf, bBuf) && a.length === b.length;
}

/**
 * Set CSRF token as an HTTP-only cookie and return the token value
 * that the client must include in the X-CSRF-Token header.
 * Only generates a new token if one doesn't already exist, preventing
 * token rotation during concurrent requests that could cause 403 errors.
 */
export async function setCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(getCsrfCookieName())?.value;

  if (existingToken) {
    // Re-use existing token to prevent concurrent request token mismatch
    return existingToken;
  }

  const token = generateCsrfToken();

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
