'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { quizQuestions, quizCategories } from '@/lib/security-data';
import { useTranslations } from '@/lib/intlStub';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Target,
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
  const { quizScores, setQuizScore, setCurrentPage } = useAppStore();
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
  const timeUpRef = useRef(false);
  const currentQuestionRef = useRef(0);
  const correctCountRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  // Timer effect — interval is created once when timerActive changes, not on every tick.
  // Uses refs for currentQuestion and correctCount to avoid stale closures.
  useEffect(() => {
    if (!timerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timeUpRef.current = true;
          setTimerActive(false);
          setShowAnswer(true);
          setAnswers((answersPrev) => {
            const idx = currentQuestionRef.current;
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

    return () => clearInterval(interval);
  }, [timerActive]);

  const activeCategoryName = useMemo(
    () => quizCategories.find((c) => c.id === activeCategory)?.name || activeCategory,
    [activeCategory],
  );

  const categoryQuestions = useMemo(
    () => quizQuestions.filter((q) => q.category === activeCategoryName),
    [activeCategoryName],
  );

  const startQuiz = (categoryId: string) => {
    const cat = quizCategories.find((c) => c.id === categoryId);
    if (!cat) return;
    const questions = quizQuestions.filter((q) => q.category === cat.name);
    setActiveCategory(cat.id);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setTimeLeft(30);
    setAnswers(new Array(questions.length).fill(null));
    setTimerActive(true);
    setQuizState('playing');
  };

  const nextQuestion = () => {
    const totalQuestions = categoryQuestions.length;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      const catId = activeCategory;
      const score = Math.round((correctCountRef.current / totalQuestions) * 100);
      setQuizScore(catId, score);
      setTimerActive(false);
      setQuizState('result');
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;
    setTimerActive(false);
    setShowAnswer(true);
    const question = categoryQuestions[currentQuestion];
    const isCorrect = parseInt(selectedAnswer) === question.correctIndex;
    if (isCorrect) setCorrectCount((c) => c + 1);
    const qIdx = currentQuestion;
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[qIdx] = isCorrect;
      return newAnswers;
    });
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
  };

  const question = categoryQuestions[currentQuestion];
  const finalScore = categoryQuestions.length > 0
    ? Math.round((correctCount / categoryQuestions.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { resetQuiz(); setCurrentPage('dashboard'); }}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <HelpCircle size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Select Category */}
      {quizState === 'select' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-1">{t('selectCategory')}</h2>
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
                  className="cursor-pointer border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
                  onClick={() => startQuiz(cat.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        {iconMap[cat.icon]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                        <p className="text-xs text-slate-500">{t('questionsCount', { count: cat.count })}</p>
                      </div>
                      <div className="text-right">
                        {score !== undefined ? (
                          <Badge className={score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}>
                            {score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Новый
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
                  <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-500'}`}>
                    <Clock size={14} />
                    <span className="font-mono font-bold">{timeLeft}{t('seconds')}</span>
                  </div>
                </div>
              </div>
              <Progress
                value={((currentQuestion + 1) / categoryQuestions.length) * 100}
                className="h-2"
              />
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
                className="space-y-2"
              >
                {question.options.map((option, i) => {
                  let optionClass = 'border-slate-200 hover:border-emerald-400 cursor-pointer';
                  if (showAnswer) {
                    if (i === question.correctIndex) {
                      optionClass = 'border-emerald-400 bg-emerald-50';
                    } else if (selectedAnswer === String(i) && i !== question.correctIndex) {
                      optionClass = 'border-red-400 bg-red-50';
                    } else {
                      optionClass = 'border-slate-100 opacity-50';
                    }
                  } else if (selectedAnswer === String(i)) {
                    optionClass = 'border-emerald-400 bg-emerald-50/50';
                  }

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${optionClass}`}
                      onClick={() => !showAnswer && setSelectedAnswer(String(i))}
                    >
                      <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                      <Label
                        htmlFor={`opt-${i}`}
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

              {/* Action buttons */}
              {!showAnswer && (
                <Button
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAnswer}
                  disabled={!selectedAnswer}
                >
                  {t('submitAnswer')}
                </Button>
              )}

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className={`rounded-lg p-3 ${
                    answers[currentQuestion] ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-xs font-semibold ${answers[currentQuestion] ? 'text-emerald-700' : 'text-red-700'}`}>
                      {answers[currentQuestion] ? `${t('correct')}!` : timeLeft <= 0 ? `${t('timeUp')}!` : `${t('incorrect')}!`}
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
          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                {finalScore >= 80 ? (
                  <Trophy size={32} className="text-amber-400" />
                ) : finalScore >= 60 ? (
                  <Target size={32} className="text-emerald-400" />
                ) : (
                  <HelpCircle size={32} className="text-red-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {finalScore >= 80 ? t('excellent') : finalScore >= 60 ? t('goodResult') : t('needsImprovement')}
              </h2>
              <p className="text-slate-300 text-sm mb-4">{activeCategoryName}</p>

              <div className="text-5xl font-bold font-mono mb-2">{finalScore}%</div>
              <p className="text-slate-400 text-sm mb-6">
                {t('correctAnswers', { correct: correctCount, total: categoryQuestions.length })}
              </p>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={resetQuiz}>
                  <RotateCcw size={14} className="mr-2" /> {t('backToCategories')}
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => startQuiz(activeCategory)}>
                  <RotateCcw size={14} className="mr-2" /> {t('retry')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer breakdown */}
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">{t('answerBreakdown')}</h3>
              <div className="space-y-3">
                {categoryQuestions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      answers[i] ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {answers[i] ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-relaxed">{q.question}</p>
                      {!answers[i] && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          {t('correctAnswer')}: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
