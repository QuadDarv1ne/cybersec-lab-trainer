'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { securityHeaders, headerChallenges } from '@/lib/data/security-headers-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/intlStub';
import {
  ChevronLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  XCircle,
} from 'lucide-react';

export default function SecurityHeadersLab() {
  const t = useTranslations('securityHeaders');
  const { completeModule, setCurrentPage, completedModules, headersChallengeScores, setHeadersChallengeScore } = useAppStore();
  const isCompleted = completedModules.includes('security-headers');

  // Challenge state
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(headersChallengeScores.correct);
  const [answeredChallenges, setAnsweredChallenges] = useState<Set<number>>(new Set(headersChallengeScores.answered));

  // Re-sync local state when store values change
  useEffect(() => {
    setCorrectCount(headersChallengeScores.correct);
    setAnsweredChallenges(new Set(headersChallengeScores.answered));
    if (headersChallengeScores.selectedOptions[activeChallenge] !== undefined) {
      setSelectedOption(headersChallengeScores.selectedOptions[activeChallenge]);
    } else {
      setSelectedOption(null);
    }
  }, [headersChallengeScores.correct, headersChallengeScores.answered, headersChallengeScores.selectedOptions, activeChallenge]);

  const challenge = headerChallenges[activeChallenge];
  const isAnswered = answeredChallenges.has(activeChallenge);

  // Complete module when all challenges are answered with >= 70% correct
  useEffect(() => {
    if (answeredChallenges.size === headerChallenges.length &&
        correctCount >= Math.ceil(headerChallenges.length * 0.7) &&
        !isCompleted) {
      completeModule('security-headers');
    }
  }, [answeredChallenges.size, correctCount, isCompleted, completeModule]);

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Нет доступных заданий
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    const isCorrect = challenge.options[selectedOption].correct;
    setShowResult(true);
    const newAnswered = new Set(answeredChallenges);
    newAnswered.add(activeChallenge);
    setAnsweredChallenges(newAnswered);
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);
    const newSelectedOptions = { ...headersChallengeScores.selectedOptions, [activeChallenge]: selectedOption };
    setHeadersChallengeScore(newCorrect, [...newAnswered], newSelectedOptions);
  };

  const nextChallenge = () => {
    if (activeChallenge < headerChallenges.length - 1) {
      const newSelectedOptions = selectedOption !== null
        ? { ...headersChallengeScores.selectedOptions, [activeChallenge]: selectedOption }
        : { ...headersChallengeScores.selectedOptions };
      setHeadersChallengeScore(correctCount, [...answeredChallenges], newSelectedOptions);
      setActiveChallenge(activeChallenge + 1);
      setShowResult(false);
    }
  };

  const prevChallenge = () => {
    if (activeChallenge > 0) {
      const newSelectedOptions = selectedOption !== null
        ? { ...headersChallengeScores.selectedOptions, [activeChallenge]: selectedOption }
        : { ...headersChallengeScores.selectedOptions };
      setHeadersChallengeScore(correctCount, [...answeredChallenges], newSelectedOptions);
      setActiveChallenge(activeChallenge - 1);
      setShowResult(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label="Вернуться на главную">
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Shield size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Headers overview */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            {t('headersOverview')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {securityHeaders.map((header) => (
              <div
                key={header.id}
                className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-slate-200"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  header.severity === 'Критический' ? 'bg-red-500' :
                  header.severity === 'Высокий' ? 'bg-orange-500' :
                  header.severity === 'Средний' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium truncate">{header.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{header.description.slice(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Headers details */}
      <Accordion type="multiple" className="space-y-3">
        {securityHeaders.map((header) => (
          <Card key={header.id} className="border-slate-200 overflow-hidden">
            <AccordionItem value={header.id} className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 text-left flex-1 mr-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    header.severity === 'Критический' ? 'bg-red-500' :
                    header.severity === 'Высокий' ? 'bg-orange-500' :
                    header.severity === 'Средний' ? 'bg-yellow-500' : 'bg-green-500'
                  } shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {header.severity}
                    </Badge>
                    <h3 className="text-sm font-medium mt-1 truncate font-mono">{header.title}</h3>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">{header.description}</p>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                      <AlertTriangle size={14} /> {t('attackScenario')}
                    </h4>
                    <p className="text-xs text-amber-700 leading-relaxed">{header.attackScenario}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <XCircle size={14} /> {t('vulnerableConfig')}
                    </h4>
                    <CodeBlock code={header.vulnerableConfig} language="text" title="vulnerable" />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                      <CheckCircle2 size={14} /> {t('secureConfig')}
                    </h4>
                    <CodeBlock code={header.secureConfig} language="text" title="secure" />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">{t('mitigations')}</h4>
                    <ul className="space-y-1.5">
                      {header.mitigations.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>

      {/* Challenges section */}
      <Separator />
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-blue-600" />
        <h2 className="text-lg font-bold">{t('challenges')}</h2>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {t('taskNumber', { number: activeChallenge + 1, total: headerChallenges.length })}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                ✅ {correctCount} {t('correct')}
              </Badge>
              {isCompleted && <Badge className="bg-emerald-600 text-white">{t('moduleComplete')}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {headerChallenges.map((challenge, i) => (
              <button
                key={challenge.id}
                onClick={() => {
                  setActiveChallenge(i);
                  setSelectedOption(null);
                  setShowResult(false);
                }}
                aria-label={`Перейти к заданию ${i + 1}: ${challenge.question.substring(0, 50)}`}
                className={`flex-1 h-2 rounded-full transition-all ${
                  answeredChallenges.has(i)
                    ? 'bg-emerald-500'
                    : i === activeChallenge
                      ? 'bg-blue-300'
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
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">{challenge.scenario}</p>
            </div>
            <h2 className="font-semibold mb-3">{challenge.question}</h2>

            <div className="space-y-2">
              {challenge.options.map((option, i) => {
                let optionStyle = 'border-slate-200 hover:border-slate-400 hover:bg-slate-50';
                if (isAnswered) {
                  if (option.correct) {
                    optionStyle = 'border-emerald-400 bg-emerald-50';
                  } else if (selectedOption === i && !option.correct) {
                    optionStyle = 'border-red-400 bg-red-50';
                  } else {
                    optionStyle = 'border-slate-100 opacity-60';
                  }
                } else if (selectedOption === i) {
                  optionStyle = 'border-blue-400 bg-blue-50/50';
                }

                return (
                  <button
                    key={option.text}
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
                                ? 'border-blue-500 bg-blue-100'
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

            {!isAnswered && (
              <Button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
              >
                {t('checkAnswer')}
              </Button>
            )}

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
                      className={`text-xs font-semibold mb-1 ${
                        challenge.options[selectedOption].correct
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {challenge.options[selectedOption].correct ? `✅ ${t('correctAnswer')}` : `❌ ${t('incorrectAnswer')}`}
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
                    {activeChallenge < headerChallenges.length - 1 ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
}
