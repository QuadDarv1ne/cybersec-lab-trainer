// ============================================================
// Caesar Cipher
// ============================================================
export function caesarEncrypt(text: string, shift: number): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      return char;
    })
    .join('');
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, (26 - (shift % 26)) % 26);
}

// ============================================================
// Vigenere Cipher
// ============================================================
export function vigenereEncrypt(text: string, key: string): string {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join('');
}

export function vigenereDecrypt(text: string, key: string): string {
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) return text;
  let ki = 0;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        const shift = k.charCodeAt(ki % k.length) - 97;
        ki++;
        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
}

// ============================================================
// XOR Cipher
// ============================================================
export function xorEncrypt(text: string, key: string): string {
  if (!key) return text;
  return text
    .split('')
    .map((char, i) => {
      const xored = char.charCodeAt(0) ^ key.charCodeAt(i % key.length);
      return xored.toString(16).padStart(2, '0');
    })
    .join(' ');
}

export function xorDecrypt(hex: string, key: string): string {
  if (!key) return hex;
  try {
    return hex
      .split(' ')
      .filter((h) => h.length > 0)
      .map((h, i) => String.fromCharCode(parseInt(h, 16) ^ key.charCodeAt(i % key.length)))
      .join('');
  } catch {
    return 'Ошибка декодирования';
  }
}

// ============================================================
// Base64
// ============================================================
export function base64Encode(text: string): string {
  try { return btoa(unescape(encodeURIComponent(text))); }
  catch { return 'Ошибка кодирования'; }
}

export function base64Decode(text: string): string {
  try { return decodeURIComponent(escape(atob(text))); }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// URL Encoding
// ============================================================
export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  try { return decodeURIComponent(text); }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// Hash visualization (simple djb2)
// ============================================================
export function simpleHash(text: string): { md5Like: string; shaLike: string; djb2: string } {
  let h1 = 5381;
  let h2 = 0x6a09e667;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) & 0xffffffff;
    h2 = ((h2 ^ (c << 13)) + (c << 7) + (c >> 2)) & 0xffffffff;
  }
  return {
    md5Like: Math.abs(h1).toString(16).padStart(8, '0').repeat(4),
    shaLike: Math.abs(h2).toString(16).padStart(8, '0').repeat(8),
    djb2: Math.abs(h1).toString(16).padStart(8, '0'),
  };
}
