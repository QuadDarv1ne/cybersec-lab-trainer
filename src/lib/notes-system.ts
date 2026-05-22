// Notes/Bookmarks system types and utilities

export interface Note {
  id: string;            // unique note ID (UUID)
  itemId: string;        // the module item this note is attached to (e.g., 'a01', 'beginner-1')
  moduleId: string;      // parent module ID (e.g., 'owasp', 'sql-injection')
  moduleName: string;    // human-readable module name
  content: string;       // note text
  createdAt: number;     // timestamp
  updatedAt: number;     // last edit timestamp
}

export type NotesMap = Record<string, Note>; // keyed by note id

// Generate a unique ID using the Web Crypto API
export function generateNoteId(): string {
  return `note-${Date.now()}-${crypto.randomUUID()}`;
}

// Count notes by module
export function getNotesByModule(notes: NotesMap, moduleId: string): Note[] {
  return Object.values(notes)
    .filter((n) => n.moduleId === moduleId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// Search notes by content
export function searchNotes(notes: NotesMap, query: string): Note[] {
  if (!query.trim()) return Object.values(notes).sort((a, b) => b.updatedAt - a.updatedAt);
  const lower = query.toLowerCase();
  return Object.values(notes)
    .filter((n) => n.content.toLowerCase().includes(lower) || n.moduleName.toLowerCase().includes(lower))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
