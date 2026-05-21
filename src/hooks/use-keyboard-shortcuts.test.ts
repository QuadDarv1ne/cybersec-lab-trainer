import { describe, it, expect } from 'vitest';
import { getShortcutList } from './use-keyboard-shortcuts';

describe('getShortcutList', () => {
  it('returns an array of shortcuts', () => {
    const shortcuts = getShortcutList();
    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it('each shortcut has keys and description', () => {
    const shortcuts = getShortcutList();
    for (const shortcut of shortcuts) {
      expect(shortcut).toHaveProperty('keys');
      expect(shortcut).toHaveProperty('description');
      expect(Array.isArray(shortcut.keys)).toBe(true);
    }
  });

  it('includes navigation shortcuts', () => {
    const shortcuts = getShortcutList();
    const descriptions = shortcuts.map((s) => s.description);

    expect(descriptions).toContain('Navigate to pages');
  });

  it('includes achievements shortcut', () => {
    const shortcuts = getShortcutList();
    const descriptions = shortcuts.map((s) => s.description);

    expect(descriptions).toContain('Open Achievements');
  });

  it('includes escape shortcut', () => {
    const shortcuts = getShortcutList();
    const allKeys = shortcuts.flatMap((s) => s.keys);

    expect(allKeys).toContain('Esc');
  });
});
