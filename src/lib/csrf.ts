import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Create a CSRF token hash for storage validation.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Set CSRF token as an HTTP-only cookie and return the token value
 * that the client must include in the X-CSRF-Token header.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client JS needs to read it for the header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Validate that the CSRF token from the cookie matches the one from the header.
 * Implements the Double Submit Cookie pattern.
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const cookieHash = hashToken(cookieToken);
  const headerHash = hashToken(headerToken);

  return cookieHash === headerHash;
}

/**
 * Get the CSRF cookie name for client-side reference.
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

/**
 * Get the CSRF header name for client-side reference.
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}
