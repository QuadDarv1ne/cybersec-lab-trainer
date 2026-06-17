'use client';

import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Zap, Trophy } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '@/lib/intlStub';

function LevelUpCelebration({ level, onComplete }: { level: number; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl z-10"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        </motion.div>
        <p className="text-lg font-bold text-amber-600">Level Up!</p>
        <p className="text-3xl font-black text-amber-500">{level}</p>
      </div>
    </motion.div>
  );
}

export default function XPDisplay() {
  const t = useTranslations('xp');
  const totalXP = useAppStore((s) => s.totalXP);
  const getXPLevel = useAppStore((s) => s.getXPLevel);
  const getXPBreakdown = useAppStore((s) => s.getXPBreakdown);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);
  const xpInfo = getXPLevel();
  const breakdown = getXPBreakdown();

  useEffect(() => {
    if (prevLevelRef.current !== null && xpInfo.level > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = xpInfo.level;
  }, [xpInfo.level]);

  return (
    <div className="space-y-2 relative">
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpCelebration level={xpInfo.level} onComplete={() => setShowLevelUp(false)} />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            {xpInfo.level}
          </motion.div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
            <Zap size={10} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-700">
              {t('level', { level: xpInfo.level })}
            </span>
            <span className="text-xs text-slate-500">
              {totalXP} XP
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full relative"
            >
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-8 bg-white/20 blur-sm"
              />
            </motion.div>
          </div>
          {xpInfo.xpToNext > 0 && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('xpToNext', { xp: xpInfo.xpToNext, level: xpInfo.level + 1 })}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600"
          aria-label="XP breakdown"
        >
          <motion.div
            animate={{ rotate: showBreakdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <TrendingUp size={18} />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2 overflow-hidden"
          >
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('breakdownTitle')}</p>
            {[
              { label: t('modules'), value: breakdown.modules, icon: <Star size={14} className="text-emerald-500" /> },
              { label: t('quizzes'), value: breakdown.quizzes, icon: <Star size={14} className="text-amber-500" /> },
              { label: t('challenges'), value: breakdown.challenges, icon: <Star size={14} className="text-sky-500" /> },
              { label: t('bonuses'), value: breakdown.bonuses, icon: <Star size={14} className="text-violet-500" /> },
              { label: t('study'), value: breakdown.studySessions, icon: <Star size={14} className="text-rose-500" /> },
            ].filter((item) => item.value > 0).map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">+{item.value} XP</span>
              </motion.div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('total')}</span>
              <span className="text-sm font-bold text-amber-600">{breakdown.total} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
