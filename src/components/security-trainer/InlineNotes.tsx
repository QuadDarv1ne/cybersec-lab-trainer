'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

interface InlineNotesProps {
  itemId: string;
  moduleId: string;
  moduleName: string;
}

export default function InlineNotes({ itemId, moduleId, moduleName }: InlineNotesProps) {
  const { addNote, updateNote, deleteNote, getNotesForItem } = useAppStore();
  const itemNotes = getNotesForItem(itemId);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addNote(itemId, moduleId, moduleName, newContent.trim());
    setNewContent('');
    setShowAdd(false);
  };

  const handleUpdate = (noteId: string) => {
    if (!editContent.trim()) return;
    updateNote(noteId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const startEdit = (noteId: string, content: string) => {
    setEditingId(noteId);
    setEditContent(content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (itemNotes.length === 0 && !showAdd) {
    return (
      <button
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
      >
        <StickyNote size={14} />
        <span>Добавить заметку</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Add new note */}
      {showAdd && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3 space-y-2">
            <Textarea
              placeholder="Ваша заметка..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="text-sm min-h-[60px] resize-none bg-white"
              rows={2}
              autoFocus
            />
            <div className="flex gap-1.5">
              <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleAdd}>
                <Check size={12} className="mr-1" /> Сохранить
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowAdd(false); setNewContent(''); }}>
                <X size={12} className="mr-1" /> Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing notes */}
      {itemNotes.map((note) => (
        <Card key={note.id} className="border-slate-200 bg-yellow-50/30">
          <CardContent className="p-3">
            {editingId === note.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm min-h-[60px] resize-none bg-white"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleUpdate(note.id)}>
                    <Check size={12} className="mr-1" /> Сохранить
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}>
                    <X size={12} className="mr-1" /> Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <StickyNote size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{note.content}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(note.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(note.id, note.content)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"
                    aria-label="Edit note"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add more button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <Plus size={12} />
          <span>Ещё заметку</span>
        </button>
      )}
    </div>
  );
}
