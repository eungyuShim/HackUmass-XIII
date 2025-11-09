// useProgressStore.ts - Progress 및 Grade Strategy 상태 관리
'use client';

import { create } from 'zustand';
import { UngradedItem, TargetGrade, GRADE_MAP } from './types';

interface ProgressStore {
  currentTargetGrade: TargetGrade;
  ungradedItems: UngradedItem[];
  totalDeductiblePoints: number;
  projectedGrade: number;
  
  // Actions
  setTargetGrade: (grade: TargetGrade) => void;
  collectUngradedItems: (categories: any[]) => void;
  calculateTotalDeductiblePoints: (categories: any[]) => void;
  updateSlider: (index: number, score: number) => void;
  redistributeDeductions: (excludeIdx: number, needToFree: number) => boolean;
  togglePin: (index: number) => void;
  calculateProjectedGrade: (categories: any[]) => number;
}

export const useProgressStore = create<ProgressStore>()((set, get) => ({
  currentTargetGrade: 'A',
  ungradedItems: [],
  totalDeductiblePoints: 0,
  projectedGrade: 0,
  
  setTargetGrade: (grade: TargetGrade) => {
    set({ currentTargetGrade: grade });
  },
  
  collectUngradedItems: (categories: any[]) => {
    const ungradedItems: UngradedItem[] = [];
    
    categories.forEach((cat) => {
      const items = cat.items;
      const totalItemsInCategory = items.length;
      if (totalItemsInCategory === 0) return;
      
      const itemWeight = cat.weight / totalItemsInCategory;
      
      items.forEach((item: any) => {
        if (item.score === null || item.score === undefined || item.score === '') {
          ungradedItems.push({
            categoryName: cat.name,
            categoryWeight: cat.weight,
            categoryId: cat.id,
            itemName: item.name,
            itemId: item.id,
            itemWeight,
            totalItemsInCategory,
            assumedScore: 100,
            deductedPoints: 0,
            maxDeduction: 0,
            isPinned: false,
          });
        }
      });
    });
    
    set({ ungradedItems });
    get().calculateTotalDeductiblePoints(categories);
  },
  
  calculateTotalDeductiblePoints: (categories: any[]) => {
    const { currentTargetGrade, ungradedItems } = get();
    const targetGrade = GRADE_MAP[currentTargetGrade];
    
    // Calculate stats
    let minPct = 0;
    let totalWeight = 0;
    
    categories.forEach((cat) => {
      totalWeight += cat.weight;
      const graded = cat.items.filter((item: any) => item.score !== null);
      if (graded.length > 0) {
        const avg = graded.reduce((sum: number, item: any) => sum + (item.score || 0), 0) / graded.length;
        minPct += (cat.weight / 100) * avg;
      }
    });
    
    const remainingWeight = (100 - totalWeight) / 100;
    const maxPossible = minPct + remainingWeight * 100;
    const totalDeductiblePoints = maxPossible - targetGrade;
    
    if (totalDeductiblePoints <= 0) {
      set({
        totalDeductiblePoints: 0,
        ungradedItems: ungradedItems.map((item) => ({
          ...item,
          maxDeduction: 0,
          deductedPoints: 0,
          assumedScore: 100,
        })),
      });
      return;
    }
    
    // Set max deduction for each item
    const updatedItems = ungradedItems.map((item) => ({
      ...item,
      maxDeduction: item.itemWeight,
    }));
    
    const totalMaxDeduction = updatedItems.reduce((sum, item) => sum + item.maxDeduction, 0);
    
    if (totalMaxDeduction <= 0) {
      set({ totalDeductiblePoints, ungradedItems: updatedItems });
      return;
    }
    
    // Distribute deductions
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
      const scaledItems = itemsWithDeductions.map((item) => {
        const scaledDeduction = item.deductedPoints * scale;
        const scoreReduction = (scaledDeduction * 100) / item.itemWeight;
        const assumedScore = parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1));
        
        return {
          ...item,
          deductedPoints: scaledDeduction,
          assumedScore,
        };
      });
      
      set({ totalDeductiblePoints, ungradedItems: scaledItems });
    } else {
      set({ totalDeductiblePoints, ungradedItems: itemsWithDeductions });
    }
  },
  
  updateSlider: (index: number, newScore: number) => {
    const { ungradedItems, totalDeductiblePoints } = get();
    const item = ungradedItems[index];
    if (!item || item.isPinned) return;
    
    newScore = Math.max(0, Math.min(100, newScore));
    const newDeduction = (item.itemWeight / 100) * (100 - newScore);
    
    if (newDeduction > item.maxDeduction + 0.01) {
      const updatedItems = [...ungradedItems];
      updatedItems[index] = {
        ...item,
        deductedPoints: item.maxDeduction,
        assumedScore: 0,
      };
      set({ ungradedItems: updatedItems });
      return;
    }
    
    const otherDeductions = ungradedItems.reduce(
      (sum, itm, idx) => (idx === index ? sum : sum + itm.deductedPoints),
      0
    );
    
    const newTotal = newDeduction + otherDeductions;
    
    if (newTotal > totalDeductiblePoints + 0.01) {
      const needToFree = newTotal - totalDeductiblePoints;
      const redistributed = get().redistributeDeductions(index, needToFree);
      
      if (!redistributed) {
        const maxAllowed = Math.max(0, Math.min(totalDeductiblePoints - otherDeductions, item.maxDeduction));
        const maxScore = 100 - (maxAllowed * 100 / item.itemWeight);
        
        const updatedItems = [...ungradedItems];
        updatedItems[index] = {
          ...item,
          deductedPoints: maxAllowed,
          assumedScore: parseFloat(Math.max(0, Math.min(100, maxScore)).toFixed(1)),
        };
        set({ ungradedItems: updatedItems });
        return;
      }
    }
    
    const updatedItems = [...ungradedItems];
    updatedItems[index] = {
      ...item,
      deductedPoints: newDeduction,
      assumedScore: parseFloat(newScore.toFixed(1)),
    };
    set({ ungradedItems: updatedItems });
  },
  
  redistributeDeductions: (excludeIdx: number, needToFree: number): boolean => {
    const { ungradedItems } = get();
    const adjustableItems = ungradedItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item, idx }) => idx !== excludeIdx && !item.isPinned && item.deductedPoints > 0);
    
    if (adjustableItems.length === 0) return false;
    
    adjustableItems.sort((a, b) => b.item.deductedPoints - a.item.deductedPoints);
    
    let remaining = needToFree;
    const updatedItems = [...ungradedItems];
    
    // Phase 1: Proportional reduction
    const totalAdjustableMax = adjustableItems.reduce((sum, { item }) => sum + item.maxDeduction, 0);
    
    if (totalAdjustableMax > 0) {
      for (const { item, idx } of adjustableItems) {
        if (remaining <= 0.01) break;
        
        const share = item.maxDeduction / totalAdjustableMax;
        const targetReduction = needToFree * share;
        const canReduce = item.deductedPoints;
        const actualReduction = Math.min(canReduce, targetReduction, remaining);
        
        updatedItems[idx] = {
          ...item,
          deductedPoints: item.deductedPoints - actualReduction,
        };
        remaining -= actualReduction;
      }
    }
    
    // Phase 2: Additional reduction
    if (remaining > 0.01) {
      for (const { item, idx } of adjustableItems) {
        if (remaining <= 0.01) break;
        
        const canReduce = updatedItems[idx].deductedPoints;
        if (canReduce <= 0) continue;
        
        const reduction = Math.min(canReduce, remaining);
        updatedItems[idx] = {
          ...updatedItems[idx],
          deductedPoints: updatedItems[idx].deductedPoints - reduction,
        };
        remaining -= reduction;
      }
    }
    
    // Update scores
    for (const { idx } of adjustableItems) {
      const item = updatedItems[idx];
      const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
      updatedItems[idx] = {
        ...item,
        assumedScore: parseFloat(Math.max(0, Math.min(100, 100 - scoreReduction)).toFixed(1)),
      };
    }
    
    set({ ungradedItems: updatedItems });
    return remaining <= 0.01;
  },
  
  togglePin: (index: number) => {
    const { ungradedItems } = get();
    const updatedItems = [...ungradedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      isPinned: !updatedItems[index].isPinned,
    };
    set({ ungradedItems: updatedItems });
  },
  
  calculateProjectedGrade: (categories: any[]): number => {
    const { ungradedItems } = get();
    let total = 0;
    
    categories.forEach((cat) => {
      const items = cat.items;
      const totalItemsInCategory = items.length;
      if (totalItemsInCategory === 0) return;
      
      const itemWeight = cat.weight / totalItemsInCategory;
      
      items.forEach((item: any) => {
        let itemScore = 0;
        
        if (item.score !== null && item.score !== undefined && item.score !== '') {
          itemScore = item.score;
        } else {
          const ungradedItem = ungradedItems.find(
            (ui) => ui.categoryId === cat.id && ui.itemName === item.name
          );
          itemScore = ungradedItem ? ungradedItem.assumedScore : 100;
        }
        
        total += (itemWeight / 100) * itemScore;
      });
    });
    
    const projected = parseFloat(total.toFixed(2));
    set({ projectedGrade: projected });
    return projected;
  },
}));
