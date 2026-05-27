import { type PageType } from '@/lib/store';
import { generateUUID } from './utils';

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

export interface StreakInfo {
  currentStreak: number; // consecutive days with at least one session
  bestStreak: number; // longest consecutive day streak ever
  todayMinutes: number;
  todaySessions: number;
  isActive: boolean; // true if studied today or yesterday (streak still alive)
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = none, 1-4 = intensity
}

export interface HeatmapData {
  days: HeatmapDay[];
  weeks: number; // number of weeks spanned
  startDate: string;
  endDate: string;
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
    weekEnd.setHours(23, 59, 59, 999);

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
  return `session-${Date.now()}-${generateUUID()}`;
}

/**
 * Convert a date to YYYY-MM-DD string in local timezone
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string back to a Date (at midnight local time)
 */
function fromDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get unique dates with study sessions as YYYY-MM-DD strings
 */
function getStudyDates(sessions: StudySession[]): Set<string> {
  const dateSet = new Set<string>();
  for (const session of sessions) {
    const d = new Date(session.date);
    dateSet.add(toDateString(d));
  }
  return dateSet;
}

/**
 * Calculate streak information: current streak, best streak, today's stats
 */
export function getStreakInfo(sessions: StudySession[]): StreakInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateString(today);

  const todayMinutes = getTodayTotalMs(sessions) / MIN_MS;
  const todaySessions = getTodaySessions(sessions).length;

  // Get all unique study dates sorted
  const studyDates = Array.from(getStudyDates(sessions)).sort().reverse();

  if (studyDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, todayMinutes: 0, todaySessions: 0, isActive: false };
  }

  // Check if streak is active (studied today or yesterday)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);
  const isActive = studyDates[0] === todayStr || studyDates[0] === yesterdayStr;

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(today);

  // If didn't study today, start checking from yesterday
  if (studyDates[0] !== todayStr) {
    checkDate = new Date(yesterday);
  }

  for (const dateStr of studyDates) {
    const expectedStr = toDateString(checkDate);
    if (dateStr === expectedStr) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expectedStr) {
      // Gap found, streak broken
      break;
    }
    // If dateStr > expectedStr, skip (future date or duplicate)
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of [...studyDates].reverse()) {
    const currentDate = fromDateString(dateStr);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    prevDate = currentDate;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    todayMinutes: Math.floor(todayMinutes),
    todaySessions,
    isActive,
  };
}

/**
 * Generate heatmap data for the last N weeks (default 26 weeks ≈ 6 months)
 */
export function getHeatmapData(sessions: StudySession[], weeksBack = 26): HeatmapData {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Calculate start date (go back to the Sunday of the first week)
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksBack * 7);
  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const endDate = new Date(now);

  // Build a map of date -> minutes
  const minutesMap = new Map<string, number>();
  for (const session of sessions) {
    const dateStr = toDateString(new Date(session.date));
    const existing = minutesMap.get(dateStr) || 0;
    minutesMap.set(dateStr, existing + Math.floor(session.durationMs / MIN_MS));
  }

  // Generate all days from startDate to endDate
  const days: HeatmapDay[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = toDateString(current);
    const minutes = minutesMap.get(dateStr) || 0;

    // Determine intensity level (similar to GitHub contributions)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (minutes > 0) level = 1;
    if (minutes >= 30) level = 2;
    if (minutes >= 60) level = 3;
    if (minutes >= 120) level = 4;

    days.push({ date: dateStr, minutes, level });
    current.setDate(current.getDate() + 1);
  }

  return {
    days,
    weeks: weeksBack,
    startDate: toDateString(startDate),
    endDate: toDateString(endDate),
  };
}
