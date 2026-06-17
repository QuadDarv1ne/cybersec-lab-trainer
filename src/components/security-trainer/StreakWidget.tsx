'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Clock, Sparkles, Zap, Target } from 'lucide-react';
import { getStreakInfo } from '@/lib/study-sessions';
import { useAppStore } from '@/lib/store';
import { useTranslations, formatDate } from '@/lib/intlStub';

function formatDayCount(n: number, t: ReturnType<typeof useTranslations>): string {
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return t('dayCount_many', { count: n });
  if (lastDigit === 1) return t('dayCount_one', { count: n });
  if (lastDigit >= 2 && lastDigit <= 4) return t('dayCount_few', { count: n });
  return t('dayCount_many', { count: n });
}

function getMotivationalMessage(streak: number): { text: string; icon: React.ReactNode } {
  if (streak >= 30) return { text: 'Legendary streak! 🔥', icon: <Zap size={14} className="text-purple-500" /> };
  if (streak >= 14) return { text: 'Unstoppable! Keep going!', icon: <Zap size={14} className="text-orange-500" /> };
  if (streak >= 7) return { text: 'One week strong! Great habit!', icon: <Sparkles size={14} className="text-amber-500" /> };
  if (streak >= 3) return { text: 'Keep the momentum going!', icon: <Target size={14} className="text-emerald-500" /> };
  if (streak >= 1) return { text: 'Nice start! Come back tomorrow!', icon: <Sparkles size={14} className="text-emerald-400" /> };
  return { text: 'Start your streak today!', icon: <Flame size={14} className="text-slate-400" /> };
}

function WeekMiniView({ studySessions }: { studySessions: { date: string }[] }) {
  const today = new Date();
  const dayStrs = studySessions.map((s) => s.date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="flex justify-center gap-1 mt-3">
      {days.map((date) => {
        const active = dayStrs.includes(date);
        return (
          <div
            key={date}
            className={`w-6 h-6 rounded-sm text-[9px] font-mono flex items-center justify-center transition-colors ${
              active
                ? 'bg-emerald-400 dark:bg-emerald-500 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400'
            }`}
            title={date}
          >
            {formatDate(date, { weekday: 'narrow' })}
          </div>
        );
      })}
    </div>
  );
}

export function StreakWidget() {
  const studySessions = useAppStore((state) => state.studySessions);
  const streak = useMemo(() => getStreakInfo(studySessions), [studySessions]);
  const t = useTranslations('streak');

  const streakFireColor = streak.currentStreak >= 7 ? 'text-orange-500' : streak.currentStreak >= 3 ? 'text-amber-500' : 'text-emerald-500';
  const streakBgColor = streak.currentStreak >= 7 ? 'from-orange-500/10 to-amber-500/10' : streak.currentStreak >= 3 ? 'from-amber-500/10 to-yellow-500/10' : 'from-emerald-500/10 to-teal-500/10';
  const message = getMotivationalMessage(streak.currentStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br ${streakBgColor} dark:border-emerald-800/50 p-4`}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={streak.isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: streak.isActive ? Infinity : 0, repeatDelay: 2 }}
          className={`flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 ${streakFireColor}`}
        >
          <Flame className="w-5 h-5" />
        </motion.div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {t('title')}
        </h3>
        {streak.isActive && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('active')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${streakFireColor}`}>
            {streak.currentStreak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formatDayCount(streak.currentStreak, t)}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center text-amber-500 mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {streak.bestStreak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t('record')}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center text-blue-500 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {streak.todayMinutes}м
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t('today')}
          </div>
        </div>
      </div>

      <WeekMiniView studySessions={studySessions} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
      >
        {message.icon}
        <span>{message.text}</span>
      </motion.div>
    </motion.div>
  );
}
