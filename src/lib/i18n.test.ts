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

  it('has search translations in ru', () => {
    expect(ru.search.ariaLabel).toBeDefined();
    expect(ru.search.placeholder).toBeDefined();
    expect(ru.search.noResults).toBeDefined();
    expect(ru.search.minChars).toBeDefined();
    expect(ru.search.escClose).toBeDefined();
    expect(ru.search.resultsCount).toBeDefined();
    expect(ru.search.typeLabels.module).toBeDefined();
    expect(ru.search.typeLabels.glossary).toBeDefined();
    expect(ru.search.typeLabels.challenge).toBeDefined();
  });

  it('has search translations in en', () => {
    expect(en.search.ariaLabel).toBeDefined();
    expect(en.search.placeholder).toBeDefined();
    expect(en.search.noResults).toBeDefined();
    expect(en.search.minChars).toBeDefined();
    expect(en.search.escClose).toBeDefined();
    expect(en.search.resultsCount).toBeDefined();
    expect(en.search.typeLabels.module).toBeDefined();
    expect(en.search.typeLabels.glossary).toBeDefined();
    expect(en.search.typeLabels.challenge).toBeDefined();
  });

  it('has heatmap translations in ru', () => {
    expect(ru.heatmap.title).toBeDefined();
    expect(ru.heatmap.duration).toBeDefined();
    expect(ru.heatmap.noActivity).toBeDefined();
    expect(ru.heatmap.levelLabels['0']).toBeDefined();
    expect(ru.heatmap.levelLabels['4']).toBeDefined();
    expect(ru.heatmap.days.mon).toBeDefined();
    expect(ru.heatmap.tooltip.withActivity).toBeDefined();
  });

  it('has heatmap translations in en', () => {
    expect(en.heatmap.title).toBeDefined();
    expect(en.heatmap.duration).toBeDefined();
    expect(en.heatmap.noActivity).toBeDefined();
    expect(en.heatmap.levelLabels['0']).toBeDefined();
    expect(en.heatmap.levelLabels['4']).toBeDefined();
    expect(en.heatmap.days.mon).toBeDefined();
    expect(en.heatmap.tooltip.withActivity).toBeDefined();
  });

  it('has error translations in ru', () => {
    expect(ru.error.title).toBeDefined();
    expect(ru.error.description).toBeDefined();
    expect(ru.error.showDetails).toBeDefined();
    expect(ru.error.hideDetails).toBeDefined();
    expect(ru.error.reload).toBeDefined();
    expect(ru.error.home).toBeDefined();
  });

  it('has error translations in en', () => {
    expect(en.error.title).toBeDefined();
    expect(en.error.description).toBeDefined();
    expect(en.error.showDetails).toBeDefined();
    expect(en.error.hideDetails).toBeDefined();
    expect(en.error.reload).toBeDefined();
    expect(en.error.home).toBeDefined();
  });

  it('has dashboard weaknessReview translations in ru', () => {
    expect(ru.dashboard.weaknessReview.ariaLabel).toBeDefined();
    expect(ru.dashboard.weaknessReview.title).toBeDefined();
    expect(ru.dashboard.weaknessReview.hasWeaknesses).toBeDefined();
    expect(ru.dashboard.weaknessReview.noWeaknesses).toBeDefined();
    expect(ru.dashboard.weaknessReview.xpBonus).toBeDefined();
  });

  it('has dashboard weaknessReview translations in en', () => {
    expect(en.dashboard.weaknessReview.ariaLabel).toBeDefined();
    expect(en.dashboard.weaknessReview.title).toBeDefined();
    expect(en.dashboard.weaknessReview.hasWeaknesses).toBeDefined();
    expect(en.dashboard.weaknessReview.noWeaknesses).toBeDefined();
    expect(en.dashboard.weaknessReview.xpBonus).toBeDefined();
  });

  it('has dashboard exportImport translations in ru', () => {
    expect(ru.dashboard.exportImport.title).toBeDefined();
    expect(ru.dashboard.exportImport.description).toBeDefined();
    expect(ru.dashboard.exportImport.export).toBeDefined();
    expect(ru.dashboard.exportImport.import).toBeDefined();
  });

  it('has dashboard exportImport translations in en', () => {
    expect(en.dashboard.exportImport.title).toBeDefined();
    expect(en.dashboard.exportImport.description).toBeDefined();
    expect(en.dashboard.exportImport.export).toBeDefined();
    expect(en.dashboard.exportImport.import).toBeDefined();
  });
});
