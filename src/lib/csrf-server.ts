import { cookies } from 'next/headers';
import { generateCsrfToken, hashToken, getCsrfCookieName, getCsrfHeaderName } from './csrf';

/**
 * Set CSRF token as an HTTP-only cookie and return the token value
 * that the client must include in the X-CSRF-Token header.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(getCsrfCookieName(), token, {
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
  const cookieToken = cookieStore.get(getCsrfCookieName())?.value;
  const headerToken = request.headers.get(getCsrfHeaderName());

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const cookieHash = hashToken(cookieToken);
  const headerHash = hashToken(headerToken);

  return cookieHash === headerHash;
}
