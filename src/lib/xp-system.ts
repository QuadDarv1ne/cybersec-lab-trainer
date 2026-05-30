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
  studySessionPer5Min: 1,   // XP per 5 minutes of study
  studySessionMax: 10,      // Max XP per single study session
} as const;

// Total possible XP from all actions (approximate)
// 9 modules * 50 = 450
// 8 quizzes * (10 + 20) = 240
// ~50 correct challenges * 5 = 250
// First module bonus = 100
// All modules bonus = 500
// Total ≈ 1540 XP

export interface XPBreakdown {
  modules: number;
  quizzes: number;
  challenges: number;
  bonuses: number;
  studySessions: number;
  total: number;
}

// Calculate level from total XP using closed-form triangular number formula.
// Cumulative XP to reach level N from level 1: sum(1..N-1) * 100 = (N-1)*N/2 * 100.
// Solving for N given totalXP: N ≈ floor((sqrt(1 + 8*totalXP/100) - 1) / 2) + 1
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  // Solve (N-1)*N/2 * 100 <= totalXP for N
  const discriminant = 1 + (8 * totalXP) / 100;
  const level = Math.floor((Math.sqrt(discriminant) - 1) / 2) + 1;
  return Math.min(level, MAX_LEVEL);
}

// Calculate XP needed for next level (returns 0 if at max level)
export function xpToNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP);
  if (level >= MAX_LEVEL) return 0;
  // Cumulative XP spent reaching current level: (level-1)*level/2 * 100
  const cumulativeXP = ((level - 1) * level / 2) * 100;
  const currentLevelXP = totalXP - cumulativeXP;
  return XP_PER_LEVEL(level) - currentLevelXP;
}

// Calculate progress (0-100) within current level
export function levelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP);
  if (level >= MAX_LEVEL) return 100;
  const cumulativeXP = ((level - 1) * level / 2) * 100;
  const currentLevelXP = totalXP - cumulativeXP;
  return Math.round((currentLevelXP / XP_PER_LEVEL(level)) * 100);
}

// Calculate XP breakdown by source
export function calculateXPBreakdown(
  completedModules: string[],
  quizScores: Record<string, number>,
  challengeCorrect: number,
  studySessionXP = 0,
  totalModules = 9
): XPBreakdown {
  const moduleXP = completedModules.length * XP_REWARDS.completeModule;
  // First module bonus: awarded once the first module is completed (persists in breakdown)
  const bonusesXP = completedModules.length >= 1 ? XP_REWARDS.firstModuleComplete : 0;
  const allModulesBonusXP = completedModules.length >= totalModules ? XP_REWARDS.allModulesComplete : 0;

  let quizXP = 0;
  for (const score of Object.values(quizScores)) {
    quizXP += XP_REWARDS.quizPass + Math.round(score * XP_REWARDS.quizBonusPerPercent);
  }

  const challengeXP = challengeCorrect * XP_REWARDS.challengeCorrect;

  const total = moduleXP + quizXP + challengeXP + bonusesXP + allModulesBonusXP + studySessionXP;

  return {
    modules: moduleXP,
    quizzes: quizXP,
    challenges: challengeXP,
    bonuses: bonusesXP + allModulesBonusXP,
    studySessions: studySessionXP,
    total,
  };
}
