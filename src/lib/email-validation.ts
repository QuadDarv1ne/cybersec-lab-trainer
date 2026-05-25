/**
 * Email validation utility using a comprehensive regex pattern.
 * Returns true if the email is valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Get a human-readable validation error message for email.
 * Returns null if the email is valid.
 */
export function getEmailValidationError(email: string): string | null {
  if (!email) return null; // Empty is not an error, just not validated yet

  if (email.length > 254) {
    return 'Email слишком длинный (макс. 254 символа)';
  }

  if (!email.includes('@')) {
    return 'Email должен содержать символ @';
  }

  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return 'Некорректный формат email';
  }

  if (domain.length > 253) {
    return 'Домен слишком длинный (макс. 253 символа)';
  }

  if (!domain.includes('.')) {
    return 'Домен должен содержать хотя бы одну точку';
  }

  if (!isValidEmail(email)) {
    return 'Некорректный формат email';
  }

  return null;
}
