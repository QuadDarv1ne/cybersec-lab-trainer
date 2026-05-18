'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { owaspTopics, owaspChallenges } from '@/lib/security-data';
import { useTranslations } from '@/lib/intlStub';
import CodeBlock from './CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronLeft, CheckCircle2, AlertTriangle, Shield, Target, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function OWASPTop10() {
  const { studiedOwaspItems, addStudiedOwasp, completeModule, setCurrentPage, completedModules, setOwaspChallengeScore, owaspChallengeScores } = useAppStore();
  const t = useTranslations('owasp');
  const isCompleted = completedModules.includes('owasp');

  const [activeTab, setActiveTab] = useState<'learn' | 'challenges'>('learn');
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(owaspChallengeScores.correct);
  const [answeredChallenges, setAnsweredChallenges] = useState<Set<number>>(new Set(owaspChallengeScores.answered));

  // Re-sync local state when store values change (e.g., after navigation/rehydration)
  useEffect(() => {
    setCorrectCount(owaspChallengeScores.correct);
    setAnsweredChallenges(new Set(owaspChallengeScores.answered));
  }, [owaspChallengeScores.correct, owaspChallengeScores.answered]);

  const studiedCount = studiedOwaspItems.length;
  const totalCount = owaspTopics.length;
  const allStudied = studiedCount === totalCount;

  // Complete module when all topics studied
  useEffect(() => {
    if (allStudied && studiedCount > 0 && !isCompleted) {
      completeModule('owasp');
    }
  }, [allStudied, studiedCount, isCompleted, completeModule]);

  const currentChallenge = owaspChallenges[activeChallenge];
  const isChallengeAnswered = answeredChallenges.has(activeChallenge);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Нет доступных заданий
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (isChallengeAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isChallengeAnswered) return;
    setShowResult(true);
    const newAnswered = new Set(answeredChallenges);
    newAnswered.add(activeChallenge);
    setAnsweredChallenges(newAnswered);
    const isCorrect = currentChallenge.options[selectedOption].correct;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);
    setOwaspChallengeScore(newCorrect, [...newAnswered]);
  };

  const nextChallenge = () => {
    if (activeChallenge < owaspChallenges.length - 1) {
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

  const handleComplete = () => {
    if (!isCompleted) completeModule('owasp');
  };

  const handleToggleStudied = (id: string) => {
    if (studiedOwaspItems.includes(id)) return;
    addStudiedOwasp(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Shield size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'learn' | 'challenges')} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="learn" className="text-xs">
            <ShieldCheck size={14} className="mr-1" /> Обучение
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs">
            <Target size={14} className="mr-1" /> Задания ({owaspChallenges.length})
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab */}
        <TabsContent value="learn" className="space-y-4">
      {/* Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {allStudied ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <AlertTriangle size={18} className="text-amber-500" />
              )}
              <span className="text-sm font-medium">
                {t('studiedCount', { studied: studiedCount, total: totalCount })}
              </span>
            </div>
            <Badge variant={allStudied ? 'default' : 'secondary'} className={allStudied ? 'bg-emerald-600' : ''}>
              {allStudied ? t('moduleComplete') : `${Math.round((studiedCount / totalCount) * 100)}%`}
            </Badge>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(studiedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix Visual */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-red-50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-500" />
            {t('riskMatrix')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {owaspTopics.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${item.severityColor}`}
              >
                {item.code}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> {t('severity.critical')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> {t('severity.high')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> {t('severity.medium')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Accordion type="multiple" className="space-y-3">
        {owaspTopics.map((item, index) => {
          const isStudied = studiedOwaspItems.includes(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 overflow-hidden">
                <AccordionItem value={item.id} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 text-left flex-1 mr-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.severityColor} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.code}
                          </Badge>
                          <Badge className={`text-[10px] text-white ${item.severityColor} border-0`}>
                            {item.severity}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-medium mt-1 truncate">{item.title}</h3>
                      </div>
                      {isStudied && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

                      {/* Real-world example */}
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-amber-800 mb-1">
                          🌍 {t('realWorldExample')}
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">{item.realExample}</p>
                      </div>

                      {/* Vulnerable code */}
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                          ❌ {t('vulnerableCode')}
                        </h4>
                        <CodeBlock code={item.vulnerableCode} language="javascript" title="vulnerable.js" />
                      </div>

                      {/* Secure code */}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          ✅ {t('secureCode')}
                        </h4>
                        <CodeBlock code={item.secureCode} language="javascript" title="secure.js" />
                      </div>

                      {/* Mitigations */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">
                          🛡️ {t('mitigations')}
                        </h4>
                        <ul className="space-y-1.5">
                          {item.mitigations.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Mark as studied */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{t('markAsStudied')}</span>
                        <div className="flex items-center gap-2">
                          {isStudied && (
                            <span className="text-xs text-emerald-600 font-medium">{t('studied')}</span>
                          )}
                          <Button
                            size="sm"
                            variant={isStudied ? 'outline' : 'default'}
                            className={isStudied ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                            onClick={() => handleToggleStudied(item.id)}
                            disabled={isStudied}
                          >
                            {isStudied ? t('passed') : t('mark')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </motion.div>
          );
        })}
      </Accordion>

      {/* Complete module button for Learn tab */}
      {!isCompleted ? (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={handleComplete}
        >
          {t('markComplete')}
        </Button>
      ) : (
        <div className="text-center text-sm text-emerald-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> {t('moduleComplete')}
        </div>
      )}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          {/* Challenge Progress */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Задание {activeChallenge + 1} из {owaspChallenges.length}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    ✅ {correctCount} верно
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {owaspChallenges.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveChallenge(i); setSelectedOption(null); setShowResult(false); }}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      answeredChallenges.has(i) ? 'bg-emerald-500' : i === activeChallenge ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenge Card */}
          <motion.div key={activeChallenge} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-emerald-600" />
                  <h3 className="font-semibold">{currentChallenge.title}</h3>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-600">{currentChallenge.scenario}</p>
                </div>

                <CodeBlock code={currentChallenge.code} language="javascript" title="challenge.js" />

                <h4 className="font-medium mt-4 mb-3">{currentChallenge.question}</h4>

                <div className="space-y-2">
                  {currentChallenge.options.map((option, i) => {
                    let optionStyle = 'border-slate-200 hover:border-slate-400 hover:bg-slate-50';
                    if (isChallengeAnswered) {
                      optionStyle = option.correct ? 'border-emerald-400 bg-emerald-50' :
                        selectedOption === i && !option.correct ? 'border-red-400 bg-red-50' : 'border-slate-100 opacity-60';
                    } else if (selectedOption === i) {
                      optionStyle = 'border-emerald-400 bg-emerald-50/50';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        disabled={isChallengeAnswered}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${optionStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isChallengeAnswered && option.correct ? 'border-emerald-500 bg-emerald-500' :
                            isChallengeAnswered && selectedOption === i && !option.correct ? 'border-red-500 bg-red-500' :
                            selectedOption === i ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300'
                          }`}>
                            {isChallengeAnswered && option.correct && <CheckCircle2 size={14} className="text-white" />}
                            {isChallengeAnswered && selectedOption === i && !option.correct && <XCircle size={14} className="text-white" />}
                          </div>
                          <span className="text-sm">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isChallengeAnswered && (
                  <Button
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                  >
                    Проверить ответ
                  </Button>
                )}

                <AnimatePresence>
                  {showResult && selectedOption !== null && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <div className={`rounded-lg p-4 ${
                        currentChallenge.options[selectedOption].correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <h4 className={`text-xs font-semibold mb-1 ${
                          currentChallenge.options[selectedOption].correct ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {currentChallenge.options[selectedOption].correct ? '✅ Верно!' : '❌ Неверно'}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{currentChallenge.explanation}</p>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" onClick={prevChallenge} disabled={activeChallenge === 0}>
                          <ArrowLeft size={14} className="mr-1" /> Назад
                        </Button>
                        {activeChallenge < owaspChallenges.length - 1 ? (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={nextChallenge}>
                            Далее <ArrowRight size={14} className="ml-1" />
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-600 text-white py-1.5">Все задания пройдены!</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
