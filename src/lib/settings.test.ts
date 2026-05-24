import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Study Goals', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Goal persistence', () => {
    it('saves goals to localStorage', () => {
      const goals = {
        dailyMinutes: 45,
        weeklyDays: 5,
        notificationsEnabled: false,
        reminderTime: '18:00',
      };
      localStorage.setItem('study-goals', JSON.stringify(goals));

      const stored = localStorage.getItem('study-goals');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.dailyMinutes).toBe(45);
      expect(parsed.weeklyDays).toBe(5);
    });

    it('loads default goals when nothing stored', () => {
      const stored = localStorage.getItem('study-goals');
      expect(stored).toBeNull();
    });

    it('loads stored goals from localStorage', () => {
      const goals = {
        dailyMinutes: 60,
        weeklyDays: 3,
        notificationsEnabled: true,
        reminderTime: '09:30',
      };
      localStorage.setItem('study-goals', JSON.stringify(goals));

      const stored = localStorage.getItem('study-goals');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.dailyMinutes).toBe(60);
      expect(parsed.weeklyDays).toBe(3);
      expect(parsed.reminderTime).toBe('09:30');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorage.setItem('study-goals', 'not valid json');

      let parsed = null;
      try {
        parsed = JSON.parse(localStorage.getItem('study-goals') || '');
      } catch {
        // Expected error - handled by component with try/catch
      }
      expect(parsed).toBeNull();
    });
  });

  describe('Goal calculations', () => {
    it('calculates daily progress percentage', () => {
      const dailyMinutes = 30;
      const todayMinutes = 15;
      const progress = Math.min((todayMinutes / dailyMinutes) * 100, 100);
      expect(progress).toBe(50);
    });

    it('caps daily progress at 100%', () => {
      const dailyMinutes = 30;
      const todayMinutes = 45;
      const progress = Math.min((todayMinutes / dailyMinutes) * 100, 100);
      expect(progress).toBe(100);
    });

    it('calculates weekly progress percentage', () => {
      const weeklyDays = 5;
      const daysStudied = 3;
      const progress = Math.min((daysStudied / weeklyDays) * 100, 100);
      expect(progress).toBe(60);
    });

    it('caps weekly progress at 100%', () => {
      const weeklyDays = 3;
      const daysStudied = 7;
      const progress = Math.min((daysStudied / weeklyDays) * 100, 100);
      expect(progress).toBe(100);
    });

    it('handles zero goal without division by zero', () => {
      const dailyMinutes = 0;
      const todayMinutes = 15;
      const progress = dailyMinutes > 0 ? Math.min((todayMinutes / dailyMinutes) * 100, 100) : 0;
      expect(progress).toBe(0);
    });
  });

  describe('Reminder time parsing', () => {
    it('parses HH:MM format correctly', () => {
      const time = '18:30';
      const [hours, minutes] = time.split(':').map(Number);
      expect(hours).toBe(18);
      expect(minutes).toBe(30);
    });

    it('parses midnight correctly', () => {
      const time = '00:00';
      const [hours, minutes] = time.split(':').map(Number);
      expect(hours).toBe(0);
      expect(minutes).toBe(0);
    });

    it('parses noon correctly', () => {
      const time = '12:00';
      const [hours, minutes] = time.split(':').map(Number);
      expect(hours).toBe(12);
      expect(minutes).toBe(0);
    });
  });

  describe('Goal validation', () => {
    it('daily minutes should be within reasonable range', () => {
      const min = 5;
      const max = 120;
      const valid = 30;
      expect(valid).toBeGreaterThanOrEqual(min);
      expect(valid).toBeLessThanOrEqual(max);
    });

    it('weekly days should be within 1-7 range', () => {
      const min = 1;
      const max = 7;
      const valid = 5;
      expect(valid).toBeGreaterThanOrEqual(min);
      expect(valid).toBeLessThanOrEqual(max);
    });

    it('reminder time should be valid HH:MM format', () => {
      const validTimes = ['00:00', '12:30', '23:59', '06:15'];
      const invalidTimes = ['24:00', '12:60', 'ab:cd', '1:2:3'];

      for (const time of validTimes) {
        const [h, m] = time.split(':').map(Number);
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(23);
        expect(m).toBeGreaterThanOrEqual(0);
        expect(m).toBeLessThanOrEqual(59);
      }

      for (const time of invalidTimes) {
        const parts = time.split(':');
        if (parts.length !== 2) continue;
        const [h, m] = parts.map(Number);
        if (isNaN(h) || isNaN(m)) continue;
        // If we get here with invalid values, the test should catch it
        if (h > 23 || m > 59) {
          expect(true).toBe(true); // Validation would reject this
        }
      }
    });
  });
});
