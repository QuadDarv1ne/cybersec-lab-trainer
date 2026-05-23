import { describe, it, expect } from 'vitest';
import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

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
