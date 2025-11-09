// types.ts에 Setup 관련 타입 추가
export interface SetupCategory {
  id: number;
  name: string;
  weight: number;
  count: number;
}

export const DEFAULT_SETUP_CATEGORIES: SetupCategory[] = [];
