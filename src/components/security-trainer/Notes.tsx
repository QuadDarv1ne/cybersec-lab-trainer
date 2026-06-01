'use client';

import { useAppStore } from '@/lib/store';
import { modules } from '@/lib/security-data';
import { searchNotes, type NotesMap } from '@/lib/notes-system';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Search, Trash2, Edit2, Check, X, ChevronRight, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, formatDate } from '@/lib/intlStub';

const iconMap: Record<string, React.ReactNode> = {};
for (const mod of modules) {
  iconMap[mod.id] = mod.title;
}

export default function Notes() {
  const notes = useAppStore((s) => s.notes);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const t = useTranslations('notes');
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredNotes = useMemo(() => {
    let result = searchNotes(notes as NotesMap, search);
    if (moduleFilter !== 'all') {
      result = result.filter((n) => n.moduleId === moduleFilter);
    }
    return result;
  }, [notes, search, moduleFilter]);

  const noteCount = Object.keys(notes).length;
  const moduleNoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const note of Object.values(notes)) {
      counts[note.moduleId] = (counts[note.moduleId] || 0) + 1;
    }
    return counts;
  }, [notes]);

  const handleEdit = (noteId: string, content: string) => {
    setEditingId(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editContent.trim()) return;
    updateNote(noteId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <StickyNote size={24} className="text-amber-500" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {noteCount === 0 ? t('noNotes') : t('noteCount', { count: noteCount })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage('dashboard')}>
          <ChevronRight size={14} className="mr-1" /> {t('back')}
        </Button>
      </div>

      {noteCount > 0 && (
        <>
          {/* Search and filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{t('allModules')}</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Module quick nav */}
          <div className="flex flex-wrap gap-1.5">
            {modules
              .filter((m) => moduleNoteCounts[m.id])
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModuleFilter(moduleFilter === m.id ? 'all' : m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    moduleFilter === m.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.title}
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                    {moduleNoteCounts[m.id]}
                  </Badge>
                </button>
              ))}
          </div>
        </>
      )}

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <StickyNote size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              {search || moduleFilter !== 'all'
                ? t('nothingFound')
                : t('appearHere')}
            </p>
            {!search && moduleFilter === 'all' && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setCurrentPage('owasp')}>
                {t('startLearning')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="border-slate-200 bg-yellow-50/20 hover:bg-yellow-50/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <StickyNote size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          {iconMap[note.moduleId] ?? note.moduleId}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {note.itemId}
                        </span>
                      </div>
                      {editingId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveEdit(note.id)}>
                              <Check size={12} className="mr-1" /> {t('save')}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingId(null); setEditContent(''); }}>
                              <X size={12} className="mr-1" /> {t('cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{note.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-slate-400">
                              {formatDate(note.updatedAt)}
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(note.id, note.content)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"
                                aria-label={t('editNote')}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                                aria-label={t('deleteNote')}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
