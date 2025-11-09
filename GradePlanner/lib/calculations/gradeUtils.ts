// lib/calculations/gradeUtils.ts - Grade calculation utilities

/**
 * Grade to percentage mapping
 */
export const GRADE_THRESHOLDS = {
  A: 93,
  "A-": 90,
  "B+": 87,
  B: 83,
  "B-": 80,
  "C+": 77,
  C: 73,
  "C-": 70,
  "D+": 67,
  D: 63,
  "D-": 60,
  F: 0,
} as const;

export type LetterGrade = keyof typeof GRADE_THRESHOLDS;

/**
 * Convert letter grade to minimum percentage required
 */
export function gradeToPercentage(grade: LetterGrade): number {
  return GRADE_THRESHOLDS[grade];
}

/**
 * Convert percentage to letter grade
 */
export function percentageToGrade(score: number): LetterGrade {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

/**
 * Calculate weighted average from graded items
 */
export interface GradedItem {
  score: number; // 0-100
  weight: number; // 0-100
}

export function calculateWeightedAverage(items: GradedItem[]): number {
  if (items.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  items.forEach((item) => {
    totalWeightedScore += (item.score * item.weight) / 100;
    totalWeight += item.weight;
  });

  if (totalWeight === 0) return 0;

  return (totalWeightedScore / totalWeight) * 100;
}

/**
 * Calculate current grade from categories
 */
export interface CategoryScore {
  weight: number; // percentage (0-100)
  earnedPoints: number;
  totalPoints: number;
}

export function calculateCurrentGrade(categories: CategoryScore[]): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  categories.forEach((category) => {
    if (category.totalPoints > 0) {
      const categoryScore =
        (category.earnedPoints / category.totalPoints) * 100;
      totalWeightedScore += (categoryScore * category.weight) / 100;
      totalWeight += category.weight;
    }
  });

  if (totalWeight === 0) return 0;

  // Normalize to 100% scale
  return (totalWeightedScore / totalWeight) * 100;
}

/**
 * Calculate maximum possible grade
 */
export function calculateMaxPossibleGrade(categories: CategoryScore[]): number {
  let totalWeightedScore = 0;

  categories.forEach((category) => {
    if (category.totalPoints > 0) {
      // Assume 100% on all ungraded items in this category
      const categoryScore =
        (category.earnedPoints / category.totalPoints) * 100;
      totalWeightedScore += categoryScore * (category.weight / 100);
    } else {
      // If no points yet, assume 100% for this category
      totalWeightedScore += category.weight;
    }
  });

  return totalWeightedScore;
}

/**
 * Check if target grade is achievable
 */
export function isGradeAchievable(
  targetGrade: LetterGrade,
  maxPossibleGrade: number
): boolean {
  const requiredPercentage = gradeToPercentage(targetGrade);
  return maxPossibleGrade >= requiredPercentage;
}

/**
 * Calculate points needed to achieve target grade
 */
export function calculatePointsNeeded(
  currentGrade: number,
  targetGrade: number,
  remainingWeight: number
): number {
  if (remainingWeight === 0) {
    return currentGrade >= targetGrade ? 0 : Infinity;
  }

  // Formula: (target - current) / (remaining / 100)
  const pointsNeeded = ((targetGrade - currentGrade) / remainingWeight) * 100;

  return Math.max(0, Math.min(100, pointsNeeded));
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number, decimals: number = 1): string {
  return grade.toFixed(decimals) + "%";
}

/**
 * Get grade color based on score
 */
export function getGradeColor(score: number): string {
  if (score >= 90) return "#16a34a"; // green
  if (score >= 80) return "#84cc16"; // lime
  if (score >= 70) return "#f59e0b"; // amber
  if (score >= 60) return "#f97316"; // orange
  return "#dc2626"; // red
}
