/**
 * Level Progression Utility
 * Calculates XP requirements and level progress percentages
 *
 * Formula: 2x leveling system (levels 1-15)
 * - Level 1 → 2: 4 XP
 * - Level 2 → 3: 6 XP (4 + 2)
 * - Level 3 → 4: 8 XP (6 + 2)
 * - Pattern: Each level requires 2 more XP than the previous
 */

/**
 * Get XP required to reach a specific level (cumulative from level 1)
 * @param targetLevel - The level to calculate XP for (1-15)
 * @returns Total XP needed to reach this level from level 1
 */
export function getXPForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  if (targetLevel > 15) return getXPForLevel(15); // Cap at level 15

  // Formula: sum of arithmetic sequence
  // Level n requires: 4 + 6 + 8 + ... + (2n + 2)
  // This is: n * (first + last) / 2 where first = 4, last = 2n + 2
  // Simplifies to: n * (2n + 6) / 2 = n * (n + 3)
  const n = targetLevel - 1;
  return n * (n + 3);
}

/**
 * Calculate level progress percentage within current level
 * @param totalXP - User's total accumulated XP
 * @param currentLevel - User's current level
 * @returns Percentage progress (0-100) toward next level
 *
 * @example
 * // User has 10 XP and is level 3
 * // Level 3 starts at 10 XP, level 4 starts at 18 XP
 * // So they're at the START of level 3 (0% progress)
 * getLevelProgress(10, 3) // => 0
 *
 * @example
 * // User has 14 XP and is level 3
 * // Level 3: 10-17 XP (8 XP range)
 * // Progress: (14 - 10) / 8 = 4/8 = 50%
 * getLevelProgress(14, 3) // => 50
 */
export function getLevelProgress(totalXP: number, currentLevel: number): number {
  // XP threshold for current level (where this level starts)
  const currentLevelStartXP = getXPForLevel(currentLevel);

  // XP threshold for next level (where next level starts)
  const nextLevelStartXP = getXPForLevel(currentLevel + 1);

  // XP range for current level
  const xpRangeForLevel = nextLevelStartXP - currentLevelStartXP;

  if (xpRangeForLevel === 0) {
    return 0; // Avoid division by zero (shouldn't happen with 2x formula)
  }

  // Calculate progress within current level
  const xpIntoLevel = totalXP - currentLevelStartXP;
  const progressPercent = (xpIntoLevel / xpRangeForLevel) * 100;

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(progressPercent)));
}

/**
 * Get XP needed for next level (from current XP)
 * @param totalXP - User's total accumulated XP
 * @param currentLevel - User's current level
 * @returns XP remaining to next level
 */
export function getXPToNextLevel(totalXP: number, currentLevel: number): number {
  const nextLevelStartXP = getXPForLevel(currentLevel + 1);
  return Math.max(0, nextLevelStartXP - totalXP);
}
