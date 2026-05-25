/**
 * Sanitize user-provided note content to prevent XSS.
 * Works both client-side (DOMParser) and server-side (regex fallback).
 * Strips all HTML tags and decodes HTML entities safely.
 */
export function sanitizeNoteContent(raw: string): string {
  if (!raw) return '';

  // Server-side (Node.js): DOMParser is not available, use regex-based stripping
  if (typeof DOMParser === 'undefined') {
    return raw
      .replace(/<[^>]*>/g, '') // Strip all HTML tags
      .replace(/&[^;]+;/g, (entity) => { // Decode common HTML entities
        const entities: Record<string, string> = {
          '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
          '&nbsp;': ' ',
        };
        return entities[entity] || '';
      })
      .trim();
  }

  // Client-side (browser): Use DOMParser for robust HTML parsing
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  return doc.body.textContent || '';
}
