'use client';

import { useState, useEffect, useMemo } from 'react';
import InlineNotes from './InlineNotes';
import { useAppStore } from '@/lib/store';
import { getOptionStyle } from '@/lib/utils';
import { secureCodingChallenges } from '@/lib/security-data';
import { getHints, getHintLevelLabel, calculateHintPenalty, type HintLevel } from '@/lib/hint-system';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import { logger } from '@/lib/logger';
import {
  ChevronLeft,
  Code,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SecureCodingLab() {
  const t = useTranslations('secureCoding');
  const completeModule = useAppStore((s) => s.completeModule);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const secureCodingChallengeScores = useAppStore((s) => s.secureCodingChallengeScores);
  const setSecureCodingChallengeScore = useAppStore((s) => s.setSecureCodingChallengeScore);
  const recordHintsUsed = useAppStore((s) => s.recordHintsUsed);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<HintLevel>>(new Set());
  const [showHints, setShowHints] = useState(false);

  const challenge = secureCodingChallenges[activeChallenge];

  const hints = useMemo(() => getHints(challenge.id), [challenge.id]);

  const answeredSet = useMemo(() => new Set(secureCodingChallengeScores.answered), [secureCodingChallengeScores.answered]);
  const isAnswered = answeredSet.has(activeChallenge);
  const isCompleted = completedModules.includes('secure-coding');

  // Re-sync local UI state when store values change (e.g., after rehydration)
  useEffect(() => {
    setShowResult(isAnswered);
    if (isAnswered) {
      const selectedIndex = secureCodingChallengeScores.selectedOptions?.[activeChallenge] ?? -1;
      setSelectedOption(selectedIndex >= 0 ? selectedIndex : null);
    } else {
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [secureCodingChallengeScores.answered, secureCodingChallengeScores.selectedOptions, activeChallenge, isAnswered]);

  // Reset hints when switching challenges
  useEffect(() => {
    setRevealedHints(new Set());
    setShowHints(false);
  }, [activeChallenge]);

  // Complete module when all challenges are answered with >= 70% correct
  useEffect(() => {
    if (secureCodingChallengeScores.answered.length === secureCodingChallenges.length &&
        secureCodingChallengeScores.correct >= Math.ceil(secureCodingChallenges.length * 0.7) &&
        !isCompleted) {
      completeModule('secure-coding');
    }
  }, [secureCodingChallengeScores, isCompleted, completeModule]);

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        {t('noChallenges')}
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const revealHint = (level: HintLevel) => {
    const newRevealed = new Set([...revealedHints, level]);
    setRevealedHints(newRevealed);
    setShowHints(true);
    recordHintsUsed('secure-coding', activeChallenge, [...newRevealed]);
    logger.info(`Hint level ${level} revealed for challenge:`, challenge.id);
  };

  const navigateToChallenge = (index: number) => {
    setActiveChallenge(index);
    const answeredSet = new Set(secureCodingChallengeScores.answered);
    const isAnswered = answeredSet.has(index);
    if (isAnswered) {
      const selectedIndex = secureCodingChallengeScores.selectedOptions?.[index] ?? -1;
      setSelectedOption(selectedIndex >= 0 ? selectedIndex : null);
    } else {
      setSelectedOption(null);
    }
    setShowResult(isAnswered);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    const currentChallenge = secureCodingChallenges[activeChallenge];
    const isCorrect = currentChallenge.options[selectedOption].correct;
    const newScores = {
      correct: secureCodingChallengeScores.correct + (isCorrect ? 1 : 0),
      answered: [...secureCodingChallengeScores.answered, activeChallenge],
      selectedOptions: { ...secureCodingChallengeScores.selectedOptions, [activeChallenge]: selectedOption },
    };
    setSecureCodingChallengeScore(newScores.correct, newScores.answered, newScores.selectedOptions);
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (activeChallenge < secureCodingChallenges.length - 1) {
      navigateToChallenge(activeChallenge + 1);
    }
  };

  const prevChallenge = () => {
    if (activeChallenge > 0) {
      navigateToChallenge(activeChallenge - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('backToDashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Code size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {t('taskNumber', { number: activeChallenge + 1, total: secureCodingChallenges.length })}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                <CheckCircle2 size={12} className="inline mr-1" /> {secureCodingChallengeScores.correct} {t('correct')}
              </Badge>
              {isCompleted && <Badge className="bg-emerald-600 text-white">{t('moduleComplete')}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {secureCodingChallenges.map((challenge, i) => (
              <button
                key={challenge.id}
                onClick={() => navigateToChallenge(i)}
                aria-label={`Перейти к заданию ${i + 1}: ${challenge.title}`}
                className={`flex-1 h-2 rounded-full transition-all ${
                  secureCodingChallengeScores.answered.includes(i)
                    ? 'bg-emerald-500'
                    : i === activeChallenge
                      ? 'bg-emerald-300'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge */}
      <motion.div
        key={activeChallenge}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-[10px]">
                {challenge.category}
              </Badge>
              <span className="text-xs text-slate-400">Code review</span>
            </div>
            <h2 className="font-semibold mb-3">{challenge.title}</h2>

            {/* Vulnerable code */}
            <CodeBlock code={challenge.code} language="javascript" title="vulnerable.js" />

            {/* Hints section */}
            {!isAnswered && (
              <div className="mt-4">
                <button
                  onClick={() => setShowHints((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Lightbulb size={14} />
                  {showHints ? 'Hide hints' : 'Show hints'}
                  {revealedHints.size > 0 && (
                    <span className="text-[10px] text-amber-500">
                      ({revealedHints.size}/{hints.length} revealed)
                    </span>
                  )}
                  {showHints ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                {showHints && (
                  <div className="mt-2 space-y-1.5">
                    {hints.map((hint) => {
                      const isRevealed = revealedHints.has(hint.level);
                      return (
                        <div
                          key={hint.level}
                          className={`rounded-lg border transition-colors ${
                            isRevealed
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          {!isRevealed ? (
                            <button
                              onClick={() => revealHint(hint.level)}
                              className="w-full text-left p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-amber-50/50 rounded-lg transition-colors"
                            >
                              <span className="font-medium text-slate-700">
                                {getHintLevelLabel(hint.level)}
                              </span>
                              <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
                                -{Math.round(hint.xpReduction * 100)}% XP
                              </span>
                            </button>
                          ) : (
                            <div className="p-2.5">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-semibold text-amber-700">
                                  {getHintLevelLabel(hint.level)}
                                </span>
                                <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
                                  -{Math.round(hint.xpReduction * 100)}% XP
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{hint.text}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {revealedHints.size > 0 && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t('hintsPenaltyInfo', { percent: Math.round((1 - calculateHintPenalty(revealedHints)) * 100) })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3">What needs to be fixed?</h3>
              <div className="space-y-2">
                {challenge.options.map((option, i) => {
                  const optionStyle = getOptionStyle(isAnswered, option.correct, selectedOption === i);

                  return (
                    <button
                      key={`${challenge.id}-${i}`}
                      onClick={() => handleSelectOption(i)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isAnswered && option.correct
                              ? 'border-emerald-500 bg-emerald-500'
                              : isAnswered && selectedOption === i && !option.correct
                                ? 'border-red-500 bg-red-500'
                                : selectedOption === i
                                  ? 'border-emerald-500 bg-emerald-100'
                                  : 'border-slate-300'
                          }`}
                        >
                          {(isAnswered && option.correct) && <CheckCircle2 size={14} className="text-white" />}
                          {isAnswered && selectedOption === i && !option.correct && (
                            <XCircle size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check button */}
            {!isAnswered && (
              <Button
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
              >
                {t('checkAnswer')}
              </Button>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {showResult && selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div
                    className={`rounded-lg p-4 ${
                      challenge.options[selectedOption].correct
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1 flex items-center gap-1 ${
                        challenge.options[selectedOption].correct
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {challenge.options[selectedOption].correct
                        ? <><CheckCircle2 size={14} /> Correct!</>
                        : <><XCircle size={14} /> Incorrect</>}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{challenge.explanation}</p>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevChallenge}
                      disabled={activeChallenge === 0}
                    >
                      <ArrowLeft size={14} className="mr-1" /> {t('back')}
                    </Button>
                    {activeChallenge < secureCodingChallenges.length - 1 ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={nextChallenge}
                      >
                        {t('next')} <ArrowRight size={14} className="ml-1" />
                      </Button>
                    ) : (
                      <Badge className="bg-emerald-600 text-white py-1.5">
                        {t('allComplete')}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      {challenge && <InlineNotes itemId={challenge.id} moduleId="secure-coding" moduleName={t('title')} />}
    </div>
  );
}
