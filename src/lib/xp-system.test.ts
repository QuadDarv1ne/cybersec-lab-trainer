import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  xpToNextLevel,
  levelProgress,
  calculateXPBreakdown,
  XP_REWARDS,
  MAX_LEVEL,
} from './xp-system';

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns level 1 for negative XP', () => {
    expect(calculateLevel(-50)).toBe(1);
  });

  it('returns level 2 at 100 XP', () => {
    // Level 2 requires 100 XP (level 1 * 100)
    expect(calculateLevel(100)).toBe(2);
  });

  it('returns level 3 at 300 XP total', () => {
    // Level 1: 100, Level 2: 200, total = 300
    expect(calculateLevel(300)).toBe(3);
  });

  it('returns level 4 at 600 XP total', () => {
    // Level 1: 100, Level 2: 200, Level 3: 300, total = 600
    expect(calculateLevel(600)).toBe(4);
  });

  it('stays at level 2 with 150 XP (not enough for level 3)', () => {
    expect(calculateLevel(150)).toBe(2);
  });

  it('caps at MAX_LEVEL', () => {
    // Calculate XP needed for MAX_LEVEL
    let xpForMax = 0;
    for (let i = 1; i < MAX_LEVEL; i++) {
      xpForMax += i * 100;
    }
    expect(calculateLevel(xpForMax)).toBe(MAX_LEVEL);
    expect(calculateLevel(xpForMax + 100000)).toBe(MAX_LEVEL);
  });
});

describe('xpToNextLevel', () => {
  it('returns 0 at max level', () => {
    let xpForMax = 0;
    for (let i = 1; i < MAX_LEVEL; i++) {
      xpForMax += i * 100;
    }
    expect(xpToNextLevel(xpForMax)).toBe(0);
  });

  it('returns 100 XP needed from 0 XP (level 1)', () => {
    expect(xpToNextLevel(0)).toBe(100);
  });

  it('returns 50 XP needed from 50 XP (level 1)', () => {
    expect(xpToNextLevel(50)).toBe(50);
  });

  it('returns 200 XP needed from exactly level 2 (100 XP)', () => {
    // At level 2, need 200 XP for level 3
    expect(xpToNextLevel(100)).toBe(200);
  });

  it('returns 150 XP needed from 150 XP (level 2)', () => {
    // At 150 XP: level 2, need 300 total for level 3 (100+200), so 150 more needed
    expect(xpToNextLevel(150)).toBe(150);
  });
});

describe('levelProgress', () => {
  it('returns 0% at start of level', () => {
    expect(levelProgress(0)).toBe(0);
  });

  it('returns 50% halfway through level 1', () => {
    expect(levelProgress(50)).toBe(50);
  });

  it('returns 100% at exact level threshold', () => {
    // At exactly 100 XP, should be at start of level 2, so 0% progress
    // Actually at 100 XP you've completed level 1, so you're at level 2 with 0%
    expect(levelProgress(100)).toBe(0);
  });

  it('returns 100% at max level', () => {
    let xpForMax = 0;
    for (let i = 1; i < MAX_LEVEL; i++) {
      xpForMax += i * 100;
    }
    expect(levelProgress(xpForMax)).toBe(100);
  });
});

