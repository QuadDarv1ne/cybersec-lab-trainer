import { type PageType } from '@/lib/store';

export interface StudySession {
  id: string;
  date: string; // ISO date string
  durationMs: number;
  pageType: PageType;
  xpEarned: number;
}

export interface DailyBreakdown {
  date: string; // ISO date string
  minutes: number;
  sessions: number;
}

export interface WeeklyStats {
  weekStart: string; // ISO date string
  totalMinutes: number;
  sessionsCount: number;
  dailyBreakdown: DailyBreakdown[];
}

const MIN_MS = 60_000;
const XP_PER_5_MIN = 1;
const MAX_SESSION_XP = 10;

export function formatDuration(ms: number): string {
  if (ms < MIN_MS) return '< 1m';
  const totalMinutes = Math.floor(ms / MIN_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatDurationShort(ms: number): string {
  if (ms < MIN_MS) return '<1m';
  const totalMinutes = Math.floor(ms / MIN_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
  }
  return `${minutes}м`;
}

export function formatTimerDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calculateSessionXP(durationMs: number): number {
  const minutes = Math.floor(durationMs / MIN_MS);
  const xp = Math.floor(minutes / 5) * XP_PER_5_MIN;
  return Math.min(xp, MAX_SESSION_XP);
}

function getStartOfToday(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function isToday(dateStr: string): boolean {
  const sessionDate = new Date(dateStr);
  const today = new Date();
  return (
    sessionDate.getFullYear() === today.getFullYear() &&
    sessionDate.getMonth() === today.getMonth() &&
    sessionDate.getDate() === today.getDate()
  );
}

export function getTodaySessions(sessions: StudySession[]): StudySession[] {
  return sessions.filter((s) => isToday(s.date));
}

export function getTodayTotalMs(sessions: StudySession[]): number {
  return getTodaySessions(sessions).reduce((sum, s) => sum + s.durationMs, 0);
}

export function getTotalStudyTimeMs(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMs, 0);
}

export function getWeeklyStats(sessions: StudySession[], weeksBack = 1): WeeklyStats[] {
  const results: WeeklyStats[] = [];
  const now = new Date();

  for (let w = 0; w < weeksBack; w++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });

    const dailyMap = new Map<string, DailyBreakdown>();
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const key = date.toISOString();
      dailyMap.set(key, { date: key, minutes: 0, sessions: 0 });
    }

    for (const session of weekSessions) {
      const dayKey = new Date(session.date);
      dayKey.setHours(0, 0, 0, 0);
      const key = dayKey.toISOString();
      const entry = dailyMap.get(key);
      if (entry) {
        entry.minutes += Math.floor(session.durationMs / MIN_MS);
        entry.sessions += 1;
      }
    }

    const dailyBreakdown = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalMinutes = dailyBreakdown.reduce((sum, d) => sum + d.minutes, 0);

    results.push({
      weekStart: weekStart.toISOString(),
      totalMinutes,
      sessionsCount: weekSessions.length,
      dailyBreakdown,
    });
  }

  return results;
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
