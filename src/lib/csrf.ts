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
