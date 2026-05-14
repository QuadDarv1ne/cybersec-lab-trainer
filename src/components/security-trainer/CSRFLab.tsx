'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { csrfChallenges, csrfMitigations } from '@/lib/data/csrf-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import { ChevronLeft, CheckCircle2, ChevronRight, Shield, Lightbulb, AlertTriangle, Lock } from 'lucide-react';

const levelColors: Record<string, string> = {
  'Новичок': 'bg-emerald-100 text-emerald-700',
  'Средний': 'bg-amber-100 text-amber-700',
  'Продвинутый': 'bg-orange-100 text-orange-700',
  'Эксперт': 'bg-red-100 text-red-700',
};

export default function CSRFLab() {
  const { completedModules, completeModule, setCurrentPage } = useAppStore();
  const t = useTranslations('csrf');
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [showDefense, setShowDefense] = useState(false);
  const [activeMitigation, setActiveMitigation] = useState<number | null>(null);

  const isCompleted = completedModules.includes('csrf');
  const challenge = csrfChallenges[activeChallenge];

  const handleNext = () => {
    if (activeChallenge < csrfChallenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
    } else {
      setShowDefense(true);
    }
  };

  const handlePrev = () => {
    if (showDefense) {
      setShowDefense(false);
    } else {
      setActiveChallenge(Math.max(0, activeChallenge - 1));
    }
  };

  const handleComplete = () => {
    if (!isCompleted) {
      completeModule('csrf');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Lock size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* What is CSRF */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-2">{t('whatIsCsrf')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('whatIsCsrfDescription')}
          </p>
        </CardContent>
      </Card>

      {/* Challenge selector */}
      <div className="flex flex-wrap gap-2">
        {csrfChallenges.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setActiveChallenge(i); setShowDefense(false); }}
            aria-label={`Челлендж ${c.title}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              i === activeChallenge && !showDefense
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {i + 1}. {c.title}
          </button>
        ))}
      </div>

      {/* Current challenge */}
      {!showDefense && (
        <AnimatePresence mode="wait">
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={levelColors[challenge.level] || 'bg-slate-100 text-slate-700'}>
                    {challenge.level}
                  </Badge>
                  <h3 className="font-semibold">{challenge.title}</h3>
                </div>

                <p className="text-sm text-slate-600">{challenge.description}</p>

                {/* Vulnerable scenario */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">{t('vulnerableScenario')}</h4>
                      <p className="text-xs text-amber-700 mt-1">{challenge.vulnerableScenario}</p>
                    </div>
                  </div>
                </div>

                {/* Attack code */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('attackCode')}</h4>
                  <CodeBlock code={challenge.attackCode} language="html" title="attack.html" />
                </div>

                {/* Explanation */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800">{t('explanation')}</h4>
                      <p className="text-xs text-emerald-700 mt-1">{challenge.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Mitigation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">{t('mitigation')}</h4>
                      <p className="text-xs text-blue-700 mt-1">{challenge.mitigation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Defense mechanisms */}
      {showDefense && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                <Shield size={16} />
                {t('protection')}
              </h3>
              <p className="text-xs text-emerald-700 mt-1">{t('protectionExplanation')}</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {csrfMitigations.map((m, i) => (
              <Card
                key={i}
                className="border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors"
                onClick={() => setActiveMitigation(activeMitigation === i ? null : i)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{m.technique}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {activeMitigation === i ? t('hide') : t('showCode')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.description}</p>

                  <AnimatePresence>
                    {activeMitigation === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="mt-3">
                          <CodeBlock code={m.implementation} language="javascript" title="defense.js" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={(!showDefense && activeChallenge === 0)}
        >
          <ChevronLeft size={14} className="mr-1" /> {t('back')}
        </Button>

        <div className="flex gap-1">
          {csrfChallenges.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveChallenge(i); setShowDefense(false); }}
              aria-label={`Перейти к челленджу ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === activeChallenge && !showDefense ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          ))}
          {showDefense && (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" aria-label="Защита" />
          )}
        </div>

        {!showDefense ? (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleNext}
          >
            {activeChallenge < csrfChallenges.length - 1 ? t('next') : t('protection')} <ChevronRight size={14} className="ml-1" />
          </Button>
        ) : (
          isCompleted ? (
            <div className="text-sm text-emerald-600 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> {t('moduleComplete')}
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleComplete}
            >
              {t('markComplete')}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
