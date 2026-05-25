import { describe, it, expect } from 'vitest';
import { sanitizeNoteContent } from './sanitize';

describe('sanitizeNoteContent', () => {
  it('returns plain text unchanged', () => {
    expect(sanitizeNoteContent('hello world')).toBe('hello world');
  });

  it('strips simple HTML tags', () => {
    expect(sanitizeNoteContent('<b>bold</b>')).toBe('bold');
    expect(sanitizeNoteContent('<p>paragraph</p>')).toBe('paragraph');
  });

  it('strips tags with attributes', () => {
    expect(sanitizeNoteContent('<a href="evil.com" onclick="alert(1)">link</a>')).toBe('link');
  });

  it('strips script tags', () => {
    expect(sanitizeNoteContent('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('strips self-closing tags', () => {
    expect(sanitizeNoteContent('text<br/>more')).toBe('textmore');
  });

  it('decodes HTML entities', () => {
    expect(sanitizeNoteContent('&amp; &lt; &gt;')).toBe('& < >');
  });

  it('decodes quote entities', () => {
    expect(sanitizeNoteContent('&quot;hello&#x27;s')).toBe('"hello\'s');
    expect(sanitizeNoteContent('&#39;test&#39;')).toBe("'test'");
  });

  it('handles nested tags', () => {
    expect(sanitizeNoteContent('<div><span>nested</span></div>')).toBe('nested');
  });

  it('handles malformed HTML gracefully', () => {
    expect(sanitizeNoteContent('<div><span>unclosed')).toBe('unclosed');
    expect(sanitizeNoteContent('</broken>')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeNoteContent('')).toBe('');
  });

  it('preserves whitespace and newlines', () => {
    expect(sanitizeNoteContent('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  it('strips event handler attributes in tags', () => {
    expect(sanitizeNoteContent('<img onerror="alert(1)" src="x.png">')).toBe('');
  });

  it('handles mixed HTML and entities', () => {
    expect(sanitizeNoteContent('<p>Hello &amp; <b>World</b></p>')).toBe('Hello & World');
  });
});
