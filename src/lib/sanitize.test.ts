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

  it('decodes hex numeric entities', () => {
    expect(sanitizeNoteContent('&#xA9;')).toBe('\u00A9'); // ©
    expect(sanitizeNoteContent('&#x3C;')).toBe('<');
    expect(sanitizeNoteContent('&#x2014;')).toBe('\u2014'); // —
  });

  it('decodes decimal numeric entities', () => {
    expect(sanitizeNoteContent('&#169;')).toBe('\u00A9'); // ©
    expect(sanitizeNoteContent('&#8212;')).toBe('\u2014'); // —
    expect(sanitizeNoteContent('&#60;')).toBe('<');
  });

  it('decodes common named entities', () => {
    expect(sanitizeNoteContent('&copy; &reg; &trade;')).toBe('\u00A9 \u00AE \u2122');
    expect(sanitizeNoteContent('&mdash; &ndash; &hellip;')).toBe('\u2014 \u2013 \u2026');
    expect(sanitizeNoteContent('&laquo; text &raquo;')).toBe('\u00AB text \u00BB');
    expect(sanitizeNoteContent('&euro; &pound; &yen;')).toBe('\u20AC \u00A3 \u00A5');
  });

  it('preserves unknown named entities as-is', () => {
    expect(sanitizeNoteContent('&unknown;')).toBe('&unknown;');
    expect(sanitizeNoteContent('&foo; bar')).toBe('&foo; bar');
  });

  it('handles entities mixed with text', () => {
    expect(sanitizeNoteContent('Copyright &copy; 2024 &mdash; All rights reserved')).toBe(
      'Copyright \u00A9 2024 \u2014 All rights reserved'
    );
  });

  it('strips entity-encoded HTML tags (strip→decode→strip cycle)', () => {
    expect(sanitizeNoteContent('&lt;b&gt;text&lt;/b&gt;')).toBe('text');
  });

  it('strips entity-encoded script tags safely', () => {
    expect(sanitizeNoteContent('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('alert(1)');
  });

  it('strips double-encoded XSS: &amp;lt;script&amp;gt;', () => {
    // &amp;lt;script&amp;gt; → &lt;script&gt; → <script> → stripped
    expect(sanitizeNoteContent('&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;')).toBe('alert(1)');
  });

  it('strips double-encoded img with onerror', () => {
    // &amp;lt;img src=x onerror=alert(1)&amp;gt; → stripped after two passes
    expect(sanitizeNoteContent('&amp;lt;img src=x onerror=&quot;alert(1)&quot;&amp;gt;')).toBe('');
  });

  it('strips triple-encoded XSS', () => {
    // Triple encoding: &amp;amp;lt;script&amp;amp;gt; → &amp;lt;script&amp;gt; → &lt;script&gt; → <script> → stripped
    // Note: Our implementation does strip→decode→strip (one decode pass),
    // so triple-encoded becomes double-decoded text (safe, no executable tags)
    const result = sanitizeNoteContent('&amp;amp;lt;script&amp;amp;gt;alert(1)&amp;amp;lt;/script&amp;amp;gt;');
    // After first strip: &amp;amp;lt;script&amp;amp;gt;alert(1)&amp;amp;lt;/script&amp;amp;gt; (no literal tags)
    // After decode: &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;
    // After second strip: &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt; (no literal tags revealed)
    // Result contains no executable scripts — text is safe
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert(1)');
  });

  it('strips entity-encoded event handlers', () => {
    // &lt;div onclick=&quot;alert(1)&quot;&gt; → stripped
    expect(sanitizeNoteContent('&lt;div onclick=&quot;alert(1)&quot;&gt;text&lt;/div&gt;')).toBe('text');
  });

  it('handles nested entity-encoded tags', () => {
    expect(sanitizeNoteContent('&lt;div&gt;&lt;span&gt;nested&lt;/span&gt;&lt;/div&gt;')).toBe('nested');
  });
});
