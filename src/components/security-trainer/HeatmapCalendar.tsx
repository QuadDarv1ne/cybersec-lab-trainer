'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getHeatmapData, type HeatmapDay } from '@/lib/study-sessions';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/intlStub';

const LEVEL_COLORS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-emerald-200 dark:bg-emerald-900/60',
  'bg-emerald-300 dark:bg-emerald-800/70',
  'bg-emerald-400 dark:bg-emerald-700/80',
  'bg-emerald-500 dark:bg-emerald-600/90',
];

export function HeatmapCalendar() {
  const studySessions = useAppStore((state) => state.studySessions);
  const heatmap = useMemo(() => getHeatmapData(studySessions, 26), [studySessions]);
  const t = useTranslations('heatmap');

  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  for (const day of heatmap.days) {
    const dayOfWeek = new Date(day.date).getDay();
    currentWeek.push(day);
    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', minutes: 0, level: 0 });
    }
    weeks.push(currentWeek);
  }

  const totalDays = heatmap.days.filter((d) => d.minutes > 0).length;
  const totalMinutes = heatmap.days.reduce((sum, d) => sum + d.minutes, 0);

  const durationDisplay = totalMinutes >= 60
    ? t('hoursMinutes', { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 })
    : t('minutesShort', { minutes: totalMinutes });

  const dayLabels = [
    '', t('days.mon'), '', t('days.wed'), '', t('days.fri'), ''
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {t('title')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('duration', { days: totalDays, duration: durationDisplay })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          <div className="flex flex-col gap-[3px] mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-3 w-6 text-[10px] text-slate-400 dark:text-slate-500 leading-3">
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <Tooltip key={di} day={day} t={t}>
                    <div
                      className={`h-3 w-3 rounded-sm ${LEVEL_COLORS[day.level]} transition-colors hover:ring-1 hover:ring-slate-400`}
                    />
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{t('less')}</span>
          <div className="flex gap-[3px]">
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
            ))}
          </div>
          <span>{t('more')}</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400">
              <div className={`h-2 w-2 rounded-sm ${LEVEL_COLORS[i]}`} />
              {t(`levelLabels.${i}` as const)}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Tooltip({ day, children, t }: { day: HeatmapDay; children: React.ReactNode; t: ReturnType<typeof useTranslations> }) {
  if (!day.date) return <>{children}</>;

  const dateObj = new Date(day.date + 'T00:00:00');
  const displayDate = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="group relative">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50">
        <div className="rounded bg-slate-800 px-2 py-1 text-xs text-white whitespace-nowrap dark:bg-slate-200 dark:text-slate-900">
          {day.minutes > 0 ? t('tooltip.withActivity', { minutes: day.minutes }) : t('tooltip.noActivity')}
          <div className="text-[10px] opacity-75">{displayDate}</div>
        </div>
      </div>
    </div>
  );
}
