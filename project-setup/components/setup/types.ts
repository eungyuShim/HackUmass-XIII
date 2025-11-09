// types.ts에 Setup 관련 타입 추가
export interface SetupCategory {
  id: number;
  name: string;
  weight: number;
  count: number;
}

export const DEFAULT_SETUP_CATEGORIES: SetupCategory[] = [
  { id: 1, name: 'Midterm Exam', weight: 20, count: 1 },
  { id: 2, name: 'Final Exam', weight: 30, count: 1 },
  { id: 3, name: 'Assignments', weight: 25, count: 5 },
  { id: 4, name: 'Quizzes', weight: 25, count: 3 },
];
