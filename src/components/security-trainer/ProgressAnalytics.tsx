'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { modules, quizCategories } from '@/lib/security-data';
import { calculateLevel, levelProgress } from '@/lib/xp-system';
import { getStreakInfo, formatDuration } from '@/lib/study-sessions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/lib/intlStub';
import {
  ChevronLeft,
  TrendingUp,
  Trophy,
  Zap,
  Clock,
  Target,
  BarChart3,
  Star,
  Flame,
  BookOpen,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
} from 'lucide-react';

interface QuizTrend {
  categoryId: string;
  name: string;
  scores: number[];
  average: number;
  trend: 'up' | 'down' | 'stable';
}

export default function ProgressAnalytics() {
  const t = useTranslations('analytics');
  const {
    setCurrentPage, completedModules, quizScores, quizHistory,
    totalXP, studySessions, owaspChallengeScores, authChallengeScores,
    headersChallengeScores, secureCodingChallengeScores,
  } = useAppStore();

  const level = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const progress = useMemo(() => levelProgress(totalXP), [totalXP]);
  const streak = useMemo(() => getStreakInfo(studySessions), [studySessions]);

  const totalStudyTime = useMemo(() =>
    studySessions.reduce((sum, s) => sum + s.durationMs, 0),
    [studySessions]
  );

  const completedCount = useMemo(() =>
    completedModules.filter((id) => modules.some((m) => m.id === id)).length,
    [completedModules]
  );

  // Quiz trend analysis
  const quizTrends: QuizTrend[] = useMemo(() => {
    return quizCategories.map((cat) => {
      const attempts = quizHistory
        .filter((h) => h.categoryId === cat.id)
        .map((h) => h.score)
        .reverse();

      const scores = attempts.length > 0 ? attempts : [quizScores[cat.id] ?? 0];
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (scores.length >= 2) {
        const recent = scores.slice(-3);
        const older = scores.slice(0, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
        const diff = recentAvg - olderAvg;
        if (diff > 5) trend = 'up';
        else if (diff < -5) trend = 'down';
      }

      return { categoryId: cat.id, name: cat.name, scores, average, trend };
    });
  }, [quizCategories, quizHistory, quizScores]);

  // Challenge performance
  const challengePerformance = useMemo(() => {
    const challenges = [
      { name: 'OWASP', correct: owaspChallengeScores.correct, total: owaspChallengeScores.total },
      { name: 'Auth', correct: authChallengeScores.correct, total: authChallengeScores.total },
      { name: 'Headers', correct: headersChallengeScores.correct, total: headersChallengeScores.total },
      { name: 'Secure Coding', correct: secureCodingChallengeScores.correct, total: secureCodingChallengeScores.total },
    ].filter((c) => c.total > 0);

    return challenges.map((c) => ({
      ...c,
      percentage: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    }));
  }, [owaspChallengeScores, authChallengeScores, headersChallengeScores, secureCodingChallengeScores]);

  // Module completion rate
  const moduleCompletionRate = useMemo(() => {
    const rates = modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      completed: completedModules.includes(mod.id),
    }));
    return rates;
  }, [completedModules]);

  // Study activity last 7 days
  const weeklyActivity = useMemo(() => {
    const days: { day: string; minutes: number }[] = [];
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = studySessions.filter((s) => s.date.startsWith(dateStr));
      const minutes = Math.floor(daySessions.reduce((sum, s) => sum + s.durationMs, 0) / 60000);
      days.push({ day: dayNames[date.getDay()], minutes });
    }

    return days;
  }, [studySessions]);

  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes), 1);

  // Strongest and weakest categories
  const strongestCategory = useMemo(() => {
    const scored = quizTrends.filter((q) => q.scores[0] > 0).sort((a, b) => b.average - a.average);
    return scored[0] || null;
  }, [quizTrends]);

  const weakestCategory = useMemo(() => {
    const scored = quizTrends.filter((q) => q.scores[0] > 0).sort((a, b) => a.average - b.average);
    return scored[0] || null;
  }, [quizTrends]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('back')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <BarChart3 size={20} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-amber-600" />
              <span className="text-xs text-slate-600">{t('level')}</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">{level}</div>
            <Progress value={progress} className="h-1.5 mt-2" />
            <span className="text-[10px] text-slate-500">{progress}% до следующего</span>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-emerald-600" />
              <span className="text-xs text-slate-600">{t('modules')}</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{completedCount}/{modules.length}</div>
            <Progress value={(completedCount / modules.length) * 100} className="h-1.5 mt-2" />
            <span className="text-[10px] text-slate-500">{Math.round((completedCount / modules.length) * 100)}% завершено</span>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-violet-600" />
              <span className="text-xs text-slate-600">{t('totalXP')}</span>
            </div>
            <div className="text-2xl font-bold text-violet-900">{totalXP}</div>
            <span className="text-[10px] text-slate-500">очков опыта</span>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-600" />
              <span className="text-xs text-slate-600">{t('streak')}</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{streak.currentStreak}</div>
            <span className="text-[10px] text-slate-500">дней подряд (лучшая: {streak.bestStreak})</span>
          </CardContent>
        </Card>
      </div>

      {/* Study activity chart */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('weeklyActivity')}</h3>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weeklyActivity.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-violet-500 rounded-t transition-all"
                  style={{ height: `${(day.minutes / maxMinutes) * 80}px`, minHeight: day.minutes > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-slate-400">{day.day}</span>
                {day.minutes > 0 && (
                  <span className="text-[9px] text-violet-600">{day.minutes}м</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {t('totalStudyTime')}: {formatDuration(totalStudyTime)}
          </div>
        </CardContent>
      </Card>

      {/* Quiz performance */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('quizPerformance')}</h3>
          </div>
          <div className="space-y-3">
            {quizTrends.map((q) => (
              <div key={q.categoryId} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <span className="text-xs text-slate-700 truncate block">{q.name}</span>
                </div>
                <div className="flex-1">
                  <Progress value={q.average} className="h-2" />
                </div>
                <div className="w-12 text-right">
                  <span className={`text-xs font-bold ${
                    q.average >= 80 ? 'text-emerald-600' : q.average >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {q.average}%
                  </span>
                </div>
                <div className="w-5 shrink-0">
                  {q.scores.length >= 2 && (
                    q.trend === 'up' ? (
                      <ArrowUpRight size={14} className="text-emerald-500" />
                    ) : q.trend === 'down' ? (
                      <ArrowDownRight size={14} className="text-red-500" />
                    ) : (
                      <Minus size={14} className="text-slate-400" />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strongest / Weakest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strongestCategory && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star size={14} className="text-emerald-500" />
                <span className="text-xs text-emerald-700 font-semibold">{t('strongest')}</span>
              </div>
              <div className="text-lg font-bold text-emerald-900">{strongestCategory.name}</div>
              <div className="text-xs text-emerald-600">{strongestCategory.average}% средний балл</div>
            </CardContent>
          </Card>
        )}

        {weakestCategory && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-amber-500" />
                <span className="text-xs text-amber-700 font-semibold">{t('weakest')}</span>
              </div>
              <div className="text-lg font-bold text-amber-900">{weakestCategory.name}</div>
              <div className="text-xs text-amber-600">{weakestCategory.average}% средний балл</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Challenge performance */}
      {challengePerformance.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-slate-500" />
              <h3 className="font-semibold text-sm">{t('challengePerformance')}</h3>
            </div>
            <div className="space-y-3">
              {challengePerformance.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <span className="text-xs text-slate-700">{c.name}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={c.percentage} className="h-2" />
                  </div>
                  <div className="text-xs text-slate-500">
                    {c.correct}/{c.total} ({c.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module checklist */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('moduleProgress')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {moduleCompletionRate.map((mod) => (
              <div key={mod.id} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  mod.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                }`}>
                  {mod.completed && <Check size={12} />}
                </div>
                <span className={`text-xs ${mod.completed ? 'text-slate-700' : 'text-slate-400'}`}>
                  {mod.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
