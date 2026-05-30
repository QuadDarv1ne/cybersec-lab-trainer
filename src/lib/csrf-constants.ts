/**
 * CSRF string constants — extracted to avoid importing Node.js crypto
 * in client-side modules.
 */
export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}
