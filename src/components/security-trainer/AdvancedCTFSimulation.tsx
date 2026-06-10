'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  Flag,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Users,
  Terminal,
  FileCode,
  Key,
} from 'lucide-react';
import { ctfLevels, initialTeams, type CTFLevel, type Team } from '@/lib/data/ctf-data';

export default function AdvancedCTFSimulation() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [attackLog, setAttackLog] = useState<string[]>([]);

  const level = ctfLevels[currentLevel];
  const isCompleted = level ? completedLevels.includes(level.id) : false;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            addToLog('⏰ Время вышло! Уровень не пройден.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const startLevel = (lvl?: CTFLevel) => {
    const targetLevel = lvl ?? level;
    setTimeLeft(targetLevel.timeLimit);
    setIsRunning(true);
    setUserInput('');
    setShowHint(false);
    addToLog(`🚀 Начало уровня: ${targetLevel.title}`);
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAttackLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 5)]);
  };

  const checkSolution = () => {
    if (!userInput.trim()) return;

    addToLog(`🔍 Проверка решения...`);

    if (level.validation(userInput)) {
      if (!isCompleted) {
        const newScore = score + level.points;
        setScore(newScore);
        setCompletedLevels([...completedLevels, level.id]);
        
        setTeams(prev => prev.map(team => 
          team.id === 'team-4' 
            ? { ...team, score: newScore, completedLevels: [...team.completedLevels, level.id] }
            : team
        ));
      }
      
      setIsRunning(false);
      addToLog(`✅ Уровень пройден! +${level.points} очков`);
    } else {
      addToLog('❌ Неверное решение. Попробуйте ещё раз.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!level) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><p className="text-slate-500 dark:text-slate-400">Level not found</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Продвинутая CTF Симуляция
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Реалистичная симуляция Capture The Flag с цепочками атак и системой очков.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Flag className="h-5 w-5 text-emerald-600" />
                      {level.title}
                    </CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(level.difficulty)}>
                      {level.difficulty === 'easy' ? 'Легко' :
                       level.difficulty === 'medium' ? 'Средне' :
                       level.difficulty === 'hard' ? 'Сложно' : 'Эксперт'}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                      <Trophy className="h-3 w-3 mr-1" />
                      {level.points} очков
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Таймер */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>Осталось времени:</span>
                    </div>
                    <div className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <Progress value={(timeLeft / level.timeLimit) * 100} className="h-2" />
                </div>

                {/* Сценарий */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-blue-600" />
                    Сценарий
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300">{level.scenario}</p>
                  </div>
                </div>

                {/* Уязвимости */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Уязвимости
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {level.vulnerabilities.map((vuln, idx) => (
                      <Badge key={idx} variant="outline" className="border-red-200 text-red-700">
                        {vuln}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ввод решения */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-purple-600" />
                    Ваше решение
                  </h3>
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Введите ваш payload или решение..."
                    className="font-mono text-sm"
                    disabled={!isRunning}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={checkSolution}
                      disabled={!isRunning || !userInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Проверить
                    </Button>
                    <Button 
                      onClick={() => setShowHint(!showHint)}
                      variant="outline"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Подсказка
                    </Button>
                    <Button 
                      onClick={() => {
                        setUserInput('');
                        setShowHint(false);
                        addToLog('🔄 Ввод сброшен');
                      }}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                  </div>
                </div>

                {/* Подсказка */}
                {showHint && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Подсказка</AlertTitle>
                    <AlertDescription>
                      {level.hints.map((hint, idx) => (
                        <div key={idx} className="mt-1">• {hint}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Решение */}
                {isCompleted && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="h-5 w-5 text-green-600" />
                      Пример решения
                    </h3>
                    <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                      <pre>{level.solution}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Лог */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Лог атак
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-3 h-40 overflow-y-auto font-mono text-sm">
                  {attackLog.map((log, idx) => (
                    <div key={idx} className="text-slate-300 py-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Таблица лидеров */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Таблица лидеров
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams
                    .sort((a, b) => b.score - a.score)
                    .map((team, idx) => (
                      <div
                        key={team.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          team.id === 'team-4' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-xs text-slate-500">
                              {team.completedLevels.length} уровней
                            </div>
                          </div>
                        </div>
                        <div className="font-bold">{team.score}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Ваша статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{score}</div>
                    <div className="text-sm text-slate-600">Очки</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{completedLevels.length}</div>
                    <div className="text-sm text-slate-600">Уровней</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Прогресс</span>
                    <span className="font-medium">
                      {Math.round((completedLevels.length / ctfLevels.length) * 100)}%
                    </span>
                  </div>
                  <Progress value={(completedLevels.length / ctfLevels.length) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Навигация по уровням */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Все уровни</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {ctfLevels.map((lvl, idx) => (
                  <Button
                    key={lvl.id}
                    variant={currentLevel === idx ? "default" : "outline"}
                    onClick={() => {
                      setCurrentLevel(idx);
                      startLevel(lvl);
                    }}
                    className={`flex flex-col items-start h-auto p-4 ${
                      completedLevels.includes(lvl.id) ? 'border-emerald-500 text-emerald-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        completedLevels.includes(lvl.id) 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <Badge className={getDifficultyColor(lvl.difficulty)}>
                        {lvl.points} pts
                      </Badge>
                    </div>
                    <div className="font-medium text-left">{lvl.title}</div>
                    <div className="text-xs text-slate-500 text-left mt-1">
                      {lvl.vulnerabilities[0]}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}