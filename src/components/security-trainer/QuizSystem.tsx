'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { quizQuestions, quizCategories } from '@/lib/security-data';
import { useTranslations, formatDate } from '@/lib/intlStub';
import { generateUUID, getOptionStyle } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  HelpCircle,
  Database,
  FileText,
  Link,
  Lock,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Target,
  History,
  AlertCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Database: <Database size={20} />,
  FileText: <FileText size={20} />,
  Link: <Link size={20} />,
  Lock: <Lock size={20} />,
  Shield: <Shield size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
};

type QuizState = 'select' | 'playing' | 'result';

export default function QuizSystem() {
  const quizScores = useAppStore((s) => s.quizScores);
  const quizHistory = useAppStore((s) => s.quizHistory);
  const setQuizScore = useAppStore((s) => s.setQuizScore);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const t = useTranslations('quiz');
  const [quizState, setQuizState] = useState<QuizState>('select');
  const [activeCategory, setActiveCategory] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [quizQuestionsOverride, setQuizQuestionsOverride] = useState<typeof quizQuestions | null>(null);
  const timeUpRef = useRef(false);
  const currentQuestionRef = useRef(0);
  const correctCountRef = useRef(0);
  const answersRef = useRef<(boolean | null)[]>([]);
  const mountedRef = useRef(true);

  // Keep refs in sync for use in callbacks and timers
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
    correctCountRef.current = correctCount;
    answersRef.current = answers;
  }, [currentQuestion, correctCount, answers]);

  // Timer effect — interval is created once when timerActive changes, not on every tick.
  // Uses ref for currentQuestion to avoid stale closures.
  useEffect(() => {
    mountedRef.current = true;
    if (!timerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timeUpRef.current = true;
          setTimerActive(false);
          if (!mountedRef.current) return 0;
          // Only update state if still mounted — prevents updates after unmount in Strict Mode
          setShowAnswer(true);
          const idx = currentQuestionRef.current;
          setAnswers((answersPrev) => {
            if (answersPrev[idx] !== null && answersPrev[idx] !== undefined) return answersPrev;
            const newAnswers = [...answersPrev];
            newAnswers[idx] = false;
            return newAnswers;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      timeUpRef.current = false;
    };
  }, [timerActive]);

  const activeCategoryName = useMemo(
    () => quizCategories.find((c) => c.id === activeCategory)?.name || activeCategory,
    [activeCategory],
  );

  const categoryQuestions = useMemo(
    () => {
      const questions = quizQuestionsOverride ?? quizQuestions;
      return questions.filter((q) => q.category === activeCategoryName);
    },
    [activeCategoryName, quizQuestionsOverride],
  );

  const startQuiz = (categoryId: string) => {
    const cat = quizCategories.find((c) => c.id === categoryId);
    if (!cat) return;
    setQuizQuestionsOverride(null);
    const questions = quizQuestions.filter((q) => q.category === cat.name);
    if (questions.length === 0) return;
    setTimerActive(false); // ensure clean timer reset
    setActiveCategory(cat.id);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setTimeLeft(30);
    setAnswers(new Array(questions.length).fill(null));
    setTimerActive(true);
    setQuizState('playing');
    timeUpRef.current = false;
  };

  const nextQuestion = () => {
    const totalQuestions = categoryQuestions.length;
    if (totalQuestions === 0) {
      setTimerActive(false);
      setQuizState('result');
      return;
    }
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      const catId = activeCategory;
      // Compute score from answers state directly — use the closure value rather
      // than answersRef which can be stale if state update hasn't flushed to useEffect yet.
      const finalAnswers = [...answers];
      const correctCount = finalAnswers.filter(Boolean).length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Save quiz attempt to history
      const cat = quizCategories.find((c) => c.id === catId);
      const attempt = {
        id: `attempt-${Date.now()}-${generateUUID()}`,
        categoryId: catId,
        categoryName: cat?.name || activeCategoryName,
        score,
        correct: correctCount,
        total: totalQuestions,
        answers: finalAnswers,
        timestamp: Date.now(),
      };
      setQuizScore(catId, score, attempt);

      setTimerActive(false);
      setQuizState('result');
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;
    // If timer already fired and recorded the answer, don't overwrite it
    if (timeUpRef.current) return;
    setTimerActive(false);
    setShowAnswer(true);
    const question = categoryQuestions[currentQuestion];
    if (!question) return;
    const isCorrect = parseInt(selectedAnswer, 10) === question.correctIndex;
    const qIdx = currentQuestion;

    setAnswers((prev) => {
      if (prev[qIdx] !== null && prev[qIdx] !== undefined) return prev;
      const newAnswers = [...prev];
      newAnswers[qIdx] = isCorrect;
      return newAnswers;
    });
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const resetQuiz = () => {
    setQuizState('select');
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setTimeLeft(30);
    setAnswers([]);
    setTimerActive(false);
    setQuizQuestionsOverride(null);
  };

  const retryWrong = () => {
    const wrongs = categoryQuestions.filter((_, i) => !answersRef.current[i]);
    if (wrongs.length === 0) return;
    setQuizQuestionsOverride(wrongs);
    setActiveCategory(activeCategory);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setTimeLeft(30);
    setAnswers(new Array(wrongs.length).fill(null));
    setTimerActive(true);
    setQuizState('playing');
    timeUpRef.current = false;
  };

  const question = categoryQuestions[currentQuestion];
  // Derive correct count from answers state on the result screen to avoid stale state
  // from React's batched updates when the timer fires immediately after the last answer.
  const displayCorrectCount = useMemo(
    () => quizState === 'result'
      ? answers.filter(Boolean).length
      : correctCount,
    [quizState, answers, correctCount],
  );
  const finalScore = categoryQuestions.length > 0
    ? Math.round((displayCorrectCount / categoryQuestions.length) * 100)
    : 0;

  // Screen reader announcement for timer warnings
  const timerAnnouncement = useMemo(() => {
    if (!timerActive || quizState !== 'playing') return '';
    if (timeLeft <= 0) return t('timeUp');
    if (timeLeft === 10) return `${t('seconds', { count: 10 })} ${t('remaining') || 'remaining'}`;
    if (timeLeft === 5) return `${t('seconds', { count: 5 })} ${t('remaining') || 'remaining'}`;
    return '';
  }, [timeLeft, timerActive, quizState, t]);

  return (
    <div className="space-y-6">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {timerAnnouncement}
      </div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { resetQuiz(); setCurrentPage('dashboard'); }} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label={t('backToCategories')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <HelpCircle size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Select Category */}
      {quizState === 'select' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-1 flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-500" />
                {t('selectCategory')}
              </h2>
              <p className="text-xs text-slate-500">{t('selectCategoryDesc')}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizCategories.map((cat) => {
              const catId = cat.id;
              const score = quizScores[catId];
              return (
                <Card
                  key={cat.id}
                  className="cursor-pointer border-slate-200 dark:border-slate-700/50 card-hover"
                  onClick={() => startQuiz(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      startQuiz(cat.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('selectCategory')}: ${cat.name}, ${t('questionsCount', { count: cat.count })}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                        {iconMap[cat.icon] || <HelpCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                        <p className="text-xs text-slate-500">{t('questionsCount', { count: cat.count })}</p>
                      </div>
                      <div className="text-right">
                        {score !== undefined ? (
                          <Badge className={score >= 80 ? 'bg-emerald-600 rounded-full' : score >= 60 ? 'bg-amber-500 rounded-full' : 'bg-red-500 rounded-full'}>
                            {score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] rounded-full">
                            {t('new')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Playing */}
      {quizState === 'playing' && question && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Quiz progress */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">{activeCategoryName}</Badge>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{t('questionProgress', { current: currentQuestion + 1, total: categoryQuestions.length })}</span>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-slate-600" />
                        <motion.circle
                          cx="16" cy="16" r="13"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className={timeLeft <= 10 ? 'text-red-500' : 'text-emerald-500'}
                          strokeDasharray={2 * Math.PI * 13}
                          initial={false}
                          animate={{ strokeDashoffset: (timeLeft / 30) * 2 * Math.PI * 13 }}
                          transition={{ duration: 0.3 }}
                        />
                      </svg>
                      <span className={`font-mono text-xs font-bold z-10 ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {categoryQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i === currentQuestion
                          ? 'bg-emerald-500'
                          : answers[i] === true
                            ? 'bg-emerald-300'
                            : answers[i] === false
                              ? 'bg-red-300'
                              : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm leading-relaxed mb-4">{question.question}</h3>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                disabled={showAnswer}
                aria-label={question.question}
                className="space-y-2"
              >
                {question.options.map((option, i) => {
                  const optionClass = getOptionStyle(
                    showAnswer,
                    i === question.correctIndex,
                    selectedAnswer === String(i),
                    { default: 'border-slate-200', defaultHover: 'hover:border-emerald-400 cursor-pointer', other: 'border-slate-100 opacity-50' }
                  );

                  return (
                    <div
                      key={`${question.id}-${i}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${optionClass}`}
                      role="presentation"
                    >
                      <RadioGroupItem value={String(i)} id={`opt-${question.id}-${i}`} />
                      <Label
                        htmlFor={`opt-${question.id}-${i}`}
                        className="flex-1 text-sm cursor-pointer leading-relaxed"
                      >
                        {option}
                      </Label>
                      {showAnswer && i === question.correctIndex && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      )}
                      {showAnswer && selectedAnswer === String(i) && i !== question.correctIndex && (
                        <XCircle size={16} className="text-red-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>

              {!showAnswer && (
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                  >
                    <CheckCircle2 size={16} className="mr-1.5" />
                    {t('submitAnswer')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const question = categoryQuestions[currentQuestion];
                      if (!question) { nextQuestion(); return; }
                      const qIdx = currentQuestion;
                      setShowAnswer(true);
                      setTimerActive(false);
                      setAnswers((prev) => {
                        if (prev[qIdx] !== null) return prev;
                        const newAnswers = [...prev];
                        newAnswers[qIdx] = false;
                        return newAnswers;
                      });
                    }}
                  >
                    {t('skip') || 'Skip'}
                  </Button>
                </div>
              )}

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className={`rounded-lg p-3 ${
                    answers[currentQuestion] ?? false ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-xs font-semibold ${answers[currentQuestion] ?? false ? 'text-emerald-700' : 'text-red-700'}`}>
                      {answers[currentQuestion] ?? false ? `${t('correct')}!` : timeLeft <= 0 ? `${t('timeUp')}!` : `${t('incorrect')}!`}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{question.explanation}</p>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={nextQuestion}
                  >
                    {currentQuestion < categoryQuestions.length - 1 ? `${t('nextQuestion')} →` : t('results')}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {quizState === 'result' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            <CardContent className="p-8 md:p-10 text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                  finalScore >= 80 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30' :
                  finalScore >= 60 ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30' :
                  'bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30'
                }`}
              >
                {finalScore >= 80 ? (
                  <Trophy size={36} className="text-white" />
                ) : finalScore >= 60 ? (
                  <Target size={36} className="text-white" />
                ) : (
                  <HelpCircle size={36} className="text-white" />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-1"
              >
                {finalScore >= 80 ? t('excellent') : finalScore >= 60 ? t('goodResult') : t('needsImprovement')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-300 text-sm mb-2"
              >
                {activeCategoryName}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-6xl font-bold font-mono mb-2 bg-gradient-to-b from-white to-emerald-200 bg-clip-text text-transparent"
              >
                {finalScore}%
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-400 text-sm mb-6"
              >
                {t('correctAnswers', { correct: displayCorrectCount, total: categoryQuestions.length })}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2 justify-center flex-wrap"
              >
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white" onClick={resetQuiz}>
                  <RotateCcw size={14} className="mr-2" /> {t('backToCategories')}
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30" onClick={() => startQuiz(activeCategory)}>
                  <RotateCcw size={14} className="mr-2" /> {t('retry')}
                </Button>
                {categoryQuestions.some((_, i) => !answers[i]) && (
                  <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30" onClick={retryWrong}>
                    <AlertCircle size={14} className="mr-2" /> {t('retryWrong')}
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>

          {/* Progress ring */}
          <Card className="border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Target size={15} className="text-emerald-500" />
                {t('answerBreakdown')}
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Верно: {displayCorrectCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-slate-600 dark:text-slate-400">Неверно: {categoryQuestions.length - displayCorrectCount}</span>
                </div>
              </div>
              <div className="space-y-2">
                {categoryQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      answers[i] ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {answers[i] ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-relaxed">{q.question}</p>
                      {!answers[i] && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          {t('correctAnswer')}: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiz history for this category */}
          {(() => {
            const categoryQuizHistory = quizHistory.filter((h) => h.categoryId === activeCategory);
            if (categoryQuizHistory.length === 0) return null;
            return (
            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-slate-500" />
                    <h3 className="text-sm font-semibold">{t('quizHistory')}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {categoryQuizHistory.length} {t('attempts')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {categoryQuizHistory
                    .slice(0, 10)
                    .map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                          attempt.score >= 80 ? 'bg-emerald-500' : attempt.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {attempt.score}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            {attempt.correct}/{attempt.total} {t('correctAnswersShort')}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(attempt.timestamp, {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {attempt.answers.slice(0, 10).map((a, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                a === null ? 'bg-slate-300' : a ? 'bg-emerald-400' : 'bg-red-400'
                              }`}
                            />
                          ))}
                          {attempt.answers.length > 10 && (
                            <span className="text-[10px] text-slate-400 ml-1">+{attempt.answers.length - 10}</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
