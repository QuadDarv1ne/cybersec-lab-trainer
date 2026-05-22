// XP (Experience Points) system configuration and utilities

// Level thresholds: each level requires level * 100 XP to reach from previous level
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP total (100+200), Level 4: 600 XP total (100+200+300), etc.
export const XP_PER_LEVEL = (level: number) => level * 100;

export const MAX_LEVEL = 50;

// XP rewards for various actions
export const XP_REWARDS = {
  completeModule: 50,       // Complete any module
  quizPass: 10,             // Base XP for completing a quiz
  quizBonusPerPercent: 0.2, // Additional XP per percentage point of score (max +20 XP at 100%)
  challengeCorrect: 5,      // Each correct challenge answer
  firstModuleComplete: 100, // Bonus for completing first module ever
  allModulesComplete: 500,  // Bonus for 100% completion
} as const;

// Total possible XP from all actions (approximate)
// 8 modules * 50 = 400
// 8 quizzes * (10 + 20) = 240
// ~50 correct challenges * 5 = 250
// First module bonus = 100
// All modules bonus = 500
// Total ≈ 1490 XP

export interface XPBreakdown {
  modules: number;
  quizzes: number;
  challenges: number;
  bonuses: number;
  total: number;
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  let level = 1;
  let remaining = totalXP;
  while (remaining >= XP_PER_LEVEL(level) && level < MAX_LEVEL) {
    remaining -= XP_PER_LEVEL(level);
    level++;
  }
  return level;
}

// Calculate XP needed for next level (returns 0 if at max level)
export function xpToNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP);
  if (level >= MAX_LEVEL) return 0;
  let accumulated = 0;
  for (let i = 1; i < level; i++) {
    accumulated += XP_PER_LEVEL(i);
  }
  const currentLevelXP = totalXP - accumulated;
  return XP_PER_LEVEL(level) - currentLevelXP;
}

// Calculate progress (0-100) within current level
export function levelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP);
  if (level >= MAX_LEVEL) return 100;
  let accumulated = 0;
  for (let i = 1; i < level; i++) {
    accumulated += XP_PER_LEVEL(i);
  }
  const currentLevelXP = totalXP - accumulated;
  return Math.round((currentLevelXP / XP_PER_LEVEL(level)) * 100);
}

// Calculate XP breakdown by source
export function calculateXPBreakdown(
  completedModules: string[],
  quizScores: Record<string, number>,
  challengeCorrect: number
): XPBreakdown {
  const moduleXP = completedModules.length * XP_REWARDS.completeModule;
  const bonusesXP = completedModules.length > 0 ? XP_REWARDS.firstModuleComplete : 0;
  const allModulesBonusXP = completedModules.length >= 8 ? XP_REWARDS.allModulesComplete : 0;

  let quizXP = 0;
  for (const score of Object.values(quizScores)) {
    quizXP += XP_REWARDS.quizPass + Math.round(score * XP_REWARDS.quizBonusPerPercent);
  }

  const challengeXP = challengeCorrect * XP_REWARDS.challengeCorrect;

  const total = moduleXP + quizXP + challengeXP + bonusesXP + allModulesBonusXP;

  return {
    modules: moduleXP,
    quizzes: quizXP,
    challenges: challengeXP,
    bonuses: bonusesXP + allModulesBonusXP,
    total,
  };
}
