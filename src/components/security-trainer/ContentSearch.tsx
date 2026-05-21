'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppStore, type PageType } from '@/lib/store';
import { modules, achievements, glossaryTerms } from '@/lib/security-data';
import { quizCategories, quizQuestions } from '@/lib/data/quiz-data';
import { owaspTopics, owaspChallenges, sqlChallenges, csrfChallenges, authChallenges, secureCodingChallenges, securityHeaders, headerChallenges } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, BookOpen, HelpCircle, Shield, Database, Link, Lock, Code, ShieldAlert, ChevronRight, KeyRound, Trophy } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'module' | 'glossary' | 'quiz' | 'challenge' | 'achievement' | 'owasp';
  title: string;
  description: string;
  category: string;
  page: PageType | null;
  icon: string;
  score: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield size={16} />,
  Database: <Database size={16} />,
  FileText: <FileText size={16} />,
  Link: <Link size={16} />,
  Lock: <Lock size={16} />,
  Code: <Code size={16} />,
  KeyRound: <KeyRound size={16} />,
  ShieldAlert: <ShieldAlert size={16} />,
  HelpCircle: <HelpCircle size={16} />,
  BookOpen: <BookOpen size={16} />,
  Trophy: <Trophy size={16} />,
};

const typeLabels: Record<SearchResult['type'], string> = {
  module: 'Модуль',
  glossary: 'Глоссарий',
  quiz: 'Квиз',
  challenge: 'Задание',
  achievement: 'Достижение',
  owasp: 'OWASP',
};

const typeColors: Record<SearchResult['type'], string> = {
  module: 'bg-emerald-100 text-emerald-700',
  glossary: 'bg-sky-100 text-sky-700',
  quiz: 'bg-amber-100 text-amber-700',
  challenge: 'bg-violet-100 text-violet-700',
  achievement: 'bg-rose-100 text-rose-700',
  owasp: 'bg-orange-100 text-orange-700',
};

/**
 * Builds a search index from all available content.
 */
