// ============================================================
// Caesar Cipher
// Educational note: The Caesar cipher is one of the simplest substitution ciphers.
// Each letter is shifted by a fixed number of positions in the alphabet.
// Security: NOT secure — only 25 possible keys, trivially brute-forced.
// Historical: Used by Julius Caesar for military communications (~58 BC).
// ============================================================
export function caesarEncrypt(text: string, shift: number): string {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + normalizedShift) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + normalizedShift) % 26) + 97);
      return char;
    })
    .join('');
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, (26 - (shift % 26)) % 26);
}

// ============================================================
// Vigenere Cipher
// Educational note: The Vigenere cipher uses a keyword to shift each letter differently.
// Each letter of the keyword determines the shift for the corresponding plaintext letter.
// Security: NOT secure — can be broken using frequency analysis (Kasiski examination).
// Historical: Considered "unbreakable" for 300 years (1586-1863).
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
// Educational note: XOR (exclusive OR) is a bitwise operation used in many encryption algorithms.
// When applied with a repeating key, it creates a simple stream cipher.
// Security: NOT secure with repeating key — vulnerable to known-plaintext attacks.
// However, XOR with a truly random one-time key (same length as message) is perfectly secure.
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
// Base64 Encoding
// Educational note: Base64 encodes binary data as ASCII text using 64 characters (A-Z, a-z, 0-9, +, /).
// Each 3 bytes of input become 4 characters of output (33% size increase).
// Security: NOT encryption — Base64 is easily reversible. It's encoding, not protection.
// Common uses: Data URLs, email attachments, embedding images in HTML/CSS.
// ============================================================
export function base64Encode(text: string): string {
  try {
    const bytes = new TextEncoder().encode(text);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    return btoa(binary);
  }
  catch { return 'Ошибка кодирования'; }
}

export function base64Decode(text: string): string {
  try {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// URL Encoding (Percent Encoding)
// Educational note: URL encoding replaces special characters with % followed by their hex ASCII code.
// Required for safe transmission of data in URLs (spaces, &, ?, =, etc. have special meaning).
// Security: NOT encryption — fully reversible encoding for data transmission.
// Example: "Hello World!" → "Hello%20World!"
// ============================================================
export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  try { return decodeURIComponent(text); }
  catch { return 'Ошибка декодирования'; }
}

// ============================================================
// Hash Functions
// Educational note: A hash function converts data of any size to a fixed-size output.
// Properties: deterministic, fast, irreversible, collision-resistant.
//
// djb2: Simple educational hash — NOT cryptographically secure.
// SHA-256: Real cryptographic hash (via Web Crypto API) — 256-bit output.
// MD5: Deprecated cryptographic hash — broken, vulnerable to collisions.
// ============================================================
export function simpleHash(text: string): { md5Like: string; shaLike: string; djb2: string } {
  let h1 = 5381;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) & 0xffffffff;
  }
  // djb2 produces a 32-bit value — we pad it to simulate longer outputs
  // Use >>> 0 to convert signed 32-bit to unsigned, avoiding Math.abs(INT_MIN) edge case
  const djb2 = (h1 >>> 0).toString(16).padStart(8, '0');
  return {
    md5Like: djb2.repeat(4),   // 32 chars (simulated MD5 length)
    shaLike: djb2.repeat(8),   // 64 chars (simulated SHA-256 length)
    djb2,
  };
}


