'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { secureCodingChallenges } from '@/lib/security-data';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Code,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function SecureCodingLab() {
  const { completeModule, setCurrentPage, completedModules } = useAppStore();
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredChallenges, setAnsweredChallenges] = useState<Set<number>>(new Set());

  const challenge = secureCodingChallenges[activeChallenge];
  const isAnswered = answeredChallenges.has(activeChallenge);
  const isCompleted = completedModules.includes('secure-coding');
  const allAnswered = answeredChallenges.size === secureCodingChallenges.length;

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
    if (isCorrect) setCorrectCount((c) => c + 1);

    if (newAnswered.size === secureCodingChallenges.length) {
      completeModule('secure-coding');
    }
  };

  const nextChallenge = () => {
    if (activeChallenge < secureCodingChallenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const prevChallenge = () => {
    if (activeChallenge > 0) {
      setActiveChallenge(activeChallenge - 1);
      setSelectedOption(null);
      setShowResult(false);
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
          <Code size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Безопасное кодирование</h1>
          <p className="text-xs text-slate-500">Найдите уязвимость и выберите правильное решение</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Задание {activeChallenge + 1} из {secureCodingChallenges.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                ✅ {correctCount} правильных
              </Badge>
              {isCompleted && <Badge className="bg-emerald-600 text-white">Модуль завершён!</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {secureCodingChallenges.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveChallenge(i);
                  setSelectedOption(null);
                  setShowResult(false);
                }}
                className={`flex-1 h-2 rounded-full transition-all ${
                  answeredChallenges.has(i)
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
              <span className="text-xs text-slate-400">Код-ревью</span>
            </div>
            <h2 className="font-semibold mb-3">{challenge.title}</h2>

            {/* Vulnerable code */}
            <CodeBlock code={challenge.code} language="javascript" title="vulnerable.js" />

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3">Что нужно исправить?</h3>
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
                    optionStyle = 'border-emerald-400 bg-emerald-50/50';
                  }

                  return (
                    <button
                      key={i}
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
                Проверить ответ
              </Button>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div
                    className={`rounded-lg p-4 ${
                      challenge.options[selectedOption!]?.correct
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1 ${
                        challenge.options[selectedOption!]?.correct
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {challenge.options[selectedOption!]?.correct
                        ? '✅ Правильно!'
                        : '❌ Неправильно'}
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
                      <ArrowLeft size={14} className="mr-1" /> Назад
                    </Button>
                    {activeChallenge < secureCodingChallenges.length - 1 ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={nextChallenge}
                      >
                        Следующее <ArrowRight size={14} className="ml-1" />
                      </Button>
                    ) : (
                      <Badge className="bg-emerald-600 text-white py-1.5">
                        Все задания завершены!
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
