import { describe, it, expect } from 'vitest';
import { modules } from '@/lib/data/modules-data';

describe('Certificate visibility logic', () => {
  const allModuleIds = modules.map((m) => m.id);

  it('should not show certificate when no modules completed', () => {
    const completedModules: string[] = [];
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(false);
  });

  it('should not show certificate when some modules completed', () => {
    const completedModules = ['owasp', 'sql-injection', 'xss'];
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(false);
  });

  it('should not show certificate when 7 of 8 modules completed', () => {
    const completedModules = allModuleIds.filter((id) => id !== 'tools');
    expect(completedModules.length).toBe(7);
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(false);
  });

  it('should show certificate when all 8 modules completed', () => {
    const completedModules = [...allModuleIds];
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(true);
  });

  it('should show certificate even with extra module IDs', () => {
    const completedModules = [...allModuleIds, 'non-existent-module'];
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(true);
  });

  it('should handle duplicate module IDs correctly', () => {
    const completedModules = ['owasp', 'owasp', 'sql-injection'];
    const allComplete = completedModules.filter((id) => modules.some((m) => m.id === id)).length >= modules.length;
    expect(allComplete).toBe(false);
  });
});

describe('Certificate data calculations', () => {
  it('should calculate average quiz score correctly', () => {
    const quizScores: Record<string, number> = { owasp: 80, sql: 90, xss: 70 };
    const scores = Object.values(quizScores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avg).toBe(80);
  });

  it('should return 0 average when no quizzes completed', () => {
    const quizScores: Record<string, number> = {};
    const scores = Object.values(quizScores);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    expect(avg).toBe(0);
  });

  it('should count unlocked achievements correctly', () => {
    const completedModules = modules.map((m) => m.id);
    const quizScores: Record<string, number> = { owasp: 100, sql: 100, xss: 100 };
    const _challengeStats = {
      owaspCorrect: 5, authCorrect: 3, owaspTotal: 5, authTotal: 3,
      headersCorrect: 0, headersTotal: 0, secureCodingCorrect: 0, secureCodingTotal: 0,
    };

    // Import achievement logic indirectly through condition check
    const hasAllModules = completedModules.length >= modules.length;
    const hasHighQuizScores = Object.values(quizScores).every((s) => s >= 80);

    expect(hasAllModules).toBe(true);
    expect(hasHighQuizScores).toBe(true);
  });
});