describe('calculateXPBreakdown', () => {
  it('returns all zeros for empty state', () => {
    const breakdown = calculateXPBreakdown([], {}, 0, 0);
    expect(breakdown).toEqual({
      modules: 0,
      quizzes: 0,
      challenges: 0,
      bonuses: 0,
      studySessions: 0,
      total: 0,
    });
  });

  it('awards module XP correctly', () => {
    const breakdown = calculateXPBreakdown(['owasp', 'xss'], {}, 0, 0);
    expect(breakdown.modules).toBe(2 * XP_REWARDS.completeModule);
    expect(breakdown.total).toBe(2 * XP_REWARDS.completeModule + XP_REWARDS.firstModuleComplete);
  });

  it('awards first module bonus once and persists for all subsequent modules', () => {
    // 1 module: should get first module bonus
    const one = calculateXPBreakdown(['owasp'], {}, 0, 0);
    expect(one.bonuses).toBe(XP_REWARDS.firstModuleComplete);

    // 2 modules: first module bonus still present (persisted)
    const two = calculateXPBreakdown(['owasp', 'xss'], {}, 0, 0);
    expect(two.bonuses).toBe(XP_REWARDS.firstModuleComplete);

    // 0 modules: no bonus
    const zero = calculateXPBreakdown([], {}, 0, 0);
    expect(zero.bonuses).toBe(0);
  });

  it('awards all modules bonus when all completed', () => {
    const totalModules = 8;
    const allCompleted = Array.from({ length: totalModules }, (_, i) => `module-${i}`);
    const breakdown = calculateXPBreakdown(allCompleted, {}, 0, 0, totalModules);
    expect(breakdown.bonuses).toBe(XP_REWARDS.firstModuleComplete + XP_REWARDS.allModulesComplete);
  });

  it('awards first module bonus but not all modules bonus when partial', () => {
    const totalModules = 8;
    const someCompleted = Array.from({ length: 5 }, (_, i) => `module-${i}`);
    const breakdown = calculateXPBreakdown(someCompleted, {}, 0, 0, totalModules);
    expect(breakdown.bonuses).toBe(XP_REWARDS.firstModuleComplete);
  });

  it('calculates quiz XP correctly with base and bonus', () => {
    const breakdown = calculateXPBreakdown([], { general: 80 }, 0, 0);
    // Base 10 + 80 * 0.2 = 10 + 16 = 26
    expect(breakdown.quizzes).toBe(26);
  });

  it('calculates challenge XP correctly', () => {
    const breakdown = calculateXPBreakdown([], {}, 10, 0);
    expect(breakdown.challenges).toBe(10 * XP_REWARDS.challengeCorrect);
  });

  it('includes study session XP', () => {
    const breakdown = calculateXPBreakdown([], {}, 0, 5);
    expect(breakdown.studySessions).toBe(5);
    expect(breakdown.total).toBe(5);
  });

  it('correctly sums all XP sources', () => {
    const totalModules = 8;
    const allCompleted = Array.from({ length: totalModules }, (_, i) => `module-${i}`);
    const breakdown = calculateXPBreakdown(
      allCompleted,
      { general: 100, auth: 50 },
      5,
      3,
      totalModules
    );

    const moduleXP = 8 * XP_REWARDS.completeModule;
    const bonusesXP = XP_REWARDS.firstModuleComplete + XP_REWARDS.allModulesComplete;
    const quizXP = (10 + 20) + (10 + 10); // general: 100%, auth: 50%
    const challengeXP = 5 * XP_REWARDS.challengeCorrect;
    const studySessionXP = 3;
    const expectedTotal = moduleXP + bonusesXP + quizXP + challengeXP + studySessionXP;

    expect(breakdown.modules).toBe(moduleXP);
    expect(breakdown.bonuses).toBe(bonusesXP);
    expect(breakdown.quizzes).toBe(quizXP);
    expect(breakdown.challenges).toBe(challengeXP);
    expect(breakdown.studySessions).toBe(studySessionXP);
    expect(breakdown.total).toBe(expectedTotal);
  });

  it('uses default totalModules=9 when not specified', () => {
    // 9 modules with default should trigger all-modules bonus + first module bonus
    const nine = Array.from({ length: 9 }, (_, i) => `module-${i}`);
    const breakdown = calculateXPBreakdown(nine, {}, 0, 0);
    expect(breakdown.bonuses).toBe(XP_REWARDS.firstModuleComplete + XP_REWARDS.allModulesComplete);

    // 8 modules should only have first module bonus
    const eight = Array.from({ length: 8 }, (_, i) => `module-${i}`);
    const breakdown8 = calculateXPBreakdown(eight, {}, 0, 0);
    expect(breakdown8.bonuses).toBe(XP_REWARDS.firstModuleComplete);
  });
});

describe('XP_REWARDS constants', () => {
  it('has expected reward values', () => {
    expect(XP_REWARDS.completeModule).toBe(50);
    expect(XP_REWARDS.quizPass).toBe(10);
    expect(XP_REWARDS.challengeCorrect).toBe(5);
    expect(XP_REWARDS.firstModuleComplete).toBe(100);
    expect(XP_REWARDS.allModulesComplete).toBe(500);
    expect(XP_REWARDS.studySessionMax).toBe(10);
  });
});

describe('XP system consistency', () => {
  it('level + xpToNextLevel + levelProgress are consistent', () => {
    const testValues = [0, 50, 100, 150, 300, 600, 1000, 5000];
    for (const xp of testValues) {
      const level = calculateLevel(xp);
      const xpNext = xpToNextLevel(xp);
      const progress = levelProgress(xp);

      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(MAX_LEVEL);
      expect(xpNext).toBeGreaterThanOrEqual(0);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);

      if (level < MAX_LEVEL) {
        expect(xpNext).toBeGreaterThan(0);
      }
    }
  });
});
