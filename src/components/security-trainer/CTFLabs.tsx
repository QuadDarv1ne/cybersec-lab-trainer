'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/lib/intlStub';
import { useFlagSubmission } from '@/hooks/use-flag-submission';
import { ctfLabs, DIFFICULTY_META, CATEGORY_META } from '@/lib/data/ctf-labs-data';
import {
  ChevronLeft,
  Flag,
  Target,
  Search,
  Globe,
  Wifi,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface LabFlag {
  flagKey: string;
  points: number;
  hint: string | null;
}

interface LabData {
  id: string;
  number: number;
  title: string;
  description: string;
  goal: string;
  tools: string;
  difficulty: string;
  category: string;
  flags: LabFlag[];
  flagCount?: number;
  totalPoints?: number;
}

// ============================================================
// Icons map
// ============================================================
const ICON_MAP: Record<string, React.ComponentProps<typeof Target>['children']> = {
  Search: <Search size={20} />,
  Target: <Target size={20} />,
  Globe: <Globe size={20} />,
  Wifi: <Wifi size={20} />,
};

// ============================================================
// CTFLabs Component
// ============================================================

export default function CTFLabs({ onBack }: { onBack?: () => void }) {
  const t = useTranslations('ctf');
  const [activeLab, setActiveLab] = useState<number | null>(null);
  const [labs, setLabs] = useState<LabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [foundFlags, setFoundFlags] = useState<Set<string>>(new Set());
  const [labProgress] = useState<Record<string, { flagsFound: number; totalFlags: number; score: number }>>({});

  const { submitFlag, isSubmitting, lastResult, reset: resetFlagResult } = useFlagSubmission();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLabs() {
      try {
        const res = await fetch('/api/flags?action=list-labs', { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        if (!controller.signal.aborted && data.labs) {
          setLabs(data.labs);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Fallback to static data on server error or network failure
        logger.warn('Failed to fetch CTF labs from server, using static data:', error);
        if (!controller.signal.aborted) {
          setLabs(ctfLabs.map(lab => ({
            ...lab,
            flags: [], // flags loaded from server only on submission
          })));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    fetchLabs();

    return () => controller.abort();
  }, []);

  const handleFlagSubmit = useCallback(async (labId: string, flagKey: string) => {
    const value = flagInputs[`${labId}-${flagKey}`]?.trim();
    if (!value) return;

    resetFlagResult();
    const result = await submitFlag(labId, flagKey, value);
    if (result?.correct) {
      setFoundFlags(prev => new Set([...prev, `${labId}-${flagKey}`]));
      setFlagInputs(prev => ({ ...prev, [`${labId}-${flagKey}`]: '' }));
    }
  }, [flagInputs, submitFlag, resetFlagResult]);

  const toggleHint = useCallback((hintKey: string) => {
    setRevealedHints(prev => {
      const next = new Set(prev);
      if (next.has(hintKey)) next.delete(hintKey);
      else next.add(hintKey);
      return next;
    });
  }, []);

  const currentLab = labs.find(l => l.id === `lab-${activeLab}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft size={16} /> {t('back')}
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Flag className="w-7 h-7 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Lab list */}
        {!activeLab && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => {
              const diff = DIFFICULTY_META[lab.difficulty] ?? DIFFICULTY_META.medium;
              const cat = CATEGORY_META[lab.category] ?? CATEGORY_META.web_security;
              const progress = labProgress[lab.id];
              const pct = progress && progress.totalFlags > 0
                ? Math.round((progress.flagsFound / progress.totalFlags) * 100)
                : 0;

              return (
                <motion.div
                  key={lab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700"
                    onClick={() => setActiveLab(lab.number)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${diff.color}`}>
                          {'★'.repeat(diff.stars)}{'☆'.repeat(3 - diff.stars)} {diff.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{cat.label}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{lab.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{lab.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>{lab.flagCount} флагов</span>
                        <span>{lab.totalPoints} очков</span>
                      </div>
                      {pct > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{progress?.flagsFound ?? 0}/{progress?.totalFlags ?? lab.flagCount}</span>
                            <span>{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Single lab view */}
        {activeLab && currentLab && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {ICON_MAP[CATEGORY_META[currentLab.category]?.icon ?? 'Target']}
                    <h2 className="text-xl font-bold">{currentLab.title}</h2>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{currentLab.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4"><strong>Цель:</strong> {currentLab.goal}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><strong>Инструменты:</strong> {currentLab.tools}</p>
                </CardContent>
              </Card>

              {/* Flags */}
              <div className="space-y-4">
                {currentLab.flags.map((flag, i) => {
                  const flagKey = `${currentLab.id}-${flag.flagKey}`;
                  const isFound = foundFlags.has(flagKey);
                  const hintKey = `${currentLab.id}-${flag.flagKey}-hint`;
                  const isHintRevealed = revealedHints.has(hintKey);

                  return (
                    <Card key={flag.flagKey} className={`border-slate-200 dark:border-slate-700 ${isFound ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isFound ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Flag className="w-5 h-5 text-slate-400" />
                            )}
                            <span className="font-medium">{t('flagNumber', { number: i + 1 })}</span>
                            <Badge variant="outline" className="text-xs">{flag.points} {t('points')}</Badge>
                          </div>
                          {isFound && <Badge className="bg-emerald-500 text-white">{t('found')}</Badge>}
                        </div>

                        {!isFound && (
                          <>
                            <div className="flex gap-2 mb-3">
                              <Input
                                placeholder={t('flagPlaceholder')}
                                value={flagInputs[flagKey] ?? ''}
                                onChange={(e) => { setFlagInputs(prev => ({ ...prev, [flagKey]: e.target.value })); resetFlagResult(); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit(currentLab.id, flag.flagKey)}
                                disabled={isSubmitting}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => handleFlagSubmit(currentLab.id, flag.flagKey)}
                                disabled={isSubmitting || !flagInputs[flagKey]?.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('submit')}
                              </Button>
                            </div>

                            {/* Last result message */}
                            {lastResult && lastResult.message && flagInputs[flagKey] && (
                              <p className={`text-xs mb-2 ${lastResult.correct ? 'text-emerald-600' : 'text-red-600'}`}>
                                {lastResult.correct ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                                {lastResult.message}
                              </p>
                            )}

                            {/* Hint */}
                            {flag.hint && (
                              <button
                                onClick={() => toggleHint(hintKey)}
                                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                              >
                                <Lightbulb size={12} />
                                {isHintRevealed ? t('hideHint') : t('showHint')}
                              </button>
                            )}
                            {isHintRevealed && flag.hint && (
                              <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 p-2 rounded mt-1">
                                {flag.hint}
                              </p>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {currentLab.flags.length === 0 && (
                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
                  <CardContent className="p-8 text-center">
                    <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t('noFlags')}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
