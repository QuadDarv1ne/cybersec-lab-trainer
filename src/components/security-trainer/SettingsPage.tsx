'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { getTodayTotalMs } from '@/lib/study-sessions';
import { logger } from '@/lib/logger';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTranslations } from '@/lib/intlStub';
import {
  ChevronLeft,
  Bell,
  BellOff,
  Target,
  Clock,
  Calendar,
  Check,
  Settings,
  Flame,
  Zap,
  Info,
} from 'lucide-react';

export interface StudyGoals {
  dailyMinutes: number;
  weeklyDays: number;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM format
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const studySessions = useAppStore((s) => s.studySessions);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const [goals, setGoals] = useState<StudyGoals>({
    dailyMinutes: 30,
    weeklyDays: 5,
    notificationsEnabled: false,
    reminderTime: '18:00',
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [saved, setSaved] = useState(false);
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load goals from localStorage on mount
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('study-goals');
    } catch {
      // localStorage may be inaccessible in private browsing mode
    }
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate that goals have positive values to prevent division by zero
        if (parsed.dailyMinutes > 0 && parsed.weeklyDays > 0) {
          setGoals(parsed);
        }
      } catch (e) {
        logger.warn('Failed to parse study goals from localStorage, data may be corrupted:', e);
        // Clear corrupted data so user can set fresh goals
        try { localStorage.removeItem('study-goals'); } catch { /* ignore */ }
      }
    }
  }, []);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Today's progress
  const todayMinutes = Math.floor(getTodayTotalMs(studySessions) / 60000);
  const dailyProgress = goals.dailyMinutes > 0 ? Math.min((todayMinutes / goals.dailyMinutes) * 100, 100) : 0;

  // Weekly progress
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = new Set<string>();
    studySessions.forEach((s) => {
      const sessionDate = new Date(s.date);
      if (sessionDate >= startOfWeek) {
        // Convert to local date string to match startOfWeek comparison
        const localDate = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`;
        weekDays.add(localDate);
      }
    });

    return goals.weeklyDays > 0 ? Math.min((weekDays.size / goals.weeklyDays) * 100, 100) : 0;
  }, [studySessions, goals.weeklyDays]);

  const saveGoals = () => {
    try {
      localStorage.setItem('study-goals', JSON.stringify(goals));
    } catch {
      // localStorage may be inaccessible in private browsing mode
    }
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);

    // Request notification permission if enabled
    if (goals.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotificationPermission(perm);
        setGoals((prev) => ({ ...prev, notificationsEnabled: perm === 'granted' }));
      }).catch(() => {
        setNotificationPermission('denied');
        setGoals((prev) => ({ ...prev, notificationsEnabled: false }));
      });
    }
  };

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotificationPermission(perm);
        if (perm === 'granted') {
          setGoals((prev) => ({ ...prev, notificationsEnabled: true }));
        }
      }).catch(() => {
        setNotificationPermission('denied');
      });
    }
  };

  // Schedule reminder when goals change
  useEffect(() => {
    if (!goals.notificationsEnabled || notificationPermission !== 'granted') return;
    if (!('Notification' in window)) return;

    const scheduleNext = () => {
      const [hours, minutes] = goals.reminderTime.split(':').map(Number);
      const now = new Date();
      const reminder = new Date();
      reminder.setHours(hours, minutes, 0, 0);

      if (reminder <= now) {
        reminder.setDate(reminder.getDate() + 1);
      }

      const msUntilReminder = reminder.getTime() - now.getTime();
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
      reminderTimerRef.current = setTimeout(() => {
        new Notification('CyberSec Lab', {
          body: t('notificationBody'),
          icon: '/favicon.ico',
        });
        scheduleNext();
      }, msUntilReminder);
    };

    scheduleNext();
    return () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    };
  }, [goals, notificationPermission, t]);

  // Clean up saved timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('dashboard')} aria-label={t('back')}>
          <ChevronLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings size={20} className="text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Today's progress */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-emerald-600" />
              <h3 className="font-semibold text-sm">{t('todayProgress')}</h3>
            </div>
            <Badge className={dailyProgress >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}>
              {dailyProgress >= 100 ? <Check size={12} className="mr-1" /> : null}
              {Math.round(dailyProgress)}%
            </Badge>
          </div>
          <Progress value={dailyProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{t('minutesStudied', { minutes: todayMinutes })}</span>
            <span>{t('goal', { minutes: goals.dailyMinutes })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly progress */}
      <Card className="border-violet-200 bg-violet-50/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-violet-600" />
              <h3 className="font-semibold text-sm">{t('weeklyProgress')}</h3>
            </div>
            <Badge className={weeklyProgress >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}>
              {Math.round(weeklyProgress)}%
            </Badge>
          </div>
          <Progress value={weeklyProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{t('daysStudied', { days: Math.round((weeklyProgress / 100) * goals.weeklyDays) })}</span>
            <span>{t('goalDays', { days: goals.weeklyDays })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily goal */}
      <Card className="border-slate-200">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('dailyGoal')}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-600">{t('minutesPerDay')}</Label>
              <span className="text-sm font-bold text-slate-900">{goals.dailyMinutes} {t('minutes')}</span>
            </div>
            <Slider
              value={[goals.dailyMinutes]}
              onValueChange={([v]) => setGoals((prev) => ({ ...prev, dailyMinutes: v }))}
              min={5}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5 {t('minutes')}</span>
              <span>120 {t('minutes')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly goal */}
      <Card className="border-slate-200">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <h3 className="font-semibold text-sm">{t('weeklyGoal')}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-600">{t('daysPerWeek')}</Label>
              <span className="text-sm font-bold text-slate-900">{goals.weeklyDays} {t('days')}</span>
            </div>
            <Slider
              value={[goals.weeklyDays]}
              onValueChange={([v]) => setGoals((prev) => ({ ...prev, weeklyDays: v }))}
              min={1}
              max={7}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 {t('day')}</span>
              <span>7 {t('days')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-slate-200">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {goals.notificationsEnabled ? (
                <Bell size={16} className="text-emerald-500" />
              ) : (
                <BellOff size={16} className="text-slate-400" />
              )}
              <h3 className="font-semibold text-sm">{t('notifications')}</h3>
            </div>
            <Switch
              checked={goals.notificationsEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  requestNotifications();
                } else {
                  setGoals((prev) => ({ ...prev, notificationsEnabled: false }));
                }
              }}
            />
          </div>

          {goals.notificationsEnabled && notificationPermission === 'granted' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check size={12} className="text-emerald-500" />
                {t('notificationsEnabled')}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-600">{t('reminderTime')}</Label>
                <Input
                  type="time"
                  value={goals.reminderTime}
                  onChange={(e) => setGoals((prev) => ({ ...prev, reminderTime: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500">{t('reminderExplanation')}</p>
              </div>
            </div>
          )}

          {notificationPermission === 'denied' && (
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <Info size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-600">{t('notificationsDenied')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak info */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-amber-600" />
            <h3 className="font-semibold text-sm">{t('streakInfo')}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('streakExplanation')}
          </p>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        onClick={saveGoals}
      >
        {saved ? (
          <>
            <Check size={16} className="mr-2" /> {t('saved')}
          </>
        ) : (
          <>
            <Zap size={16} className="mr-2" /> {t('saveGoals')}
          </>
        )}
      </Button>
    </div>
  );
}
