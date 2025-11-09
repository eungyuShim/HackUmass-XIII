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
 * Category interface for grade calculations
 */
export interface Category {
  id: number;
  name: string;
  weight: number;
  items: CategoryItem[];
}

export interface CategoryItem {
  name: string;
  score: number | null;
  isAttendance?: boolean;
}

/**
 * Calculate current grade from categories (only graded items)
 * Ungraded items are excluded from the calculation
 */
export function calculateCurrentGradeFromCategories(
  categories: Category[]
): number {
  let totalWeightedScore = 0;
  let totalWeightGraded = 0;

  categories.forEach((category) => {
    // Skip categories with 0 weight
    if (category.weight === 0) return;

    const gradedItems = category.items.filter(
      (item) => item.score !== null && item.score !== undefined
    );

    if (gradedItems.length === 0) return; // Skip categories with no graded items

    // Calculate category average from graded items only
    const categorySum = gradedItems.reduce((sum, item) => sum + item.score!, 0);
    const categoryMax = gradedItems.length * 100;
    const categoryPercentage = (categorySum / categoryMax) * 100;

    totalWeightedScore += (categoryPercentage * category.weight) / 100;
    totalWeightGraded += category.weight;
  });

  if (totalWeightGraded === 0) return 0;

  // Return weighted average of graded items
  return (totalWeightedScore / totalWeightGraded) * 100;
}

/**
 * Calculate maximum possible grade (ungraded items = 100)
 * This shows the best possible outcome if student gets 100% on all remaining items
 */
export function calculateMaxPossibleGradeFromCategories(
  categories: Category[]
): number {
  let totalWeightedScore = 0;

  console.log(
    "🔍 calculateMaxPossibleGrade - Input categories:",
    categories.length
  );

  categories.forEach((category) => {
    // Skip categories with 0 weight (not counted in final grade)
    if (category.weight === 0) {
      console.log(`⏭️  Skipping category "${category.name}" - Weight is 0%`);
      return;
    }

    // If category has no items, assume 100% for that category
    if (category.items.length === 0) {
      const categoryPercentage = 100; // Assume 100% if no items
      totalWeightedScore += (categoryPercentage * category.weight) / 100;

      console.log(`📊 Category: ${category.name}`);
      console.log(`   - Weight: ${category.weight}%`);
      console.log(`   - Items: 0 (Assuming 100% - No items to grade)`);
      console.log(`   - Category Sum: N/A`);
      console.log(
        `   - Weighted Score: ${(
          (categoryPercentage * category.weight) /
          100
        ).toFixed(2)}`
      );
      return;
    }

    let categorySum = 0;
    const categoryMax = category.items.length * 100;
    let ungradedCount = 0;
    let gradedCount = 0;
    let zeroScoreCount = 0;

    console.log(`\n📊 Category: ${category.name} - Detailed Items:`);

    category.items.forEach((item) => {
      if (item.score !== null && item.score !== undefined) {
        categorySum += item.score; // Add actual score
        gradedCount++;
        if (item.score === 0) {
          zeroScoreCount++;
          console.log(`   ⚠️  "${item.name}": 0 (graded as 0)`);
        } else {
          console.log(`   ✅ "${item.name}": ${item.score}`);
        }
      } else {
        categorySum += 100; // Assume 100 for ungraded items ✅
        ungradedCount++;
        console.log(`   🔵 "${item.name}": null/undefined → assuming 100`);
      }
    });

    const categoryPercentage = (categorySum / categoryMax) * 100;
    totalWeightedScore += (categoryPercentage * category.weight) / 100;

    console.log(`   - Weight: ${category.weight}%`);
    console.log(
      `   - Items: ${category.items.length} (Graded: ${gradedCount}, Ungraded: ${ungradedCount}, Zero Scores: ${zeroScoreCount})`
    );
    console.log(
      `   - Category Sum: ${categorySum}/${categoryMax} = ${categoryPercentage.toFixed(
        2
      )}%`
    );
    console.log(
      `   - Weighted Score: ${(
        (categoryPercentage * category.weight) /
        100
      ).toFixed(2)}`
    );
  });

  console.log(
    `\n✅ Total Max Possible Grade: ${totalWeightedScore.toFixed(2)}%\n`
  );

  return totalWeightedScore;
}

/**
 * Calculate minimum possible grade (ungraded items = 0)
 * This shows the worst possible outcome if student gets 0% on all remaining items
 */
export function calculateMinPossibleGradeFromCategories(
  categories: Category[]
): number {
  let totalWeightedScore = 0;

  categories.forEach((category) => {
    // Skip categories with 0 weight
    if (category.weight === 0) return;

    // If category has no items, assume 0% for that category
    if (category.items.length === 0) {
      const categoryPercentage = 0; // Assume 0% if no items
      totalWeightedScore += (categoryPercentage * category.weight) / 100;
      return;
    }

    let categorySum = 0;
    const categoryMax = category.items.length * 100;

    category.items.forEach((item) => {
      if (item.score !== null && item.score !== undefined) {
        categorySum += item.score; // Add actual score
      } else {
        categorySum += 0; // Assume 0 for ungraded items
      }
    });

    const categoryPercentage = (categorySum / categoryMax) * 100;
    totalWeightedScore += (categoryPercentage * category.weight) / 100;
  });

  return totalWeightedScore;
}

/**
 * Legacy interface for backward compatibility
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
 * Check if target is achievable with remaining items
 */
export interface UngradedItemInfo {
  itemWeight: number;
  isAttendance?: boolean;
}

