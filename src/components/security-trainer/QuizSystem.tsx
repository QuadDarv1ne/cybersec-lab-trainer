'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { quizQuestions, quizCategories } from '@/lib/security-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  HelpCircle,
  Database,
  FileText,
  Link,
  Lock,
  Shield,
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
};

type QuizState = 'select' | 'playing' | 'result';

export default function QuizSystem() {
  const { quizScores, setQuizScore, setCurrentPage } = useAppStore();
  const [quizState, setQuizState] = useState<QuizState>('select');
  const [activeCategory, setActiveCategory] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [timerActive, setTimerActive] = useState(false);

  const categoryQuestions = quizQuestions.filter((q) => {
    const catId = quizCategories.find((c) => c.name === activeCategory)?.id;
    return catId && q.category === activeCategory;
  });

  const startQuiz = (categoryName: string) => {
    setActiveCategory(categoryName);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setTimeLeft(30);
    setAnswers(new Array(categoryQuestions.length).fill(null));
    setTimerActive(true);
    setQuizState('playing');
  };

  const nextQuestion = () => {
    if (currentQuestion < categoryQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      const finalCount = correctCount;
      const catId = quizCategories.find((c) => c.name === activeCategory)?.id || '';
      const score = Math.round((finalCount / categoryQuestions.length) * 100);
      setQuizScore(catId, score);
      setTimerActive(false);
      setQuizState('result');
    }
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    setShowAnswer(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = false;
    setAnswers(newAnswers);
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;
    setTimerActive(false);
    setShowAnswer(true);
    const question = categoryQuestions[currentQuestion];
    const isCorrect = parseInt(selectedAnswer) === question.correctIndex;
    if (isCorrect) setCorrectCount((c) => c + 1);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = isCorrect;
    setAnswers(newAnswers);
  };

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Will become 0 — schedule time-up handling outside effect
          setTimeout(() => {
            setTimerActive(false);
            setShowAnswer(true);
            setAnswers((prev) => {
              const newAnswers = [...prev];
              newAnswers[currentQuestion] = false;
              return newAnswers;
            });
          }, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

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
  const finalScore = Math.round((correctCount / categoryQuestions.length) * 100);

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
          <h1 className="text-xl font-bold">Проверка знаний</h1>
          <p className="text-xs text-slate-500">Тестирование по информационной безопасности</p>
        </div>
      </div>

      {/* Select Category */}
      {quizState === 'select' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-1">Выберите категорию квиза</h2>
              <p className="text-xs text-slate-500">Каждый квиз содержит 5 вопросов с таймером 30 секунд на каждый.</p>
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
                  onClick={() => startQuiz(cat.name)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        {iconMap[cat.icon]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                        <p className="text-xs text-slate-500">{cat.count} вопросов</p>
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
                <Badge variant="secondary" className="text-xs">{activeCategory}</Badge>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Вопрос {currentQuestion + 1}/{categoryQuestions.length}</span>
                  <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-500'}`}>
                    <Clock size={14} />
                    <span className="font-mono font-bold">{timeLeft}с</span>
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
                  Ответить
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
                      {answers[currentQuestion] ? '✅ Правильно!' : timeLeft <= 0 ? '⏰ Время вышло!' : '❌ Неправильно!'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{question.explanation}</p>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={nextQuestion}
                  >
                    {currentQuestion < categoryQuestions.length - 1 ? 'Следующий вопрос →' : 'Результаты'}
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
                {finalScore >= 80 ? 'Отлично!' : finalScore >= 60 ? 'Хороший результат!' : 'Нужно подтянуть!'}
              </h2>
              <p className="text-slate-300 text-sm mb-4">{activeCategory}</p>

              <div className="text-5xl font-bold font-mono mb-2">{finalScore}%</div>
              <p className="text-slate-400 text-sm mb-6">
                {correctCount} из {categoryQuestions.length} правильных ответов
              </p>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={resetQuiz}>
                  <RotateCcw size={14} className="mr-2" /> К категориям
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => startQuiz(activeCategory)}>
                  <RotateCcw size={14} className="mr-2" /> Пройти заново
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer breakdown */}
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">Разбор ответов</h3>
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
                          Правильный ответ: {q.options[q.correctIndex]}
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
