'use client';

import { useAppStore } from '@/lib/store';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Clock, Target, Zap, Star, GraduationCap, CheckCircle2, BarChart3, Sparkles, Timer, Trophy } from 'lucide-react';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/lib/rbac-types';
import { modules } from '@/lib/data/modules-data';
import { quizCategories } from '@/lib/data/quiz-data';
import { calculateLevel, levelProgress, xpToNextLevel, calculateXPBreakdown } from '@/lib/xp-system';
import { calculateSessionXP, getTotalStudyTimeMs } from '@/lib/study-sessions';

const statConfig = [
  { icon: BookOpen, gradient: 'from-emerald-500 to-teal-500', bgClass: 'bg-emerald-50 dark:bg-emerald-950/30', borderClass: 'border-emerald-200 dark:border-emerald-800/30' },
  { icon: Brain, gradient: 'from-purple-500 to-violet-500', bgClass: 'bg-purple-50 dark:bg-purple-950/30', borderClass: 'border-purple-200 dark:border-purple-800/30' },
  { icon: Clock, gradient: 'from-amber-500 to-orange-500', bgClass: 'bg-amber-50 dark:bg-amber-950/30', borderClass: 'border-amber-200 dark:border-amber-800/30' },
  { icon: Zap, gradient: 'from-sky-500 to-cyan-500', bgClass: 'bg-sky-50 dark:bg-sky-950/30', borderClass: 'border-sky-200 dark:border-sky-800/30' },
];

const xpItems = [
  { label: 'Модули', key: 'modules' as const, color: 'bg-blue-500' },
  { label: 'Квизы', key: 'quizzes' as const, color: 'bg-purple-500' },
  { label: 'Челленджи', key: 'challenges' as const, color: 'bg-amber-500' },
  { label: 'Бонусы', key: 'bonuses' as const, color: 'bg-emerald-500' },
  { label: 'Занятия', key: 'studySessions' as const, color: 'bg-sky-500' },
];

export default function Profile() {
  const { session, isAuthenticated, isLoading } = useSession();
  const store = useAppStore();
  const completedModules = store.completedModules;
  const quizScores = store.quizScores;
  const totalXP = store.totalXP;
  const studySessions = store.studySessions;

  const level = calculateLevel(totalXP);
  const progress = levelProgress(totalXP);
  const xpToNext = xpToNextLevel(totalXP);

  const allChallengeCorrect =
    (store.owaspChallengeScores?.correct ?? 0) +
    (store.authChallengeScores?.correct ?? 0) +
    (store.headersChallengeScores?.correct ?? 0) +
    (store.secureCodingChallengeScores?.correct ?? 0);

  const studySessionXP = calculateSessionXP(getTotalStudyTimeMs(studySessions));
  const breakdown = calculateXPBreakdown(completedModules, quizScores, allChallengeCorrect, studySessionXP, modules.length);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-emerald-500 shadow-lg">
          <AvatarImage src={user.image || undefined} alt={user.name || ''} />
          <AvatarFallback className="text-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name || 'Пользователь'}</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <div className="flex gap-2 mt-1.5">
            <Badge variant="secondary" className={`${ROLE_BADGE_COLORS[user.role as keyof typeof ROLE_BADGE_COLORS]} rounded-full`}>
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/15">
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
          <Progress value={progress} className="h-2 bg-white/15 [&>div]:bg-white" />
          <div className="flex justify-between mt-2 text-xs text-emerald-200">
            <span>Прогресс до {level + 1} уровня</span>
            <span>{xpToNext} XP осталось</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: `${completedModules.length}/${modules.length}`, label: 'Модулей пройдено', idx: 0 },
          { value: `${Object.keys(quizScores).length}/${quizCategories.length}`, label: 'Квизов пройдено', idx: 1 },
          { value: formatDuration(totalStudyMs), label: 'Всего занятий', idx: 2 },
          { value: studySessions.length.toString(), label: 'Сессий изучения', idx: 3 },
        ].map((stat, i) => {
          const cfg = statConfig[i];
          const Icon = cfg.icon;
          return (
            <Card key={stat.label} className={`border ${cfg.borderClass} ${cfg.bgClass} card-hover`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              Распределение XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {xpItems.map((item) => {
                const value = breakdown[item.key];
                const pct = breakdown.total > 0 ? (value / breakdown.total) * 100 : 0;
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{value} XP</span>
                    </div>
                    <Progress value={pct} className={`h-2 bg-slate-100 dark:bg-slate-800 [&>div]:${item.color}`} />
                  </div>
                );
              })}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Всего</span>
                  <span className="font-bold text-emerald-600">{breakdown.total} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Timer size={16} className="text-amber-500" />
              Статистика занятий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Сегодня', value: formatDuration(todayStudyMs), icon: Star },
                { label: 'Всего', value: formatDuration(totalStudyMs), icon: Clock },
                { label: 'Сессий', value: `${studySessions.length}`, icon: Zap },
                { label: 'XP от занятий', value: `${breakdown.studySessions} XP (${totalXP > 0 ? Math.round((breakdown.studySessions / totalXP) * 100) : 0}%)`, icon: Trophy },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className="text-amber-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={16} className="text-emerald-500" />
            Пройденные модули
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedModules.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Пока не пройдено ни одного модуля</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {modules
                .filter((m) => completedModules.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-800/20">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{m.title}</span>
                  </div>
                ))}
            </div>
          )}
          {completedModules.length > 0 && completedModules.length < modules.length && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-800/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Sparkles size={14} />
                Чтобы получить бонус «100% завершение» (+500 XP), пройдите все модули
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Результаты квизов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(quizScores).length === 0 ? (
            <div className="text-center py-8">
              <Brain size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Пока не пройдено ни одного квиза</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quizCategories.map((qc) => {
                const score = quizScores[qc.id];
                if (score === undefined) return null;
                const scoreColor = score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                  score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400';
                return (
                  <div key={qc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{qc.name}</span>
                    <Badge className={`${scoreColor} border-0 rounded-full`}>
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
