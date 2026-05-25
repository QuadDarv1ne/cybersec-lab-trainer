/**
 * Sanitize user-provided note content to prevent XSS.
 * Uses DOMParser to safely strip all HTML tags and decode entities.
 */
export function sanitizeNoteContent(raw: string): string {
  if (!raw) return '';

  // Use DOMParser to parse HTML and extract text content
  // This handles nested tags, malformed HTML, and entity decoding safely
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  return doc.body.textContent || '';
}
