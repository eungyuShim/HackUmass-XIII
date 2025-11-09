// strategy.ts - Grade Strategy Types
export type StrategyType = 'proportional' | 'equal' | 'custom';

export interface Strategy {
  id: StrategyType;
  name: string;
  description: string;
  calculate: (ungradedItems: any[], totalDeductiblePoints: number) => any[];
}

// Proportional Strategy - 현재 구현된 전략 (가중치에 비례하여 분배)
export const proportionalStrategy: Strategy = {
  id: 'proportional',
  name: 'Proportional Distribution',
  description: 'Distribute deductions proportionally based on item weights',
  calculate: (ungradedItems, totalDeductiblePoints) => {
    if (totalDeductiblePoints <= 0) {
      return ungradedItems.map((item) => ({
        ...item,
        maxDeduction: 0,
        deductedPoints: 0,
        assumedScore: 100,
      }));
    }

    // Set max deduction for each item
    const updatedItems = ungradedItems.map((item) => ({
      ...item,
      maxDeduction: item.itemWeight,
    }));

    const totalMaxDeduction = updatedItems.reduce((sum, item) => sum + item.maxDeduction, 0);

    if (totalMaxDeduction <= 0) {
      return updatedItems;
    }

    // Distribute deductions proportionally
    const itemsWithDeductions = updatedItems.map((item) => {
      const share = item.itemWeight / totalMaxDeduction;
      const targetDeduction = totalDeductiblePoints * share;
      const deductedPoints = Math.min(targetDeduction, item.maxDeduction);
      const scoreReduction = (deductedPoints * 100) / item.itemWeight;
      const assumedScore = parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1));

      return {
        ...item,
        deductedPoints,
        assumedScore,
      };
    });

    // Scale if needed
    const actualTotal = itemsWithDeductions.reduce((sum, item) => sum + item.deductedPoints, 0);

    if (actualTotal > totalDeductiblePoints + 0.01) {
      const scale = totalDeductiblePoints / actualTotal;
      return itemsWithDeductions.map((item) => {
        const scaledDeduction = item.deductedPoints * scale;
        const scoreReduction = (scaledDeduction * 100) / item.itemWeight;
        const assumedScore = parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1));

        return {
          ...item,
          deductedPoints: scaledDeduction,
          assumedScore,
        };
      });
    }

    return itemsWithDeductions;
  },
};

// Equal Strategy - 모든 항목에 동일한 점수 할당
export const equalStrategy: Strategy = {
  id: 'equal',
  name: 'Equal Distribution',
  description: 'Distribute deductions equally across all items',
  calculate: (ungradedItems, totalDeductiblePoints) => {
    if (totalDeductiblePoints <= 0 || ungradedItems.length === 0) {
      return ungradedItems.map((item) => ({
        ...item,
        maxDeduction: 0,
        deductedPoints: 0,
        assumedScore: 100,
      }));
    }

    // Set max deduction for each item
    const updatedItems = ungradedItems.map((item) => ({
      ...item,
      maxDeduction: item.itemWeight,
    }));

    // Try to distribute equally
    const equalDeduction = totalDeductiblePoints / ungradedItems.length;

    const itemsWithDeductions = updatedItems.map((item) => {
      const deductedPoints = Math.min(equalDeduction, item.maxDeduction);
      const scoreReduction = (deductedPoints * 100) / item.itemWeight;
      const assumedScore = parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1));

      return {
        ...item,
        deductedPoints,
        assumedScore,
      };
    });

    // Check if we need to redistribute remaining deductions
    const actualTotal = itemsWithDeductions.reduce((sum, item) => sum + item.deductedPoints, 0);
    const remaining = totalDeductiblePoints - actualTotal;

    if (remaining > 0.01) {
      // Distribute remaining among items that can take more
      const canTakeMore = itemsWithDeductions.filter(
        (item) => item.deductedPoints < item.maxDeduction
      );

      if (canTakeMore.length > 0) {
        const extraPerItem = remaining / canTakeMore.length;

        return itemsWithDeductions.map((item) => {
          if (item.deductedPoints < item.maxDeduction) {
            const additionalDeduction = Math.min(extraPerItem, item.maxDeduction - item.deductedPoints);
            const totalDeduction = item.deductedPoints + additionalDeduction;
            const scoreReduction = (totalDeduction * 100) / item.itemWeight;
            const assumedScore = parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1));

            return {
              ...item,
              deductedPoints: totalDeduction,
              assumedScore,
            };
          }
          return item;
        });
      }
    }

    return itemsWithDeductions;
  },
};

// Custom Strategy - 사용자 정의 전략 (나중에 추가 가능)
export const customStrategy: Strategy = {
  id: 'custom',
  name: 'Custom Strategy',
  description: 'Define your own distribution logic',
  calculate: (ungradedItems, totalDeductiblePoints) => {
    // 기본적으로 proportional과 동일하게 동작
    return proportionalStrategy.calculate(ungradedItems, totalDeductiblePoints);
  },
};

// 사용 가능한 모든 전략
export const AVAILABLE_STRATEGIES: Strategy[] = [
  proportionalStrategy,
  equalStrategy,
  customStrategy,
];

// 전략 찾기 헬퍼 함수
export const getStrategy = (type: StrategyType): Strategy => {
  return AVAILABLE_STRATEGIES.find((s) => s.id === type) || proportionalStrategy;
};
