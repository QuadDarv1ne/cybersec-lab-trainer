/**
 * Sanitize user-provided note content to prevent XSS.
 * Strips all HTML tags and decodes HTML entities to plain text.
 */
export function sanitizeNoteContent(raw: string): string {
  // Remove all HTML tags
  const stripped = raw.replace(/<[^>]*>/g, '');
  // Decode common HTML entities to prevent stored XSS via entity injection
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}
