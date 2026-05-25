/**
 * Sanitize user-provided note content to prevent XSS.
 * Strips all HTML tags, leaving plain text.
 */
export function sanitizeNoteContent(raw: string): string {
  return raw.replace(/<[^>]*>/g, '');
}
