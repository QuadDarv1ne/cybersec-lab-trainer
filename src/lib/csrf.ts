import { createHash, randomBytes } from 'crypto';
import { getCsrfCookieName, getCsrfHeaderName } from './csrf-constants';

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

export { getCsrfCookieName, getCsrfHeaderName };
