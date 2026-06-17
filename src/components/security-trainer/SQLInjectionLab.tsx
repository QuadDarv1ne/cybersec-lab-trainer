'use client';

import { useState, useEffect } from 'react';
import InlineNotes from './InlineNotes';
import { useAppStore } from '@/lib/store';
import { sqlChallenges } from '@/lib/security-data';
import { useTranslations } from '@/lib/intlStub';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Play, Eye, EyeOff, Lightbulb, AlertTriangle, Zap } from 'lucide-react';

export default function SQLInjectionLab() {
  const sqlCompletedLevels = useAppStore((s) => s.sqlCompletedLevels);
  const addSqlLevel = useAppStore((s) => s.addSqlLevel);
  const completeModule = useAppStore((s) => s.completeModule);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const completedModules = useAppStore((s) => s.completedModules);
  const t = useTranslations('sqlInjection');
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

const challenge = sqlChallenges[activeChallenge];

  const isCompleted = challenge ? sqlCompletedLevels.includes(challenge.id) : false;
  const allCompleted = sqlCompletedLevels.length === sqlChallenges.length;
  const moduleCompleted = completedModules.includes('sql-injection');

  // Complete module when all SQL levels completed
  useEffect(() => {
    if (allCompleted && sqlCompletedLevels.length > 0 && !moduleCompleted) {
      completeModule('sql-injection');
    }
  }, [allCompleted, sqlCompletedLevels.length, moduleCompleted, completeModule]);

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        {t('noChallenges')}
      </div>
    );
  }

  const checkAnswer = () => {
    const input = userInput.trim();
    if (!input) return;

    // Per-challenge validation: input must contain keywords specific to this challenge
    const requiredKeywords: Record<string, string[]> = {
      'beginner-1': ["'", 'or'],
      'beginner-2': ["'", '--'],
      'beginner-3': ["'", 'and'],
      'intermediate-1': ['order by'],
      'intermediate-2': ['union', 'select'],
      'advanced-1': ['union', 'select'],
      'advanced-2': ['union', 'information_schema'],
      'expert-1': ['drop table'],
      'expert-2': ['load_file'],
      'expert-3': ['into outfile'],
    };

    const validateForChallenge = (val: string, challengeId: string): boolean => {
      const lower = val.toLowerCase();
      const keywords = requiredKeywords[challengeId] ?? ["'", '"', '--', ';', 'union', 'select'];
      return keywords.every(kw => {
        // For keywords with non-word chars (like '--'), use simple substring matching.
        // For word keywords, use word boundary to prevent false positives (e.g., 'or' in "normal").
        const hasWordChars = /\w/.test(kw);
        if (!hasWordChars) {
          return lower.includes(kw.toLowerCase());
        }
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        return wordBoundaryRegex.test(lower);
      });
    };

    if (validateForChallenge(input, challenge.id)) {
      if (!isCompleted) {
        addSqlLevel(challenge.id);
      }
      setShowResult(true);
    }
  };

  const resetState = () => {
    setUserInput('');
    setShowResult(false);
    setShowHint(false);
    setShowExplanation(false);
  };

  const tryExample = () => {
    resetState();
    setUserInput(challenge.exampleInput);
  };

  const nextChallenge = () => {
    if (activeChallenge < sqlChallenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
      resetState();
    }
  };

  const prevChallenge = () => {
    if (activeChallenge > 0) {
      setActiveChallenge(activeChallenge - 1);
      resetState();
    }
  };

  const getModifiedQuery = () => {
    if (!userInput.trim()) return challenge.initialQuery;
    return challenge.initialQuery.replaceAll('[ВВОД]', userInput.trim());
  };

  const levelColors: Record<string, string> = {
    'Новичок': 'bg-green-100 text-green-700',
    'Средний': 'bg-blue-100 text-blue-700',
    'Продвинутый': 'bg-yellow-100 text-yellow-700',
    'Эксперт': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {t('progress', { completed: sqlCompletedLevels.length, total: sqlChallenges.length })}
            </span>
            {allCompleted && (
              <Badge className="bg-emerald-600 text-white rounded-full">
                <CheckCircle2 size={12} className="mr-1" /> {t('moduleComplete')}
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            {sqlChallenges.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setActiveChallenge(i); resetState(); }}
                aria-label={t('goToChallenge', { index: i + 1, title: c.title })}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  sqlCompletedLevels.includes(c.id)
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                    : i === activeChallenge
                      ? 'bg-blue-400'
                      : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge info */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={`text-[11px] ${levelColors[challenge.level]}`}>
                {challenge.level}
              </Badge>
              <span className="text-xs text-slate-400">
                {t('taskNumber', { current: activeChallenge + 1, total: sqlChallenges.length })}
              </span>
            </div>
            {isCompleted && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> {t('completed')}
              </span>
            )}
          </div>
          <h2 className="font-semibold mb-2">{challenge.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{challenge.description}</p>
        </CardContent>
      </Card>

      {/* Simulated form */}
      <Card className="border-slate-200">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Play size={16} className="text-emerald-600" />
            {t('simulation')} — {t('enterPayload')}
          </h3>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('sqlInjection')}:</label>
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => { setUserInput(e.target.value); setShowResult(false); }}
                placeholder={t('enterMaliciousCode')}
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              />
              <Button onClick={checkAnswer} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
                <Play size={16} />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={tryExample}>
              <Lightbulb size={14} className="mr-1" /> {t('showExample')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
              {showHint ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
              {showHint ? t('hideHint') : t('showHint')}
            </Button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-700">
                    <strong>{t('hint')}:</strong> {challenge.hint}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Query visualization */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">{t('queryVisualization')}</h3>
          <CodeBlock
            code={getModifiedQuery()}
            language="sql"
            title="SQL Query"
          />
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-emerald-300 bg-emerald-50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h3 className="text-sm font-semibold text-red-700">
                    {t('attackSuccessful')}
                  </h3>
                </div>
                <CodeBlock code={challenge.successQuery} language="sql" title={t('modifiedQuery')} />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExplanation(!showExplanation)}
                  >
                    {showExplanation ? t('hideExplanation') : t('showExplanation')}
                  </Button>
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="bg-white rounded-lg p-4 mt-2">
                        <h4 className="text-xs font-semibold text-emerald-700 mb-2">{t('explanationTitle')}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {challenge.explanation}
                        </p>
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <h4 className="text-xs font-semibold text-emerald-700 mb-1">{t('howToProtect')}</h4>
                          <p className="text-xs text-emerald-600">
                            {t('protectionText')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                {challenge && <InlineNotes itemId={challenge.id} moduleId="sql-injection" moduleName={t('title')} />}

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={prevChallenge} disabled={activeChallenge === 0}>
                    ← {t('previous')}
                  </Button>
                  {activeChallenge < sqlChallenges.length - 1 && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={nextChallenge}>
                      {t('next')} →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
