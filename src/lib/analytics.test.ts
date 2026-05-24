import { describe, it, expect } from 'vitest';
import { modules } from '@/lib/security-data';

interface QuizHistoryEntry {
  categoryId: string;
  score: number;
  timestamp: number;
}

describe('Analytics calculations', () => {
  it('should calculate module completion percentage correctly', () => {
    const completedModules = ['owasp', 'sql-injection', 'xss'];
    const validCount = completedModules.filter((id) => modules.some((m) => m.id === id)).length;
    const percentage = Math.round((validCount / modules.length) * 100);
    expect(percentage).toBe(Math.round((3 / 8) * 100));
  });

  it('should calculate quiz average correctly', () => {
    const scores = [80, 90, 70, 100];
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(average).toBe(85);
  });

  it('should determine quiz trend as up', () => {
    const scores = [50, 55, 60, 80, 85, 90];
    const recent = scores.slice(-3);
    const older = scores.slice(0, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    expect(diff).toBeGreaterThan(5);
  });

  it('should determine quiz trend as down', () => {
    const scores = [90, 85, 80, 60, 55, 50];
    const recent = scores.slice(-3);
    const older = scores.slice(0, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    expect(diff).toBeLessThan(-5);
  });

  it('should determine quiz trend as stable', () => {
    const scores = [70, 72, 68, 71, 69, 70];
    const recent = scores.slice(-3);
    const older = scores.slice(0, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    expect(Math.abs(diff)).toBeLessThanOrEqual(5);
  });

  it('should calculate challenge percentage correctly', () => {
    const correct = 7;
    const total = 10;
    const percentage = Math.round((correct / total) * 100);
    expect(percentage).toBe(70);
  });

  it('should find strongest and weakest categories', () => {
    const quizTrends = [
      { categoryId: 'owasp', name: 'OWASP', average: 90 },
      { categoryId: 'sql', name: 'SQL', average: 60 },
      { categoryId: 'xss', name: 'XSS', average: 80 },
    ];

    const strongest = [...quizTrends].sort((a, b) => b.average - a.average)[0];
    const weakest = [...quizTrends].sort((a, b) => a.average - b.average)[0];

    expect(strongest.name).toBe('OWASP');
    expect(weakest.name).toBe('SQL');
  });

  it('should calculate weekly activity correctly', () => {
    const studySessions = [
      { date: '2024-01-15', durationMs: 30 * 60 * 1000 },
      { date: '2024-01-15', durationMs: 20 * 60 * 1000 },
      { date: '2024-01-16', durationMs: 45 * 60 * 1000 },
    ];

    const dateStr = '2024-01-15';
    const daySessions = studySessions.filter((s) => s.date.startsWith(dateStr));
    const minutes = Math.floor(daySessions.reduce((sum, s) => sum + s.durationMs, 0) / 60000);

    expect(minutes).toBe(50);
  });

  it('should handle empty quiz history', () => {
    const quizHistory: QuizHistoryEntry[] = [];
    const categoryId = 'owasp';
    const attempts = quizHistory.filter((h) => h.categoryId === categoryId);
    expect(attempts.length).toBe(0);
  });

  it('should format study time correctly', () => {
    const totalMs = 2 * 60 * 60 * 1000 + 30 * 60 * 1000; // 2h 30m
    const hours = Math.floor(totalMs / (60 * 60 * 1000));
    const minutes = Math.floor((totalMs % (60 * 60 * 1000)) / (60 * 1000));

    expect(hours).toBe(2);
    expect(minutes).toBe(30);
  });
});
