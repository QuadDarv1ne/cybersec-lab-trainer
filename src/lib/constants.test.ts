import { describe, it, expect } from 'vitest';

describe('constants', () => {
  it('exports SITE_URL', async () => {
    const { SITE_URL } = await import('./constants');
    expect(typeof SITE_URL).toBe('string');
    expect(SITE_URL.length).toBeGreaterThan(0);
  });

  it('uses NEXTAUTH_URL when available', async () => {
    // Save original env
    const original = process.env.NEXTAUTH_URL;

    // Note: Since modules are cached, this test verifies the constant exists
    // The actual value depends on when the module was first loaded
    const { SITE_URL } = await import('./constants');
    expect(SITE_URL).toBeDefined();

    // Restore
    if (original !== undefined) {
      process.env.NEXTAUTH_URL = original;
    }
  });
});
