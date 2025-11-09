// useStorage.ts - localStorage/sessionStorage persistence hooks
'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY_PREFIX = 'grade_planner:';

/**
 * Get current course name from sessionStorage
 */
export function useCourseName(): string {
  const [courseName, setCourseName] = useState<string>('Selected Course');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = sessionStorage.getItem('current_course_name') || 'Selected Course';
      setCourseName(name);
    }
  }, []);

  return courseName;
}

/**
 * Set course name in sessionStorage
 */
export function setCourseName(name: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('current_course_name', name);
  }
}

/**
 * Get storage key for current course
 */
export function getCourseStorageKey(courseName?: string): string {
  const name = courseName || (typeof window !== 'undefined' 
    ? sessionStorage.getItem('current_course_name') 
    : null) || 'Selected Course';
  return STORAGE_KEY_PREFIX + name;
}

/**
 * Save categories to localStorage
 */
export function saveCategories(categories: any[], courseName?: string): void {
  try {
    if (typeof window !== 'undefined') {
      const key = getCourseStorageKey(courseName);
      localStorage.setItem(key, JSON.stringify({ categories }));
    }
  } catch (e) {
    console.warn('Failed to save state', e);
  }
}

/**
 * Load categories from localStorage
 */
export function loadCategories(courseName?: string): any[] | null {
  try {
    if (typeof window !== 'undefined') {
      const key = getCourseStorageKey(courseName);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.categories)) {
        return data.categories;
      }
    }
  } catch (e) {
    console.warn('Failed to load state', e);
  }
  return null;
}

/**
 * Hook to auto-save categories on change
 */
export function useAutoSave<T>(data: T, key: string, delay: number = 1000) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to auto-save', e);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, key, delay]);
}

/**
 * Hook to load and save data with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
  }, [key]);

  // Save to localStorage when value changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  return [storedValue, setValue];
}
