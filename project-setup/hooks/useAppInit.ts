// useAppInit.ts - App initialization hook
'use client';

import { useEffect } from 'react';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useProgressStore } from '@/app/stores/useProgressStore';
import { loadCategories, useCourseName } from './useStorage';

/**
 * Initialize app with stored data and setup progress tracking
 */
export function useAppInit() {
  const courseName = useCourseName();
  const categories = useCategoryStore((state) => state.categories);
  const setCategories = useCategoryStore((state) => state.categories);
  const collectUngradedItems = useProgressStore((state) => state.collectUngradedItems);
  const calculateProjectedGrade = useProgressStore((state) => state.calculateProjectedGrade);
  
  // Load stored categories on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = loadCategories(courseName);
    if (stored && Array.isArray(stored)) {
      // This would need a method to bulk set categories in the store
      // For now, the store initializes with DEFAULT_CATEGORIES
    }
  }, [courseName]);
  
  // Update progress when categories change
  useEffect(() => {
    if (categories.length > 0) {
      collectUngradedItems(categories);
      calculateProjectedGrade(categories);
    }
  }, [categories, collectUngradedItems, calculateProjectedGrade]);
  
  return { courseName };
}

/**
 * Check if user should see setup modal on first visit
 */
export function useFirstVisit(): boolean {
  if (typeof window === 'undefined') return false;
  
  const visited = sessionStorage.getItem('dashboard_visited');
  
  if (!visited) {
    sessionStorage.setItem('dashboard_visited', 'true');
    return true;
  }
  
  return false;
}
