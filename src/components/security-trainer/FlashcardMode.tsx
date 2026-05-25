'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { glossaryTerms } from '@/lib/data/glossary-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  RotateCcw,
  SkipForward,
  SkipBack,
  Check,
  X,
  HelpCircle,
  Shuffle,
  Trophy,
  Flame,
  Brain,
} from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface FlashcardStats {
  total: number;
  reviewed: number;
  easy: number;
  medium: number;
  hard: number;
  streak: number;
}

export function FlashcardMode() {
  const t = useTranslations('flashcards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Record<string, Difficulty>>({});
  const [showStats, setShowStats] = useState(false);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [studyMode, setStudyMode] = useState<'all' | 'hard'>('all');
  const reducedMotion = useReducedMotion();

  const categories = useMemo(() => {
    const cats = new Set(glossaryTerms.map((term) => term.category));
    return Array.from(cats).sort();
  }, []);

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;
    if (selectedCategory) {
      terms = terms.filter((t) => t.category === selectedCategory);
    }
    if (studyMode === 'hard') {
      const hardIds = Object.entries(difficulty)
        .filter(([, d]) => d === 'hard')
        .map(([id]) => id);
      terms = terms.filter((t) => hardIds.includes(t.id));
    }
    return terms;
  }, [selectedCategory, studyMode, difficulty]);

  const orderedTerms = useMemo(() => {
    if (cardOrder.length === 0 || cardOrder.length !== filteredTerms.length) {
      return filteredTerms;
    }
    return cardOrder.map((i) => filteredTerms[i]).filter(Boolean);
  }, [filteredTerms, cardOrder]);

  const currentTerm = orderedTerms[currentIndex];

  const stats: FlashcardStats = useMemo(() => {
    const values = Object.values(difficulty);
    return {
      total: glossaryTerms.length,
      reviewed: values.length,
      easy: values.filter((d) => d === 'easy').length,
      medium: values.filter((d) => d === 'medium').length,
      hard: values.filter((d) => d === 'hard').length,
      streak: 0,
    };
  }, [difficulty]);

  const shuffleCards = useCallback(() => {
    const indices = Array.from({ length: filteredTerms.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setCardOrder(indices);
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filteredTerms.length]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStart(Date.now());
    if (isShuffled) {
      shuffleCards();
    }
  }, [isShuffled, shuffleCards]);

  const nextCard = useCallback(() => {
    if (currentIndex < orderedTerms.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, orderedTerms.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const markDifficulty = useCallback((diff: Difficulty) => {
    if (!currentTerm) return;
    setDifficulty((prev) => ({ ...prev, [currentTerm.id]: diff }));
    nextCard();
  }, [currentTerm, nextCard]);

  useEffect(() => {
    setCardOrder([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, studyMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard]);

  if (orderedTerms.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center space-y-3">
          <Brain size={40} className="text-slate-300 mx-auto" />
          <h3 className="font-semibold text-sm">{studyMode === 'hard' ? t('noHardCards') : t('noCards')}</h3>
          <p className="text-xs text-slate-500">{t('noCardsDesc')}</p>
          <Button variant="outline" size="sm" onClick={() => { setStudyMode('all'); setSelectedCategory(null); }}>
            <RotateCcw size={14} className="mr-1" /> {t('resetFilters')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentIndex + 1) / orderedTerms.length) * 100;
  const sessionDuration = Math.floor((Date.now() - sessionStart) / 60000);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-violet-500" />
              <h3 className="font-semibold text-sm">{t('title')}</h3>
              <Badge variant="secondary" className="text-[10px]">
                {currentIndex + 1} / {orderedTerms.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={shuffleCards}>
                <Shuffle size={12} className="mr-1" /> {t('shuffle')}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetSession}>
                <RotateCcw size={12} className="mr-1" /> {t('reset')}
              </Button>
              <Button
                variant={showStats ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowStats(!showStats)}
              >
                <Trophy size={12} className="mr-1" /> {t('stats')}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={studyMode === 'all' ? 'default' : 'outline'}
              className="text-[10px] cursor-pointer"
              onClick={() => setStudyMode('all')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStudyMode('all'); } }}
              role="button"
              tabIndex={0}
            >
              {t('allCards')} ({glossaryTerms.length})
            </Badge>
            {stats.hard > 0 && (
              <Badge
                variant={studyMode === 'hard' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer bg-red-50 text-red-700 border-red-200"
                onClick={() => setStudyMode('hard')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStudyMode('hard'); } }}
                role="button"
                tabIndex={0}
              >
                <Flame size={10} className="mr-1" /> {t('hardOnly')} ({stats.hard})
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('categoryFilter')}>
            <Badge
              variant={!selectedCategory ? 'default' : 'outline'}
              className="text-[10px] cursor-pointer"
              onClick={() => setSelectedCategory(null)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCategory(null); } }}
              role="button"
              tabIndex={0}
            >
              {t('allCategories')}
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCategory(selectedCategory === cat ? null : cat); } }}
                role="button"
                tabIndex={0}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <Progress value={progress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Stats panel */}
      {showStats && (
        <motion.div initial={reducedMotion ? {} : { opacity: 0, y: -10 }} animate={reducedMotion ? {} : { opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">{stats.total}</div>
                  <div className="text-[10px] text-slate-500">{t('statTotal')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">{stats.reviewed}</div>
                  <div className="text-[10px] text-slate-500">{t('statReviewed')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-500">{stats.easy}</div>
                  <div className="text-[10px] text-slate-500">{t('statEasy')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-500">{stats.medium}</div>
                  <div className="text-[10px] text-slate-500">{t('statMedium')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-500">{stats.hard}</div>
                  <div className="text-[10px] text-slate-500">{t('statHard')}</div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                {t('sessionTime', { minutes: sessionDuration })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentTerm?.id}-${currentIndex}`}
          initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
          animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
          exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
          transition={reducedMotion ? {} : { duration: 0.2 }}
        >
          <Card
            className="border-violet-200 cursor-pointer select-none min-h-[200px] flex items-center justify-center"
            onClick={() => setIsFlipped(!isFlipped)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
              }
            }}
            aria-label={isFlipped ? t('showTerm') : t('showDefinition')}
          >
            <CardContent className="p-8 text-center space-y-4">
              <Badge variant="secondary" className="text-[10px]">
                {currentTerm?.category}
              </Badge>

              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="term"
                    initial={reducedMotion ? {} : { rotateY: 90 }}
                    animate={reducedMotion ? {} : { rotateY: 0 }}
                    exit={reducedMotion ? {} : { rotateY: -90 }}
                    transition={reducedMotion ? {} : { duration: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-slate-900 font-mono">
                      {currentTerm?.term}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2">{t('clickToFlip')}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="definition"
                    initial={reducedMotion ? {} : { rotateY: 90 }}
                    animate={reducedMotion ? {} : { rotateY: 0 }}
                    exit={reducedMotion ? {} : { rotateY: -90 }}
                    transition={reducedMotion ? {} : { duration: 0.2 }}
                  >
                    <p className="text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                      {currentTerm?.definition}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">{t('clickToFlip')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Difficulty buttons */}
      {isFlipped && (
        <motion.div initial={reducedMotion ? {} : { opacity: 0, y: 10 }} animate={reducedMotion ? {} : { opacity: 1, y: 0 }}>
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-center text-xs text-slate-500 mb-2">{t('rateDifficulty')}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => markDifficulty('easy')}
                >
                  <Check size={14} className="mr-1" /> {t('easy')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => markDifficulty('medium')}
                >
                  <HelpCircle size={14} className="mr-1" /> {t('medium')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-xs border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => markDifficulty('hard')}
                >
                  <X size={14} className="mr-1" /> {t('hard')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="text-xs"
        >
          <SkipBack size={14} className="mr-1" /> {t('previous')}
        </Button>

        <span className="text-xs text-slate-400">
          {t('keyboardHint')}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={nextCard}
          disabled={currentIndex >= orderedTerms.length - 1}
          className="text-xs"
        >
          {t('next')} <SkipForward size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
