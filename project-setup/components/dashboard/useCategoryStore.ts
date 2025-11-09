// useCategoryStore.ts - Category 상태 관리
'use client';

import { create } from 'zustand';
import { Category, CategoryItem, DEFAULT_CATEGORIES } from './types';

interface CategoryStore {
  categories: Category[];
  nextCategoryId: number;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  addCategory: () => void;
  deleteCategory: (id: number) => void;
  updateCategoryName: (id: number, name: string) => void;
  updateCategoryWeight: (id: number, weight: number) => void;
  toggleCategoryItems: (id: number) => void;
  
  // Category editing states
  setEditingName: (id: number, editing: boolean) => void;
  setEditingWeight: (id: number, editing: boolean) => void;
  
  // Item actions
  addItem: (categoryId: number) => void;
  deleteItem: (categoryId: number, itemIndex: number) => void;
  updateItemName: (categoryId: number, itemIndex: number, name: string) => void;
  updateItemScore: (categoryId: number, itemIndex: number, score: number | null) => void;
  
  // Item editing states
  setEditingItemName: (categoryId: number, itemIndex: number, editing: boolean) => void;
  setEditingItemScore: (categoryId: number, itemIndex: number, editing: boolean) => void;
  
  // Utility
  calcProgressStats: () => { minPct: number; maxPct: number; remainingWeight: number };
  bumpId: () => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  nextCategoryId: 5,
  
  setCategories: (categories: Category[]) => set({ categories }),
  
  addCategory: () => {
    const { categories, nextCategoryId } = get();
    const newCategory: Category = {
      id: nextCategoryId,
      name: 'New Category',
      weight: 0,
      items: [{ name: 'Item 1', score: null }],
      _open: false,
    };
    set({
      categories: [...categories, newCategory],
      nextCategoryId: nextCategoryId + 1,
    });
  },
  
  deleteCategory: (id: number) => {
    const { categories } = get();
    set({ categories: categories.filter((cat) => cat.id !== id) });
  },
  
  updateCategoryName: (id: number, name: string) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) =>
        cat.id === id ? { ...cat, name, _editingName: false } : cat
      ),
    });
  },
  
  updateCategoryWeight: (id: number, weight: number) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) =>
        cat.id === id ? { ...cat, weight, _editingWeight: false } : cat
      ),
    });
  },
  
  toggleCategoryItems: (id: number) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) =>
        cat.id === id ? { ...cat, _open: !cat._open } : cat
      ),
    });
  },
  
  setEditingName: (id: number, editing: boolean) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) =>
        cat.id === id ? { ...cat, _editingName: editing } : cat
      ),
    });
  },
  
  setEditingWeight: (id: number, editing: boolean) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) =>
        cat.id === id ? { ...cat, _editingWeight: editing } : cat
      ),
    });
  },
  
  addItem: (categoryId: number) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          const newItem: CategoryItem = {
            name: `Item ${cat.items.length + 1}`,
            score: null,
          };
          return { ...cat, items: [...cat.items, newItem] };
        }
        return cat;
      }),
    });
  },
  
  deleteItem: (categoryId: number, itemIndex: number) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.filter((_, idx) => idx !== itemIndex),
          };
        }
        return cat;
      }),
    });
  },
  
  updateItemName: (categoryId: number, itemIndex: number, name: string) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item, idx) =>
              idx === itemIndex ? { ...item, name, _editingName: false } : item
            ),
          };
        }
        return cat;
      }),
    });
  },
  
  updateItemScore: (categoryId: number, itemIndex: number, score: number | null) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item, idx) =>
              idx === itemIndex ? { ...item, score, _editingScore: false } : item
            ),
          };
        }
        return cat;
      }),
    });
  },
  
  setEditingItemName: (categoryId: number, itemIndex: number, editing: boolean) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item, idx) =>
              idx === itemIndex ? { ...item, _editingName: editing } : item
            ),
          };
        }
        return cat;
      }),
    });
  },
  
  setEditingItemScore: (categoryId: number, itemIndex: number, editing: boolean) => {
    const { categories } = get();
    set({
      categories: categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item, idx) =>
              idx === itemIndex ? { ...item, _editingScore: editing } : item
            ),
          };
        }
        return cat;
      }),
    });
  },
  
  calcProgressStats: () => {
    const { categories } = get();
    let minPct = 0;
    let totalWeight = 0;
    
    categories.forEach((cat) => {
      totalWeight += cat.weight;
      const graded = cat.items.filter((item) => item.score !== null);
      if (graded.length > 0) {
        const avg = graded.reduce((sum, item) => sum + (item.score || 0), 0) / graded.length;
        minPct += (cat.weight / 100) * avg;
      }
    });
    
    const remainingWeight = (100 - totalWeight) / 100;
    const maxPct = Math.max(minPct, Math.min(100, minPct + remainingWeight * 100));
    
    return { minPct, maxPct, remainingWeight };
  },
  
  bumpId: () => {
    set((state) => ({ nextCategoryId: state.nextCategoryId + 1 }));
  },
  
  reset: () => {
    set({ categories: DEFAULT_CATEGORIES, nextCategoryId: 5 });
  },
}));
