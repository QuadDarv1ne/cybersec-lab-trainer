import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateNoteId, getNotesByModule, searchNotes, type Note, type NotesMap } from './notes-system';

describe('notes-system', () => {
  describe('generateNoteId', () => {
    it('generates a unique ID with note- prefix', () => {
      const id = generateNoteId();
      expect(id.startsWith('note-')).toBe(true);
    });

    it('generates unique IDs on subsequent calls', () => {
      const id1 = generateNoteId();
      const id2 = generateNoteId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getNotesByModule', () => {
    const createNote = (overrides: Partial<Note> = {}): Note => ({
      id: generateNoteId(),
      itemId: 'item-1',
      moduleId: 'sql-injection',
      moduleName: 'SQL Injection',
      content: 'Test note',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    });

    it('returns notes filtered by module', () => {
      const notes: NotesMap = {
        'note-1': createNote({ moduleId: 'sql-injection' }),
        'note-2': createNote({ moduleId: 'xss' }),
        'note-3': createNote({ moduleId: 'sql-injection' }),
      };

      const result = getNotesByModule(notes, 'sql-injection');
      expect(result).toHaveLength(2);
      expect(result.every((n) => n.moduleId === 'sql-injection')).toBe(true);
    });

    it('returns empty array when no notes match', () => {
      const notes: NotesMap = {
        'note-1': createNote({ moduleId: 'xss' }),
      };

      const result = getNotesByModule(notes, 'non-existent');
      expect(result).toHaveLength(0);
    });

    it('sorts notes by updatedAt descending', () => {
      const notes: NotesMap = {
        'note-1': createNote({ moduleId: 'owasp', updatedAt: 1000 }),
        'note-2': createNote({ moduleId: 'owasp', updatedAt: 3000 }),
        'note-3': createNote({ moduleId: 'owasp', updatedAt: 2000 }),
      };

      const result = getNotesByModule(notes, 'owasp');
      expect(result[0].updatedAt).toBe(3000);
      expect(result[1].updatedAt).toBe(2000);
      expect(result[2].updatedAt).toBe(1000);
    });
  });

  describe('searchNotes', () => {
    const createNote = (overrides: Partial<Note> = {}): Note => ({
      id: generateNoteId(),
      itemId: 'item-1',
      moduleId: 'sql-injection',
      moduleName: 'SQL Injection',
      content: 'Test SQL note content',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    });

    it('returns all notes sorted by updatedAt when query is empty', () => {
      const notes: NotesMap = {
        'note-1': createNote({ updatedAt: 1000 }),
        'note-2': createNote({ updatedAt: 2000 }),
      };

      const result = searchNotes(notes, '');
      expect(result).toHaveLength(2);
      expect(result[0].updatedAt).toBe(2000);
    });

    it('filters notes by content match', () => {
      const notes: NotesMap = {
        'note-1': createNote({ content: 'SQL injection example', moduleName: 'Module A' }),
        'note-2': createNote({ content: 'XSS attack demo', moduleName: 'Module B' }),
      };

      const result = searchNotes(notes, 'sql');
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain('SQL');
    });

    it('filters notes by moduleName match', () => {
      const notes: NotesMap = {
        'note-1': createNote({ moduleName: 'SQL Injection' }),
        'note-2': createNote({ moduleName: 'XSS Attacks' }),
      };

      const result = searchNotes(notes, 'xss');
      expect(result).toHaveLength(1);
      expect(result[0].moduleName).toContain('XSS');
    });

    it('search is case insensitive', () => {
      const notes: NotesMap = {
        'note-1': createNote({ content: 'UPPERCASE CONTENT' }),
      };

      const result = searchNotes(notes, 'uppercase');
      expect(result).toHaveLength(1);
    });

    it('trims whitespace from query', () => {
      const notes: NotesMap = {
        'note-1': createNote({ content: 'Important note' }),
      };

      const result = searchNotes(notes, '   ');
      expect(result).toHaveLength(1); // Empty after trim, returns all
    });
  });
});
