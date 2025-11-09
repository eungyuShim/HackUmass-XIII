// types.ts - Dashboard 관련 타입 정의

export interface CategoryItem {
  name: string;
  score: number | null;
  _editingName?: boolean;
  _editingScore?: boolean;
}

export interface Category {
  id: number;
  name: string;
  weight: number;
  items: CategoryItem[];
  _editingName?: boolean;
  _editingWeight?: boolean;
  _open?: boolean;
}

export interface GradeStats {
  minPct: number;
  maxPct: number;
  remainingWeight: number;
}

export interface UngradedItem {
  categoryName: string;
  categoryWeight: number;
  categoryId: number;
  itemName: string;
  itemId: number;
  itemWeight: number;
  totalItemsInCategory: number;
  assumedScore: number;
  deductedPoints: number;
  maxDeduction: number;
  isPinned: boolean;
}

export type TargetGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-';

export const GRADE_MAP: Record<TargetGrade, number> = {
  'A+': 97,
  'A': 93,
  'A-': 90,
  'B+': 87,
  'B': 83,
  'B-': 80,
  'C+': 77,
  'C': 73,
  'C-': 70,
};

export const GRADE_OPTIONS: TargetGrade[] = [
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-'
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Midterm Exam',
    weight: 20,
    items: [{ name: 'Midterm 1', score: 85 }],
  },
  {
    id: 2,
    name: 'Final Exam',
    weight: 30,
    items: [{ name: 'Final', score: null }],
  },
  {
    id: 3,
    name: 'Assignments',
    weight: 25,
    items: [
      { name: 'Assignment 1', score: 90 },
      { name: 'Assignment 2', score: 88 },
      { name: 'Assignment 3', score: null },
      { name: 'Assignment 4', score: null },
    ],
  },
  {
    id: 4,
    name: 'Quizzes',
    weight: 25,
    items: [
      { name: 'Quiz 1', score: 95 },
      { name: 'Quiz 2', score: null },
    ],
  },
];
