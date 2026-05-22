import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCsrfToken, hashToken, getCsrfCookieName, getCsrfHeaderName } from './csrf';
import { setCsrfCookie, validateCsrfToken } from './csrf-server';

// Mock Next.js cookies
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

describe('CSRF Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex token (32 bytes)', () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens each time', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken', () => {
    it('should create a SHA-256 hash (64 hex chars)', () => {
      const hash = hashToken('test-token');
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce consistent hashes for the same input', () => {
      const hash1 = hashToken('same-token');
      const hash2 = hashToken('same-token');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashToken('token-a');
      const hash2 = hashToken('token-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('setCsrfCookie', () => {
    it('should set a cookie with correct attributes', async () => {
      await setCsrfCookie();

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'csrf-token',
        expect.stringMatching(/^[0-9a-f]{64}$/),
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'strict',
          maxAge: 86400,
          path: '/',
        })
      );
    });

    it('should return the generated token', async () => {
      const token = await setCsrfCookie();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  describe('validateCsrfToken', () => {
    it('should return false when no cookie token exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const request = { headers: { get: vi.fn().mockReturnValue('some-token') } } as unknown as Request;

      const result = await validateCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should return false when no header token exists', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'cookie-token' });
      const request = { headers: { get: vi.fn().mockReturnValue(null) } } as unknown as Request;

      const result = await validateCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should return false when tokens do not match', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'cookie-token' });
      const request = { headers: { get: vi.fn().mockReturnValue('different-token') } } as unknown as Request;

      const result = await validateCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should return true when tokens match', async () => {
      const token = 'matching-token-value';
      mockCookieStore.get.mockReturnValue({ value: token });
      const request = { headers: { get: vi.fn().mockReturnValue(token) } } as unknown as Request;

      const result = await validateCsrfToken(request);
      expect(result).toBe(true);
    });
  });

  describe('getCsrfCookieName', () => {
    it('should return the correct cookie name', () => {
      expect(getCsrfCookieName()).toBe('csrf-token');
    });
  });

  describe('getCsrfHeaderName', () => {
    it('should return the correct header name', () => {
      expect(getCsrfHeaderName()).toBe('x-csrf-token');
    });
  });
});
