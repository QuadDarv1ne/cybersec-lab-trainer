'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Clock } from 'lucide-react';
import { getStreakInfo, formatDuration } from '@/lib/study-sessions';
import { useAppStore } from '@/lib/store';

export function StreakWidget() {
  const studySessions = useAppStore((state) => state.studySessions);
  const streak = getStreakInfo(studySessions);

  const streakFireColor = streak.currentStreak >= 7 ? 'text-orange-500' : streak.currentStreak >= 3 ? 'text-amber-500' : 'text-emerald-500';
  const streakBgColor = streak.currentStreak >= 7 ? 'from-orange-500/10 to-amber-500/10' : streak.currentStreak >= 3 ? 'from-amber-500/10 to-yellow-500/10' : 'from-emerald-500/10 to-teal-500/10';

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
          Трекер серий
        </h3>
        {streak.isActive && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Активна
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${streakFireColor}`}>
            {streak.currentStreak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {streak.currentStreak === 1 ? 'день' : streak.currentStreak < 5 ? 'дня' : 'дней'}
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
            Рекорд
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
            Сегодня
          </div>
        </div>
      </div>

      {!streak.isActive && streak.currentStreak === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400"
        >
          Начни учиться сегодня, чтобы запустить серию!
        </motion.p>
      )}
    </motion.div>
  );
}
