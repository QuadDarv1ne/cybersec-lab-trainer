import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatDurationShort,
  formatTimerDisplay,
  calculateSessionXP,
  getTodaySessions,
  getTodayTotalMs,
  getTotalStudyTimeMs,
  getWeeklyStats,
  generateSessionId,
  getStreakInfo,
  getHeatmapData,
  type StudySession,
} from './study-sessions';

describe('study-sessions', () => {
  describe('formatDuration', () => {
    it('returns "< 1m" for less than a minute', () => {
      expect(formatDuration(30_000)).toBe('< 1m');
    });

    it('returns minutes for durations under an hour', () => {
      expect(formatDuration(5 * 60_000)).toBe('5m');
      expect(formatDuration(59 * 60_000)).toBe('59m');
    });

    it('returns hours for durations over an hour', () => {
      expect(formatDuration(60 * 60_000)).toBe('1h');
      expect(formatDuration(120 * 60_000)).toBe('2h');
    });

    it('returns hours and minutes for mixed durations', () => {
      expect(formatDuration(90 * 60_000)).toBe('1h 30m');
      expect(formatDuration(125 * 60_000)).toBe('2h 5m');
    });
  });

  describe('formatDurationShort', () => {
    it('returns "<1m" for less than a minute', () => {
      expect(formatDurationShort(30_000)).toBe('<1m');
    });

    it('returns minutes in Russian', () => {
      expect(formatDurationShort(5 * 60_000)).toBe('5м');
    });

    it('returns hours in Russian', () => {
      expect(formatDurationShort(120 * 60_000)).toBe('2ч');
    });

    it('returns hours and minutes in Russian for mixed durations', () => {
      expect(formatDurationShort(90 * 60_000)).toBe('1ч 30м');
    });
  });

  describe('formatTimerDisplay', () => {
    it('formats seconds correctly', () => {
      expect(formatTimerDisplay(0)).toBe('00:00');
      expect(formatTimerDisplay(5_000)).toBe('00:05');
      expect(formatTimerDisplay(59_000)).toBe('00:59');
    });

    it('formats minutes and seconds correctly', () => {
      expect(formatTimerDisplay(60_000)).toBe('01:00');
      expect(formatTimerDisplay(125_000)).toBe('02:05');
      expect(formatTimerDisplay(3661_000)).toBe('61:01');
    });
  });

  describe('calculateSessionXP', () => {
    it('returns 0 XP for sessions less than 5 minutes', () => {
      expect(calculateSessionXP(4 * 60_000)).toBe(0);
    });

    it('returns 1 XP for 5-9 minutes', () => {
      expect(calculateSessionXP(5 * 60_000)).toBe(1);
      expect(calculateSessionXP(9 * 60_000)).toBe(1);
    });

    it('returns 2 XP for 10-14 minutes', () => {
      expect(calculateSessionXP(10 * 60_000)).toBe(2);
    });

    it('caps XP at maximum of 10', () => {
      // 50 minutes = 10 XP (5 min per XP)
      expect(calculateSessionXP(50 * 60_000)).toBe(10);
      // 100 minutes should still be 10 XP (capped)
      expect(calculateSessionXP(100 * 60_000)).toBe(10);
    });
  });

  describe('getTodaySessions', () => {
    it('returns only today\'s sessions', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions: StudySession[] = [
        {
          id: '1',
          date: today.toISOString(),
          durationMs: 60_000,
          pageType: 'dashboard',
          xpEarned: 1,
        },
        {
          id: '2',
          date: yesterday.toISOString(),
          durationMs: 120_000,
          pageType: 'dashboard',
          xpEarned: 2,
        },
      ];

      const result = getTodaySessions(sessions);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns empty array when no sessions today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions: StudySession[] = [
        {
          id: '1',
          date: yesterday.toISOString(),
          durationMs: 60_000,
          pageType: 'dashboard',
          xpEarned: 1,
        },
      ];

      const result = getTodaySessions(sessions);
      expect(result).toHaveLength(0);
    });
  });

  describe('getTodayTotalMs', () => {
    it('sums duration of today\'s sessions', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions: StudySession[] = [
        {
          id: '1',
          date: today.toISOString(),
          durationMs: 5 * 60_000,
          pageType: 'dashboard',
          xpEarned: 1,
        },
        {
          id: '2',
          date: today.toISOString(),
          durationMs: 10 * 60_000,
          pageType: 'dashboard',
          xpEarned: 2,
        },
        {
          id: '3',
          date: yesterday.toISOString(),
          durationMs: 100 * 60_000, // Should be excluded
          pageType: 'dashboard',
          xpEarned: 10,
        },
      ];

      const result = getTodayTotalMs(sessions);
      expect(result).toBe(15 * 60_000);
    });
  });

  describe('getTotalStudyTimeMs', () => {
    it('sums duration of all sessions', () => {
      const sessions: StudySession[] = [
        { id: '1', date: '2024-01-01T10:00:00Z', durationMs: 5 * 60_000, pageType: 'dashboard', xpEarned: 1 },
        { id: '2', date: '2024-01-02T10:00:00Z', durationMs: 10 * 60_000, pageType: 'dashboard', xpEarned: 2 },
      ];

      const result = getTotalStudyTimeMs(sessions);
      expect(result).toBe(15 * 60_000);
    });

    it('returns 0 for empty sessions array', () => {
      expect(getTotalStudyTimeMs([])).toBe(0);
    });
  });

  describe('getWeeklyStats', () => {
    it('returns stats for the requested number of weeks', () => {
      const sessions: StudySession[] = [];
      const result = getWeeklyStats(sessions, 2);
      expect(result).toHaveLength(2);
    });

    it('includes daily breakdown for each week', () => {
      const sessions: StudySession[] = [];
      const result = getWeeklyStats(sessions, 1);
      expect(result[0].dailyBreakdown).toHaveLength(7);
    });

    it('correctly aggregates session data', () => {
      const today = new Date();
      const sessions: StudySession[] = [
        {
          id: '1',
          date: today.toISOString(),
          durationMs: 30 * 60_000,
          pageType: 'dashboard',
          xpEarned: 6,
        },
      ];

      const result = getWeeklyStats(sessions, 1);
      expect(result[0].sessionsCount).toBe(1);
      expect(result[0].totalMinutes).toBe(30);
    });

    it('returns zero stats when no sessions', () => {
      const result = getWeeklyStats([], 1);
      expect(result[0].sessionsCount).toBe(0);
      expect(result[0].totalMinutes).toBe(0);
    });
  });

  describe('generateSessionId', () => {
    it('generates a unique ID with session- prefix', () => {
      const id = generateSessionId();
      expect(id.startsWith('session-')).toBe(true);
    });

    it('generates unique IDs on subsequent calls', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getStreakInfo', () => {
    it('returns zero streaks when no sessions', () => {
      const result = getStreakInfo([]);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
      expect(result.isActive).toBe(false);
      expect(result.todayMinutes).toBe(0);
      expect(result.todaySessions).toBe(0);
    });

    it('calculates current streak for consecutive days', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const sessions: StudySession[] = [
        { id: '1', date: today.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '2', date: yesterday.toISOString(), durationMs: 20 * 60_000, pageType: 'dashboard', xpEarned: 4 },
        { id: '3', date: twoDaysAgo.toISOString(), durationMs: 15 * 60_000, pageType: 'dashboard', xpEarned: 3 },
      ];

      const result = getStreakInfo(sessions);
      expect(result.currentStreak).toBe(3);
      expect(result.isActive).toBe(true);
    });

    it('marks streak as inactive when gap > 1 day', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const sessions: StudySession[] = [
        { id: '1', date: twoDaysAgo.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
      ];

      const result = getStreakInfo(sessions);
      expect(result.isActive).toBe(false);
    });

    it('calculates best streak correctly', () => {
      const today = new Date();
      const d1 = new Date(); d1.setDate(d1.getDate() - 10);
      const d2 = new Date(); d2.setDate(d2.getDate() - 9);
      const d3 = new Date(); d3.setDate(d3.getDate() - 8);
      const d4 = new Date(); d4.setDate(d4.getDate() - 5);
      const d5 = new Date(); d5.setDate(d5.getDate() - 4);

      const sessions: StudySession[] = [
        { id: '1', date: d1.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '2', date: d2.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '3', date: d3.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '4', date: d4.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '5', date: d5.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
        { id: '6', date: today.toISOString(), durationMs: 30 * 60_000, pageType: 'dashboard', xpEarned: 6 },
      ];

      const result = getStreakInfo(sessions);
      expect(result.bestStreak).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getHeatmapData', () => {
    it('returns data for the requested number of weeks', () => {
      const result = getHeatmapData([], 4);
      expect(result.weeks).toBe(4);
      // 4 weeks + possible padding to Sunday
      expect(result.days.length).toBeGreaterThan(28);
      expect(result.days.length).toBeLessThanOrEqual(35);
    });

    it('correctly aggregates minutes from sessions', () => {
      const today = new Date();
      const sessions: StudySession[] = [
        { id: '1', date: today.toISOString(), durationMs: 45 * 60_000, pageType: 'dashboard', xpEarned: 9 },
      ];

      const result = getHeatmapData(sessions, 1);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayData = result.days.find((d) => d.date === todayStr);

      expect(todayData).toBeDefined();
      expect(todayData?.minutes).toBe(45);
      expect(todayData?.level).toBe(2); // 30+ min = level 2
    });

    it('returns level 0 for days without sessions', () => {
      const result = getHeatmapData([], 1);
      expect(result.days.every((d) => d.level === 0)).toBe(true);
    });

    it('caps level at 4 for 120+ minutes', () => {
      const today = new Date();
      const sessions: StudySession[] = [
        { id: '1', date: today.toISOString(), durationMs: 180 * 60_000, pageType: 'dashboard', xpEarned: 10 },
      ];

      const result = getHeatmapData(sessions, 1);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayData = result.days.find((d) => d.date === todayStr);

      expect(todayData?.level).toBe(4);
    });
  });
});
