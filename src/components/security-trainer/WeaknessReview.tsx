'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { buildWeaknessReview } from '@/lib/weakness-review';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/lib/intlStub';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Target,
} from 'lucide-react';

export default function WeaknessReview() {
  const t = useTranslations('review');
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const quizHistory = useAppStore((s) => s.quizHistory);
  const owaspChallengeScores = useAppStore((s) => s.owaspChallengeScores);
  const authChallengeScores = useAppStore((s) => s.authChallengeScores);
  const headersChallengeScores = useAppStore((s) => s.headersChallengeScores);
  const secureCodingChallengeScores = useAppStore((s) => s.secureCodingChallengeScores);
  const awardXP = useAppStore((s) => s.awardXP);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const review = useMemo(
    () =>
      buildWeaknessReview(
        quizHistory,
        owaspChallengeScores,
        authChallengeScores,
        headersChallengeScores,
        secureCodingChallengeScores,
      ),
    [quizHistory, owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores],
  );

  // Filter out already-reviewed items
  const remainingItems = useMemo(
    () => review.items.filter((item) => !reviewedIds.has(item.id)),
    [review.items, reviewedIds],
  );

  // Store original total for accurate percentage calculation on completion
  const originalTotal = review.items.length;

  const currentItem = remainingItems[currentIndex];
  const progress = originalTotal > 0 ? Math.round((correctCount / originalTotal) * 100) : 0;

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  }, [showResult]);

  const handleCheckAnswer = useCallback(() => {
    if (selectedOption === null || !currentItem) return;
    setShowResult(true);

    const isCorrect = selectedOption === currentItem.correctIndex;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      awardXP(5); // Bonus XP for correcting a mistake
    }

    setReviewedIds((prev) => new Set([...prev, currentItem.id]));

    // If this was the last remaining item, mark review as completed
    if (currentIndex >= remainingItems.length - 1) {
      setCompleted(true);
    }
  }, [selectedOption, currentItem, awardXP, currentIndex, remainingItems.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < remainingItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, remainingItems.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setCorrectCount(0);
    setCompleted(false);
    setReviewedIds(new Set());
  }, []);

  // Empty state
  if (review.totalCount === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('back')}>
            <ChevronLeft size={20} />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Target size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('title')}</h1>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <h2 className="font-semibold">{t('noWeaknesses')}</h2>
            <p className="text-sm text-slate-500">{t('noWeaknessesDesc')}</p>
            <Button onClick={() => setCurrentPage('dashboard')} variant="outline">
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    const score = originalTotal > 0 ? Math.round((correctCount / originalTotal) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('back')}>
            <ChevronLeft size={20} />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('title')}</h1>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <Trophy size={48} className="mx-auto text-amber-500" />
            <h2 className="font-semibold text-lg">{t('completed')}</h2>
            <div className="text-4xl font-bold text-amber-600">{score}%</div>
            <p className="text-sm text-slate-600">
              {t('correctCount', { correct: correctCount, total: originalTotal })}
            </p>
            {score === 100 && (
              <Badge className="bg-emerald-600 text-white">{t('perfectScore')}</Badge>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw size={16} className="mr-2" />
                {t('retry')}
              </Button>
              <Button onClick={() => setCurrentPage('dashboard')}>
                {t('backToDashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('back')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500">
              {t('progress')} {currentIndex + 1}/{remainingItems.length}
            </span>
            <span className="text-emerald-600 font-semibold">
              {t('correctCount', { correct: correctCount, total: originalTotal })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-2 mt-3 flex-wrap">
            {Object.entries(review.categoryBreakdown).map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="text-[10px]">
                {cat}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <Card className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={currentItem.type === 'quiz' ? 'default' : 'secondary'} className="text-[10px]">
                  {currentItem.type === 'quiz' ? t('quizType') : t('challengeType')}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {currentItem.category}
                </Badge>
              </div>

              <p className="text-sm font-medium leading-relaxed">{currentItem.question}</p>

              {/* Options */}
              <div className="space-y-2">
                {currentItem.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentItem.correctIndex;
                  let optionClass = 'border-slate-200 hover:border-slate-300';

                  if (showResult) {
                    if (isCorrect) {
                      optionClass = 'border-emerald-400 bg-emerald-50';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'border-red-400 bg-red-50';
                    } else {
                      optionClass = 'border-slate-100 opacity-50';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-emerald-400 bg-emerald-50';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${optionClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                          showResult && isCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showResult && isSelected && !isCorrect
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-slate-300 text-slate-400'
                        }`}>
                          {showResult && isCorrect ? (
                            <CheckCircle2 size={14} />
                          ) : showResult && isSelected && !isCorrect ? (
                            <XCircle size={14} />
                          ) : (
                            String.fromCharCode(65 + idx)
                          )}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed"
                >
                  <p className="font-semibold mb-1">{t('explanation')}</p>
                  {currentItem.explanation}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={14} className="mr-1" />
                  {t('prev')}
                </Button>

                {!showResult ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                    size="sm"
                  >
                    {t('checkAnswer')}
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="sm">
                    {currentIndex < remainingItems.length - 1 ? (
                      <>
                        {t('next')}
                        <ArrowRight size={14} className="ml-1" />
                      </>
                    ) : (
                      <>{t('finish')}</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
