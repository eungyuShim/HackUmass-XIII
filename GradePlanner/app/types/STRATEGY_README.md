# Grade Distribution Strategy System

## 개요
슬라이더 초기값 설정 로직을 전략 패턴(Strategy Pattern)으로 분리하여 관리합니다. 사용자는 UI에서 버튼을 클릭하여 원하는 전략을 선택할 수 있습니다.

## 파일 구조

```
app/types/strategy.ts          # 전략 정의 및 구현
app/stores/useProgressStore.ts # 전략 선택 상태 관리
components/dashboard/GradeStrategy.tsx # 전략 선택 UI
```

## 사용 가능한 전략

### 1. Proportional Distribution (기본값)
- **ID**: `'proportional'`
- **설명**: 각 항목의 가중치에 비례하여 점수 감점을 분배
- **동작**: 
  - 가중치가 높은 항목일수록 더 많은 감점 할당
  - 목표 등급 달성을 위해 가장 효율적인 분배
  
### 2. Equal Distribution
- **ID**: `'equal'`
- **설명**: 모든 항목에 동일한 감점을 분배
- **동작**:
  - 각 항목에 동일한 양의 감점 시도
  - 항목의 최대 감점 한도를 초과하면 다른 항목에 재분배

### 3. Custom Strategy
- **ID**: `'custom'`
- **설명**: 사용자 정의 전략 (확장 가능)
- **동작**: 현재는 Proportional과 동일하게 동작하며, 나중에 커스텀 로직 추가 가능

## 새로운 전략 추가 방법

`app/types/strategy.ts` 파일에서 새로운 전략을 추가할 수 있습니다:

```typescript
// 1. 새로운 전략 타입 추가
export type StrategyType = 'proportional' | 'equal' | 'custom' | 'your-strategy';

// 2. 전략 객체 생성
export const yourStrategy: Strategy = {
  id: 'your-strategy',
  name: 'Your Strategy Name',
  description: 'Your strategy description',
  calculate: (ungradedItems, totalDeductiblePoints) => {
    // 여기에 로직 구현
    
    // ungradedItems: 채점되지 않은 항목들의 배열
    // totalDeductiblePoints: 목표 등급 달성을 위해 감점 가능한 총 점수
    
    // 반환값: 각 항목의 assumedScore가 계산된 배열
    return ungradedItems.map((item) => ({
      ...item,
      maxDeduction: item.itemWeight,
      deductedPoints: /* 계산된 감점 */,
      assumedScore: /* 계산된 점수 (0-100) */,
    }));
  },
};

// 3. AVAILABLE_STRATEGIES 배열에 추가
export const AVAILABLE_STRATEGIES: Strategy[] = [
  proportionalStrategy,
  equalStrategy,
  customStrategy,
  yourStrategy, // 새로운 전략 추가
];
```

## Strategy 인터페이스

```typescript
interface Strategy {
  id: StrategyType;              // 고유 식별자
  name: string;                   // UI에 표시될 이름
  description: string;            // 툴팁에 표시될 설명
  calculate: (                    // 계산 함수
    ungradedItems: UngradedItem[], 
    totalDeductiblePoints: number
  ) => UngradedItem[];
}
```

## 입력 파라미터

### ungradedItems
각 항목은 다음 속성을 가집니다:
```typescript
{
  categoryName: string;          // 카테고리 이름
  categoryWeight: number;        // 카테고리 가중치
  categoryId: string;            // 카테고리 ID
  itemName: string;              // 항목 이름
  itemId: string;                // 항목 ID
  itemWeight: number;            // 항목 가중치 (전체 성적에서 차지하는 비율)
  assumedScore: number;          // 가정된 점수 (0-100)
  deductedPoints: number;        // 감점된 점수
  maxDeduction: number;          // 최대 감점 가능 점수
  isPinned: boolean;             // 고정 여부
}
```

### totalDeductiblePoints
- 목표 등급을 달성하기 위해 총 감점 가능한 점수
- 예: Max Possible Grade = 95%, Target Grade = 90% → totalDeductiblePoints = 5

## 계산 로직 예시

### Proportional Strategy
```typescript
const itemsWithDeductions = ungradedItems.map((item) => {
  // 전체에서 차지하는 비율 계산
  const share = item.itemWeight / totalMaxDeduction;
  
  // 비율에 따른 감점 계산
  const targetDeduction = totalDeductiblePoints * share;
  const deductedPoints = Math.min(targetDeduction, item.maxDeduction);
  
  // 점수로 변환 (0-100 스케일)
  const scoreReduction = (deductedPoints * 100) / item.itemWeight;
  const assumedScore = 100 - scoreReduction;
  
  return { ...item, deductedPoints, assumedScore };
});
```

### Equal Strategy
```typescript
// 동일하게 분배
const equalDeduction = totalDeductiblePoints / ungradedItems.length;

const itemsWithDeductions = ungradedItems.map((item) => {
  const deductedPoints = Math.min(equalDeduction, item.maxDeduction);
  const scoreReduction = (deductedPoints * 100) / item.itemWeight;
  const assumedScore = 100 - scoreReduction;
  
  return { ...item, deductedPoints, assumedScore };
});
```

## UI 사용법

사용자는 Strategy Card 상단의 버튼을 클릭하여 전략을 변경할 수 있습니다:

```
Distribution Strategy:
[Proportional Distribution] [Equal Distribution] [Custom Strategy]
```

- 활성화된 전략은 UMass 마룬 색상으로 강조 표시
- 각 버튼에 마우스를 올리면 전략 설명 표시
- 전략 변경 시 모든 슬라이더가 새로운 전략에 따라 재계산

## 주의사항

1. **Pin된 슬라이더**: 사용자가 pin한 슬라이더는 전략 변경 시에도 값이 유지됩니다.
2. **수동 조정**: 전략 적용 후 사용자가 수동으로 슬라이더를 조정하면, 다른 슬라이더들이 자동으로 재분배됩니다.
3. **검증**: `assumedScore`는 항상 0-100 범위 내여야 하며, 모든 `deductedPoints`의 합은 `totalDeductiblePoints`를 초과하지 않아야 합니다.

## 테스트 예시

```typescript
// 예시 데이터
const ungradedItems = [
  { itemWeight: 20, itemName: 'Final Exam' },
  { itemWeight: 10, itemName: 'Quiz 1' },
  { itemWeight: 10, itemName: 'Quiz 2' },
];
const totalDeductiblePoints = 10;

// Proportional: Final Exam에 더 많은 감점 할당
// Final: -6.67, Quiz 1: -1.67, Quiz 2: -1.67

// Equal: 모든 항목에 동일한 감점
// Final: -3.33, Quiz 1: -3.33, Quiz 2: -3.33
```
