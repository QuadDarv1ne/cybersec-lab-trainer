'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/lib/intlStub';

export default function XPDisplay() {
  const t = useTranslations('xp');
  const totalXP = useAppStore((s) => s.totalXP);
  const getXPLevel = useAppStore((s) => s.getXPLevel);
  const getXPBreakdown = useAppStore((s) => s.getXPBreakdown);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const xpInfo = getXPLevel();
  const breakdown = getXPBreakdown();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            {xpInfo.level}
          </motion.div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
        </div>

        {/* XP bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-700">
              {t('level', { level: xpInfo.level })}
            </span>
            <span className="text-xs text-slate-500">
              {totalXP} XP
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
          {xpInfo.xpToNext > 0 && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('xpToNext', { xp: xpInfo.xpToNext, level: xpInfo.level + 1 })}
            </p>
          )}
        </div>

        {/* Breakdown toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          aria-label="XP breakdown"
        >
          <TrendingUp size={18} />
        </button>
      </div>

      {/* XP breakdown */}
      {showBreakdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-50 rounded-lg p-3 space-y-2"
        >
          <p className="text-xs font-medium text-slate-600">{t('breakdownTitle')}</p>
          {[
            { label: t('modules'), value: breakdown.modules, icon: <Star size={14} className="text-emerald-500" /> },
            { label: t('quizzes'), value: breakdown.quizzes, icon: <Star size={14} className="text-amber-500" /> },
            { label: t('challenges'), value: breakdown.challenges, icon: <Star size={14} className="text-sky-500" /> },
            { label: t('bonuses'), value: breakdown.bonuses, icon: <Star size={14} className="text-violet-500" /> },
            { label: t('study'), value: breakdown.studySessions, icon: <Star size={14} className="text-rose-500" /> },
          ].filter((item) => item.value > 0).map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {item.icon}
                <span className="text-slate-600">{item.label}</span>
              </div>
              <span className="font-medium text-slate-800">+{item.value} XP</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{t('total')}</span>
            <span className="text-sm font-bold text-amber-600">{breakdown.total} XP</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