export function isTargetAchievable(
  currentScore: number,
  targetScore: number,
  ungradedItems: UngradedItemInfo[]
): { achievable: boolean; maxPossible: number; deductionAllowed: number } {
  const totalRemainingWeight = ungradedItems.reduce(
    (sum, item) => sum + item.itemWeight,
    0
  );
  const maxPossible = currentScore + totalRemainingWeight;
  const deductionAllowed = maxPossible - targetScore;

  return {
    achievable: maxPossible >= targetScore,
    maxPossible,
    deductionAllowed: Math.max(0, deductionAllowed),
  };
}

/**
 * Attendance rounding and surplus redistribution
 * Attendance는 출석(100) 또는 결석(0)만 가능하므로 올림 처리
 */
export interface AttendanceRoundingResult {
  attendanceItems: Array<{
    itemName: string;
    itemWeight: number;
    requiredScore: number; // 0 or 1
    originalNeeded: number;
  }>;
  surplus: number; // 올림으로 생긴 여유
}

export function handleAttendanceRounding(
  attendanceItems: Array<{
    itemName: string;
    itemWeight: number;
    neededPct: number;
  }>,
  regularItems: Array<{
    itemName: string;
    itemWeight: number;
    neededPct: number;
  }>
): AttendanceRoundingResult {
  // Attendance 총 필요량 계산
  const totalAttendanceNeeded = attendanceItems.reduce(
    (sum, item) => sum + item.neededPct,
    0
  );

  // 개수 기준 올림 (예: 8.3% 필요 → 9번 출석)
  const attendanceCountNeeded = Math.ceil(totalAttendanceNeeded);

  // 실제 획득 - 필요량 = 여유
  const surplus = attendanceCountNeeded - totalAttendanceNeeded;

  // 필요도 순으로 정렬 (높은 것부터)
  const sortedAttendance = [...attendanceItems].sort(
    (a, b) => b.neededPct - a.neededPct
  );

  // 상위 N개는 출석(1), 나머지는 결석(0)
  const result = sortedAttendance.map((item, index) => ({
    itemName: item.itemName,
    itemWeight: item.itemWeight,
    requiredScore: index < attendanceCountNeeded ? 1 : 0,
    originalNeeded: item.neededPct,
  }));

  return {
    attendanceItems: result,
    surplus: Math.max(0, surplus),
  };
}

/**
 * Redistribute surplus from attendance rounding to regular items
 */
export interface RedistributeResult {
  itemName: string;
  itemWeight: number;
  originalNeeded: number;
  additionalDeduction: number;
  finalNeeded: number;
}

export function redistributeSurplus(
  regularItems: Array<{
    itemName: string;
    itemWeight: number;
    neededPct: number;
  }>,
  surplus: number,
  strategy: "equal" | "proportional"
): RedistributeResult[] {
  if (surplus <= 0.0001 || regularItems.length === 0) {
    return regularItems.map((item) => ({
      itemName: item.itemName,
      itemWeight: item.itemWeight,
      originalNeeded: item.neededPct,
      additionalDeduction: 0,
      finalNeeded: item.neededPct,
    }));
  }

  const validItems = regularItems.filter((item) => item.neededPct > 0);

  if (validItems.length === 0) {
    return regularItems.map((item) => ({
      itemName: item.itemName,
      itemWeight: item.itemWeight,
      originalNeeded: item.neededPct,
      additionalDeduction: 0,
      finalNeeded: item.neededPct,
    }));
  }

  if (strategy === "equal") {
    // 균등 추가 감점
    let remaining = surplus;
    const updatedItems = [...validItems];
    const sacrificed: Set<number> = new Set();

    let iteration = 0;
    while (remaining > 0.0001 && updatedItems.length > sacrificed.size) {
      const activeItems = updatedItems.filter((_, idx) => !sacrificed.has(idx));
      if (activeItems.length === 0) break;

      const equalDeduction = remaining / activeItems.length;
      let carryOver = 0;

      activeItems.forEach((item, idx) => {
        const actualIdx = updatedItems.findIndex((i) => i === item);
        const newNeeded = item.neededPct - equalDeduction;

        if (newNeeded < 0) {
          carryOver += Math.abs(newNeeded);
          updatedItems[actualIdx] = { ...item, neededPct: 0 };
          sacrificed.add(actualIdx);
        } else {
          updatedItems[actualIdx] = { ...item, neededPct: newNeeded };
        }
      });

      remaining = carryOver;
      iteration++;
      if (iteration > 100) break; // Safety limit
    }

    return updatedItems.map((item) => ({
      itemName: item.itemName,
      itemWeight: item.itemWeight,
      originalNeeded: regularItems.find((r) => r.itemName === item.itemName)!
        .neededPct,
      additionalDeduction:
        regularItems.find((r) => r.itemName === item.itemName)!.neededPct -
        item.neededPct,
      finalNeeded: item.neededPct,
    }));
  } else {
    // 비례 추가 감점
    const totalNeeded = validItems.reduce(
      (sum, item) => sum + item.neededPct,
      0
    );

    return regularItems.map((item) => {
      if (item.neededPct <= 0) {
        return {
          itemName: item.itemName,
          itemWeight: item.itemWeight,
          originalNeeded: item.neededPct,
          additionalDeduction: 0,
          finalNeeded: item.neededPct,
        };
      }

      const proportion = item.neededPct / totalNeeded;
      const additionalDeduction = surplus * proportion;
      const finalNeeded = Math.max(0, item.neededPct - additionalDeduction);

      return {
        itemName: item.itemName,
        itemWeight: item.itemWeight,
        originalNeeded: item.neededPct,
        additionalDeduction,
        finalNeeded,
      };
    });
  }
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
