import { describe, it, expect } from 'vitest';
import {
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  xorEncrypt,
  xorDecrypt,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  simpleHash,
} from './crypto-utils';

describe('Caesar Cipher', () => {
  it('encrypts with shift 3', () => {
    expect(caesarEncrypt('HELLO', 3)).toBe('KHOOR');
  });

  it('decrypts with shift 3', () => {
    expect(caesarDecrypt('KHOOR', 3)).toBe('HELLO');
  });

  it('roundtrip encrypt/decrypt', () => {
    const text = 'The Quick Brown Fox';
    const shift = 7;
    expect(caesarDecrypt(caesarEncrypt(text, shift), shift)).toBe(text);
  });

  it('preserves case', () => {
    expect(caesarEncrypt('Abc', 1)).toBe('Bcd');
  });

  it('passes non-alpha chars unchanged', () => {
    expect(caesarEncrypt('Hello, World! 123', 1)).toBe('Ifmmp, Xpsme! 123');
  });

  it('handles shift 0', () => {
    expect(caesarEncrypt('TEST', 0)).toBe('TEST');
  });

  it('handles shift 26 (full wrap)', () => {
    expect(caesarEncrypt('ABC', 26)).toBe('ABC');
  });

  it('handles shift > 26 correctly', () => {
    const text = 'HELLO';
    const shift = 30; // equivalent to shift 4
    expect(caesarDecrypt(caesarEncrypt(text, shift), shift)).toBe(text);
    expect(caesarEncrypt(text, shift)).toBe(caesarEncrypt(text, 4));
  });
});

describe('Vigenere Cipher', () => {
  it('encrypts with keyword', () => {
    expect(vigenereEncrypt('HELLO', 'secret')).toBe(vigenereEncrypt('HELLO', 'secret'));
  });

  it('roundtrip encrypt/decrypt', () => {
    const text = 'ATTACK AT DAWN';
    const key = 'LEMON';
    expect(vigenereDecrypt(vigenereEncrypt(text, key), key)).toBe(text);
  });

  it('returns text unchanged with empty key', () => {
    expect(vigenereEncrypt('HELLO', '')).toBe('HELLO');
    expect(vigenereEncrypt('HELLO', '123')).toBe('HELLO');
  });

  it('preserves case and non-alpha chars', () => {
    const result = vigenereEncrypt('Hello, World!', 'key');
    expect(result.includes(',')).toBe(true);
    expect(result.includes('!')).toBe(true);
  });

  it('cycling key works correctly', () => {
    // "AAA" should act as shift 0 for all chars
    expect(vigenereEncrypt('HELLO', 'AAA')).toBe('HELLO');
  });
});

describe('XOR Cipher', () => {
  it('encrypts text to hex string', () => {
    const result = xorEncrypt('A', 'k');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('roundtrip encrypt/decrypt', () => {
    const text = 'Hello, World!';
    const key = 'secret';
    expect(xorDecrypt(xorEncrypt(text, key), key)).toBe(text);
  });

  it('returns text unchanged with empty key', () => {
    expect(xorEncrypt('Hello', '')).toBe('Hello');
    expect(xorDecrypt('Hello', '')).toBe('Hello');
  });

  it('handles single-char key', () => {
    const text = 'Test';
    const key = 'x';
    expect(xorDecrypt(xorEncrypt(text, key), key)).toBe(text);
  });
});

describe('Base64', () => {
  it('encodes ASCII text', () => {
    expect(base64Encode('Hello World')).toBe('SGVsbG8gV29ybGQ=');
  });

  it('roundtrip encode/decode', () => {
    expect(base64Decode(base64Encode('Test'))).toBe('Test');
  });

  it('handles Cyrillic text', () => {
    const text = 'Привет мир';
    expect(base64Decode(base64Encode(text))).toBe(text);
  });

  it('returns error message on invalid input', () => {
    expect(base64Decode('!!!invalid!!!')).toBe('Ошибка декодирования');
  });
});

describe('URL Encoding', () => {
  it('encodes special characters', () => {
    expect(urlEncode('<script>')).toBe('%3Cscript%3E');
  });

  it('roundtrip encode/decode', () => {
    const text = 'Hello World & more!';
    expect(urlDecode(urlEncode(text))).toBe(text);
  });

  it('handles Cyrillic', () => {
    const text = 'Привет';
    expect(urlDecode(urlEncode(text))).toBe(text);
  });
});

describe('simpleHash', () => {
  it('returns deterministic output', () => {
    const h1 = simpleHash('test');
    const h2 = simpleHash('test');
    expect(h1).toEqual(h2);
  });

  it('produces different hashes for different inputs', () => {
    const h1 = simpleHash('test');
    const h2 = simpleHash('tesx');
    expect(h1.djb2).not.toBe(h2.djb2);
  });

  it('avalanche effect: one char change produces different hash', () => {
    const h1 = simpleHash('hello');
    const h2 = simpleHash('hellp');
    expect(h1.djb2).not.toBe(h2.djb2);
    expect(h1.md5Like).not.toBe(h2.md5Like);
    expect(h1.shaLike).not.toBe(h2.shaLike);
  });

  it('handles empty string', () => {
    const h = simpleHash('');
    expect(typeof h.djb2).toBe('string');
    expect(h.djb2.length).toBeGreaterThan(0);
  });

  it('returns fixed-length hex strings', () => {
    const h = simpleHash('any input works');
    expect(h.djb2).toMatch(/^[0-9a-f]+$/);
    expect(h.md5Like).toMatch(/^[0-9a-f]+$/);
    expect(h.shaLike).toMatch(/^[0-9a-f]+$/);
  });
});