function buildSearchIndex(): SearchResult[] {
  const index: SearchResult[] = [];

  // Modules
  for (const mod of modules) {
    index.push({
      id: `module-${mod.id}`,
      type: 'module',
      title: mod.title,
      description: mod.description,
      category: 'Модули',
      page: mod.id as PageType,
      icon: mod.icon,
      score: 0,
    });
  }

  // Glossary
  for (const term of glossaryTerms) {
    index.push({
      id: `glossary-${term.id}`,
      type: 'glossary',
      title: term.term,
      description: term.definition,
      category: term.category,
      page: 'achievements',
      icon: 'BookOpen',
      score: 0,
    });
  }

  // Quiz categories and questions
  for (const cat of quizCategories) {
    index.push({
      id: `quiz-${cat.id}`,
      type: 'quiz',
      title: cat.name,
      description: `${cat.count} вопросов по теме`,
      category: 'Квизы',
      page: 'quiz',
      icon: cat.icon,
      score: 0,
    });
  }

  for (const q of quizQuestions) {
    index.push({
      id: `quiz-q-${q.id}`,
      type: 'quiz',
      title: q.question,
      description: q.options.join('; '),
      category: q.category,
      page: 'quiz',
      icon: 'HelpCircle',
      score: 0,
    });
  }

  // Achievements
  for (const a of achievements) {
    index.push({
      id: `achievement-${a.id}`,
      type: 'achievement',
      title: a.title,
      description: a.description,
      category: 'Достижения',
      page: 'achievements',
      icon: 'Trophy',
      score: 0,
    });
  }

  // OWASP topics
  for (const topic of owaspTopics) {
    index.push({
      id: `owasp-${topic.id}`,
      type: 'owasp',
      title: topic.title,
      description: topic.description,
      category: 'OWASP Top 10',
      page: 'owasp',
      icon: 'Shield',
      score: 0,
    });
  }

  // OWASP challenges
  for (const ch of owaspChallenges) {
    index.push({
      id: `owasp-ch-${ch.id}`,
      type: 'challenge',
      title: ch.title,
      description: ch.question,
      category: 'OWASP Задания',
      page: 'owasp',
      icon: 'Shield',
      score: 0,
    });
  }

  // SQL challenges
  for (const ch of sqlChallenges) {
    index.push({
      id: `sql-${ch.id}`,
      type: 'challenge',
      title: ch.title,
      description: ch.description,
      category: 'SQL Injection',
      page: 'sql-injection',
      icon: 'Database',
      score: 0,
    });
  }

  // CSRF challenges
  for (const ch of csrfChallenges) {
    index.push({
      id: `csrf-${ch.id}`,
      type: 'challenge',
      title: ch.title,
      description: ch.description,
      category: 'CSRF',
      page: 'csrf',
      icon: 'Link',
      score: 0,
    });
  }

  // Auth challenges
  for (const ch of authChallenges) {
    index.push({
      id: `auth-${ch.id}`,
      type: 'challenge',
      title: ch.title,
      description: ch.scenario,
      category: 'Auth Security',
      page: 'auth',
      icon: 'Lock',
      score: 0,
    });
  }

  // Secure coding challenges
  for (const ch of secureCodingChallenges) {
    index.push({
      id: `secure-coding-${ch.id}`,
      type: 'challenge',
      title: ch.title,
      description: `Задание: ${ch.category}`,
      category: 'Secure Coding',
      page: 'secure-coding',
      icon: 'Code',
      score: 0,
    });
  }

  // Security headers
  for (const h of securityHeaders) {
    index.push({
      id: `header-${h.id}`,
      type: 'challenge',
      title: h.title,
      description: h.description,
      category: 'Security Headers',
      page: 'security-headers',
      icon: 'ShieldAlert',
      score: 0,
    });
  }

  // Header challenges
  for (const ch of headerChallenges) {
    index.push({
      id: `header-ch-${ch.id}`,
      type: 'challenge',
      title: ch.question,
      description: ch.explanation,
      category: 'Header Challenges',
      page: 'security-headers',
      icon: 'ShieldAlert',
      score: 0,
    });
  }

  return index;
}

/**
 * Simple fuzzy search scoring.
 */
function scoreResult(query: string, result: SearchResult): number {
  const q = query.toLowerCase();
  const title = result.title.toLowerCase();
  const desc = result.description.toLowerCase();

  let score = 0;

  // Exact title match (highest priority)
  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 80;
  else if (title.includes(q)) score += 60;

  // Description match
  if (desc.includes(q)) score += 20;

  // Word-level matching for multi-word queries
  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (title.includes(word)) score += 10;
    if (desc.includes(word)) score += 5;
  }

  return score;
}

interface ContentSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function ContentSearch({ open, onClose }: ContentSearchProps) {
  const { setCurrentPage } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLButtonElement[]>([]);
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const scored = searchIndex
      .map((item) => ({ ...item, score: scoreResult(query, item) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return scored;
  }, [query, searchIndex]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.page) {
      setCurrentPage(result.page);
    }
    onClose();
  }, [setCurrentPage, onClose]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Keyboard handler: Escape to close, arrows to navigate, Enter to select
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }, [onClose, results, activeIndex, handleSelect]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Search modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Поиск по контенту"
            onKeyDown={handleKeyDown}
          >
            <Card className="border-slate-200 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Поиск по модулям, глоссарию, челленджам..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0 h-8 w-8"
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {query.length >= 2 && results.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Ничего не найдено по запросу «{query}»
                    </div>
                  )}

                  {query.length < 2 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Введите минимум 2 символа для поиска
                    </div>
                  )}

                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      ref={(el) => { if (el) resultsRef.current[idx] = el; }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-slate-50 last:border-b-0 ${
                        idx === activeIndex ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {iconMap[result.icon] || <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-slate-400 truncate">{result.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className={`text-[10px] ${typeColors[result.type]}`}>
                          {typeLabels[result.type]}
                        </Badge>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Esc для закрытия</span>
                  <span>{results.length} результатов</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
