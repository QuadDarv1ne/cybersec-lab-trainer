import { describe, it, expect } from 'vitest';
import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

// Recursively collect all dot-separated keys from a nested object
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('i18n key parity', () => {
  it('ru and en have the same top-level namespaces', () => {
    const ruKeys = Object.keys(ru).sort();
    const enKeys = Object.keys(en).sort();
    expect(ruKeys).toEqual(enKeys);
  });

  it('ru and en have all nested keys in sync', () => {
    const ruAllKeys = collectKeys(ru).sort();
    const enAllKeys = collectKeys(en).sort();
    const missingInEn = ruAllKeys.filter((k) => !enAllKeys.includes(k));
    const missingInRu = enAllKeys.filter((k) => !ruAllKeys.includes(k));
    expect(missingInEn).toEqual([]);
    expect(missingInRu).toEqual([]);
  });
});

describe('i18n completeness', () => {
  it('has notes translations in ru', () => {
    expect(ru.notes.title).toBeDefined();
    expect(ru.notes.searchPlaceholder).toBeDefined();
    expect(ru.notes.save).toBeDefined();
    expect(ru.notes.cancel).toBeDefined();
    expect(ru.notes.editNote).toBeDefined();
    expect(ru.notes.deleteNote).toBeDefined();
  });

  it('has notes translations in en', () => {
    expect(en.notes.title).toBeDefined();
    expect(en.notes.searchPlaceholder).toBeDefined();
    expect(en.notes.save).toBeDefined();
    expect(en.notes.cancel).toBeDefined();
    expect(en.notes.editNote).toBeDefined();
    expect(en.notes.deleteNote).toBeDefined();
  });

  it('has inlineNotes translations in ru', () => {
    expect(ru.inlineNotes.addNote).toBeDefined();
    expect(ru.inlineNotes.addAnother).toBeDefined();
    expect(ru.inlineNotes.placeholder).toBeDefined();
  });

  it('has inlineNotes translations in en', () => {
    expect(en.inlineNotes.addNote).toBeDefined();
    expect(en.inlineNotes.addAnother).toBeDefined();
    expect(en.inlineNotes.placeholder).toBeDefined();
  });

  it('has achievement level messages in ru', () => {
    expect(ru.achievements.securityLevel).toBeDefined();
    expect(ru.achievements.levelMessages.zero).toBeDefined();
    expect(ru.achievements.levelMessages.few).toBeDefined();
    expect(ru.achievements.levelMessages.many).toBeDefined();
    expect(ru.achievements.levelMessages.all).toBeDefined();
  });

  it('has achievement level messages in en', () => {
    expect(en.achievements.securityLevel).toBeDefined();
    expect(en.achievements.levelMessages.zero).toBeDefined();
    expect(en.achievements.levelMessages.few).toBeDefined();
    expect(en.achievements.levelMessages.many).toBeDefined();
    expect(en.achievements.levelMessages.all).toBeDefined();
  });

  it('ru and en notes have same keys', () => {
    expect(Object.keys(ru.notes).sort()).toEqual(Object.keys(en.notes).sort());
  });

  it('ru and en inlineNotes have same keys', () => {
    expect(Object.keys(ru.inlineNotes).sort()).toEqual(Object.keys(en.inlineNotes).sort());
  });
});
