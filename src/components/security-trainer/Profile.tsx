'use client';

import { useAppStore } from '@/lib/store';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Clock, Target, Zap, Star, GraduationCap, CheckCircle2, BarChart3 } from 'lucide-react';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/lib/rbac-types';
import { modules } from '@/lib/data/modules-data';
import { quizCategories } from '@/lib/data/quiz-data';
import { calculateLevel, levelProgress, xpToNextLevel, calculateXPBreakdown } from '@/lib/xp-system';

export default function Profile() {
  const { session, isAuthenticated, isLoading } = useSession();
  const store = useAppStore();
  const completedModules = store.completedModules;
  const quizScores = store.quizScores;
  const totalXP = store.totalXP;
  const studySessions = store.studySessions;
  const _userId = store.userId;

  const level = calculateLevel(totalXP);
  const progress = levelProgress(totalXP);
  const xpToNext = xpToNextLevel(totalXP);

  const allChallengeCorrect =
    (store.owaspChallengeScores?.correct ?? 0) +
    (store.authChallengeScores?.correct ?? 0) +
    (store.headersChallengeScores?.correct ?? 0) +
    (store.secureCodingChallengeScores?.correct ?? 0);

  const breakdown = calculateXPBreakdown(completedModules, quizScores, allChallengeCorrect, 0, modules.length);

  const totalStudyMs = studySessions.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayStudyMs = studySessions
    .filter((s) => String(s.date).startsWith(todayStr))
    .reduce((sum, s) => sum + (s.durationMs ?? 0), 0);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}ч ${minutes % 60}м` : `${minutes}м`;
  };

  const user = session?.user;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>Войдите в систему, чтобы увидеть профиль</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-emerald-500">
          <AvatarImage src={user.image || undefined} alt={user.name || ''} />
          <AvatarFallback className="text-xl bg-emerald-600 text-white">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name || 'Пользователь'}</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className={ROLE_BADGE_COLORS[user.role as keyof typeof ROLE_BADGE_COLORS]}>
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Level & XP Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20">
                <GraduationCap size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold">{level}</p>
                <p className="text-sm text-emerald-200">Уровень</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalXP}</p>
              <p className="text-sm text-emerald-200">Всего XP</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-white" />
          <div className="flex justify-between mt-2 text-xs text-emerald-200">
            <span>Прогресс до {level + 1} уровня</span>
            <span>{xpToNext} XP осталось</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen size={20} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{completedModules.length}/{modules.length}</p>
              <p className="text-xs text-slate-500">Модулей пройдено</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Brain size={20} className="text-purple-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{Object.keys(quizScores).length}/{quizCategories.length}</p>
              <p className="text-xs text-slate-500">Квизов пройдено</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock size={20} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{formatDuration(totalStudyMs)}</p>
              <p className="text-xs text-slate-500">Всего занятий</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Zap size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{studySessions.length}</p>
              <p className="text-xs text-slate-500">Сессий изучения</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XP Breakdown & Study Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              Распределение XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Модули', value: breakdown.modules, color: 'bg-blue-500' },
                { label: 'Квизы', value: breakdown.quizzes, color: 'bg-purple-500' },
                { label: 'Челленджи', value: breakdown.challenges, color: 'bg-amber-500' },
                { label: 'Бонусы', value: breakdown.bonuses, color: 'bg-emerald-500' },
                { label: 'Занятия', value: breakdown.studySessions, color: 'bg-sky-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium">{item.value} XP</span>
                  </div>
                  <Progress
                    value={breakdown.total > 0 ? (item.value / breakdown.total) * 100 : 0}
                    className={`h-1.5 bg-slate-100 [&>div]:${item.color}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Статистика занятий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Сегодня</span>
                <span className="font-semibold">{formatDuration(todayStudyMs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Всего</span>
                <span className="font-semibold">{formatDuration(totalStudyMs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Всего сессий</span>
                <span className="font-semibold">{studySessions.length}</span>
              </div>
              {totalStudyMs > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-400 mb-1">
                    XP от занятий: {breakdown.studySessions} / {totalXP} (
                    {totalXP > 0 ? Math.round((breakdown.studySessions / totalXP) * 100) : 0}%)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={16} className="text-emerald-500" />
            Пройденные модули
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedModules.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Пока не пройдено ни одного модуля</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {modules
                .filter((m) => completedModules.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-sm">{m.title}</span>
                  </div>
                ))}
            </div>
          )}
          {completedModules.length > 0 && completedModules.length < modules.length && (
            <p className="text-xs text-slate-400 mt-3">
              Чтобы получить бонус «100% завершение» (+500 XP), пройдите все модули
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quiz Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Результаты квизов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(quizScores).length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Пока не пройдено ни одного квиза</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quizCategories.map((qc) => {
                const score = quizScores[qc.id];
                if (score === undefined) return null;
                return (
                  <div key={qc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <span className="text-sm font-medium">{qc.name}</span>
                    <Badge variant={score >= 80 ? 'default' : score >= 50 ? 'secondary' : 'outline'}>
                      {Math.round(score)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
