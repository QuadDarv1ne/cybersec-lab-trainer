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
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // Hex entities
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10))) // Decimal entities
      .replace(/&([a-zA-Z]+);/g, (_, name) => { // Named entities
        const namedEntities: Record<string, string> = {
          // Basic XML entities
          amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
          // Whitespace
          nbsp: '\u00A0', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009',
          zwnj: '\u200C', zwj: '\u200D', lrm: '\u200E', rlm: '\u200F',
          // Dashes and punctuation
          mdash: '\u2014', ndash: '\u2013', horbar: '\u2015',
          lsquo: '\u2018', rsquo: '\u2019', sbquo: '\u201A',
          ldquo: '\u201C', rdquo: '\u201D', bdquo: '\u201E',
          laquo: '\u00AB', raquo: '\u00BB',
          bull: '\u2022', hellip: '\u2026', prime: '\u2032', Prime: '\u2033',
          // Symbols and currency
          copy: '\u00A9', reg: '\u00AE', trade: '\u2122',
          cent: '\u00A2', pound: '\u00A3', curren: '\u00A4', yen: '\u00A5',
          euro: '\u20AC', sect: '\u00A7', para: '\u00B6',
          deg: '\u00B0', plusmn: '\u00B1', times: '\u00D7', divide: '\u00F7',
          micro: '\u00B5', middot: '\u00B7',
          // Math
          sum: '\u2211', prod: '\u220F', part: '\u2202', int: '\u222B',
          ne: '\u2260', equiv: '\u2261', le: '\u2264', ge: '\u2265',
          // Latin letters with diacritics (common ones)
          agrave: '\u00E0', aacute: '\u00E1', acirc: '\u00E2', atilde: '\u00E3',
          auml: '\u00E4', aring: '\u00E5', aelig: '\u00E6',
          ccedil: '\u00E7', egrave: '\u00E8', eacute: '\u00E9', ecirc: '\u00EA',
          euml: '\u00EB', igrave: '\u00EC', iacute: '\u00ED', icirc: '\u00EE',
          iuml: '\u00EF', eth: '\u00F0', ntilde: '\u00F1',
          ograve: '\u00F2', oacute: '\u00F3', ocirc: '\u00F4', otilde: '\u00F5',
          ouml: '\u00F6', oslash: '\u00F8',
          ugrave: '\u00F9', uacute: '\u00FA', ucirc: '\u00FB', uuml: '\u00FC',
          yacute: '\u00FD', thorn: '\u00FE', yuml: '\u00FF',
          szlig: '\u00DF',
          Agrave: '\u00C0', Aacute: '\u00C1', Acirc: '\u00C2', Atilde: '\u00C3',
          Auml: '\u00C4', Aring: '\u00C5', AElig: '\u00C6',
          Ccedil: '\u00C7', Egrave: '\u00C8', Eacute: '\u00C9', Ecirc: '\u00CA',
          Euml: '\u00CB', Igrave: '\u00CC', Iacute: '\u00CD', Icirc: '\u00CE',
          Iuml: '\u00CF', ETH: '\u00D0', Ntilde: '\u00D1',
          Ograve: '\u00D2', Oacute: '\u00D3', Ocirc: '\u00D4', Otilde: '\u00D5',
          Ouml: '\u00D6', Oslash: '\u00D8',
          Ugrave: '\u00D9', Uacute: '\u00DA', Ucirc: '\u00DB', Uuml: '\u00DC',
          Yacute: '\u00DD', THORN: '\u00DE',
          // Greek letters (common in technical content)
          alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4',
          epsilon: '\u03B5', zeta: '\u03B6', eta: '\u03B7', theta: '\u03B8',
          iota: '\u03B9', kappa: '\u03BA', lambda: '\u03BB', mu: '\u03BC',
          nu: '\u03BD', xi: '\u03BE', pi: '\u03C0', rho: '\u03C1',
          sigma: '\u03C3', tau: '\u03C4', upsilon: '\u03C5', phi: '\u03C6',
          chi: '\u03C7', psi: '\u03C8', omega: '\u03C9',
        };
        return namedEntities[name] || `&${name};`; // Preserve unknown named entities as-is
      })
      .trim();
  }

  // Client-side (browser): Use DOMParser for robust HTML parsing
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  return doc.body.textContent || '';
}
