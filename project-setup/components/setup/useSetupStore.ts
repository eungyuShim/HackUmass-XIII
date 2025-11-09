// useSetupStore.ts - Setup Modal 상태 관리
'use client';

import { create } from 'zustand';
import { SetupCategory, DEFAULT_SETUP_CATEGORIES } from './types';

interface SetupStore {
  setupCategories: SetupCategory[];
  nextSetupCategoryId: number;
  
  // Actions
  addSetupCategory: () => void;
  deleteSetupCategory: (id: number) => void;
  updateSetupCategoryName: (id: number, name: string) => void;
  updateSetupCategoryWeight: (id: number, weight: number) => void;
  updateSetupCategoryCount: (id: number, count: number) => void;
  getTotalWeight: () => number;
  reset: () => void;
  setSetupCategories: (categories: SetupCategory[]) => void;
}

export const useSetupStore = create<SetupStore>()((set, get) => ({
  setupCategories: [...DEFAULT_SETUP_CATEGORIES],
  nextSetupCategoryId: 5,
  
  addSetupCategory: () => {
    const { setupCategories, nextSetupCategoryId } = get();
    set({
      setupCategories: [
        ...setupCategories,
        {
          id: nextSetupCategoryId,
          name: 'New Category',
          weight: 0,
          count: 1,
        },
      ],
      nextSetupCategoryId: nextSetupCategoryId + 1,
    });
  },
  
  deleteSetupCategory: (id: number) => {
    set((state) => ({
      setupCategories: state.setupCategories.filter((cat) => cat.id !== id),
    }));
  },
  
  updateSetupCategoryName: (id: number, name: string) => {
    set((state) => ({
      setupCategories: state.setupCategories.map((cat) =>
        cat.id === id ? { ...cat, name } : cat
      ),
    }));
  },
  
  updateSetupCategoryWeight: (id: number, weight: number) => {
    set((state) => ({
      setupCategories: state.setupCategories.map((cat) =>
        cat.id === id ? { ...cat, weight } : cat
      ),
    }));
  },
  
  updateSetupCategoryCount: (id: number, count: number) => {
    set((state) => ({
      setupCategories: state.setupCategories.map((cat) =>
        cat.id === id ? { ...cat, count } : cat
      ),
    }));
  },
  
  getTotalWeight: () => {
    const { setupCategories } = get();
    return setupCategories.reduce((sum, cat) => sum + cat.weight, 0);
  },
  
  reset: () => {
    set({
      setupCategories: [...DEFAULT_SETUP_CATEGORIES],
      nextSetupCategoryId: 5,
    });
  },
  
  setSetupCategories: (categories: SetupCategory[]) => {
    set({ setupCategories: categories });
  },
}));
