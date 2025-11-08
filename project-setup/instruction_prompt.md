```markdown
# Canvas 성적 역산 서비스 개발 프롬프트

## 프로젝트 개요

Canvas LMS 연동 성적 역산 웹 서비스를 개발합니다. 사용자가 Canvas Personal Access Token을 입력하면, 현재 강의의 syllabus를 AI로 파싱하고 남은 과제/시험에서 목표 학점을 달성하기 위한 최소 점수를 계산해주는 서비스입니다.

**핵심 기능:**

- Canvas API 연동 (Personal Access Token 사용)
- PDF Syllabus AI 파싱 (Claude API)
- 3가지 계산 전략 제공
- 실시간 성적 동기화 및 대시보드

---

## 기술 스택
```

📦 Core Framework
├─ Next.js 14 (App Router)
├─ TypeScript
└─ Tailwind CSS

🎨 UI Components
├─ shadcn/ui (테이블, 드롭다운, progress bar, 폼)
└─ lucide-react (아이콘)

📊 State Management
├─ Zustand (전역 상태)
└─ sessionStorage (Canvas Token)

🔌 API
├─ Next.js API Routes (Canvas API 프록시)
├─ Claude API (Sonnet 3.5 - PDF 파싱)
└─ SWR (Canvas API 캐싱)

📄 PDF Processing
└─ pdf-parse (서버사이드)

🧪 Testing
└─ Vitest (계산 로직 검증)

💾 Storage
└─ localStorage (syllabus 설정, 계산 결과)

🚀 Deploy
└─ Vercel

```

---

## 개발 플로우

### Phase 1: 토큰 입력 & 강의 선택

**구현 항목:**
1. 랜딩 페이지
   - Canvas Personal Access Token 입력 필드
   - Canvas 기관 URL 입력 필드 (예: `https://umass.instructure.com`)
   - 토큰 검증 버튼

2. API Routes
   - `POST /api/canvas/verify-token` - 토큰 유효성 검증
   - `GET /api/canvas/courses` - 현재 학기 활성 강의 목록

3. 강의 선택 페이지
   - 강의 목록 카드 형식 표시
   - 강의 선택 → Phase 2로 이동

**데이터 플로우:**
```

사용자 입력 → sessionStorage 저장 → API Route 프록시 → Canvas API

````

**주의사항:**
- Token을 localStorage가 아닌 **sessionStorage**에 저장 (보안)
- API Route에서 Canvas API 호출 시 Token을 헤더에 추가
- CORS 이슈 방지를 위해 모든 Canvas API 요청은 프록시 통과

---

### Phase 2: Syllabus AI 파싱 & 설정

**구현 항목:**
1. PDF 업로드 UI
2. API Routes
   - `POST /api/ai/parse-syllabus` - PDF 텍스트 추출 + Claude API 파싱
   - `GET /api/canvas/assignments/:courseId` - Canvas assignment 목록

3. AI 파싱 결과 표시 및 수정 UI
4. Syllabus vs Canvas 비교 로직
5. 차이 확인 UI (추가 항목 선택)
6. localStorage 저장

**AI 파싱 JSON 형식:**
```json
{
  "categories": [
    {
      "name": "Exams",
      "weight": 30,
      "count": 3
    },
    {
      "name": "Assignments",
      "weight": 40,
      "count": 10
    },
    {
      "name": "Quizzes",
      "weight": 20,
      "count": 12
    },
    {
      "name": "Attendance",
      "weight": 10,
      "count": 15
    }
  ]
}
````

**파싱 프롬프트 예시:**

```
다음 syllabus PDF에서 아래 정보를 추출하여 JSON 형식으로 반환하세요:

1. 성적 카테고리 (Exams, Assignments, Quizzes, Attendance 등)
2. 각 카테고리의 가중치 (%)
3. 각 카테고리에 포함된 항목 개수

반드시 위의 JSON 형식을 따라야 하며, 추출할 수 없는 정보는 null로 표시하세요.
```

**플로우:**

```
1. PDF 업로드
   ↓
2. pdf-parse로 텍스트 추출
   ↓
3. Claude API로 정보 추출
   ↓
4. Canvas API로 실제 assignments 가져오기
   ↓
5. Syllabus count vs Canvas count 비교
   예: Syllabus Quiz 12개 vs Canvas Quiz 15개
   ↓
6. 차이 확인 UI 표시
   "⚠️ Canvas에 Quiz 3개가 추가로 있습니다:
    - Quiz 13: Chapter 10
    - Quiz 14: Chapter 11
    - Quiz 15: Final Review
   [추가하기] [무시하기]"
   ↓
7. 사용자 수정 테이블
   - 카테고리명, 가중치, 개수 직접 수정 가능
   - 가중치 합 = 100% 검증
   ↓
8. 확인 후 localStorage 저장
```

**검증 로직:**

- 가중치 합계 = 100% (아니면 경고 표시)
- Canvas에 없는 카테고리 경고

---

### Phase 3: Canvas 성적 동기화

**구현 항목:**

1. 카테고리 정규화 함수
2. Assignment → Category 자동 매핑
3. 성적 데이터 파싱 및 저장

**카테고리 정규화 규칙:**

```typescript
const normalizeCategory = (name: string): string => {
  const normalized = name.toLowerCase().trim();

  if (/exam/i.test(normalized)) return "Exams";
  if (/assignment|hw|homework/i.test(normalized)) return "Assignments";
  if (/quiz/i.test(normalized)) return "Quizzes";
  if (/attendance|participation/i.test(normalized)) return "Attendance";

  return name; // 매칭 안 되면 원본 반환
};
```

**데이터 구조:**

```typescript
interface Assignment {
  id: string;
  name: string;
  category: string; // 정규화된 카테고리명
  weight: number; // 전체 성적에서 차지하는 비중 (%)
  earnedScore: number | null; // 획득 점수 (미채점 시 null)
  maxScore: number; // 만점
  status: "completed" | "pending";
}
```

**매핑 로직:**

- Canvas assignment의 `assignment_group` → 카테고리 매핑
- 이미 채점된 항목: `earnedScore` 저장
- 미채점 항목: `earnedScore = null`

---

### Phase 4: 계산 엔진 (전략 1, 2, 3)

**구현 항목:**

1. 3가지 계산 전략 함수
2. Vitest 테스트 케이스
3. 전략 전환 로직

**입력 데이터 구조:**

```typescript
interface CalculationInput {
  currentScore: number; // 현재 획득 점수
  targetGrade: number; // 목표 학점 (93 = A)
  totalWeight: number; // 전체 배점 합 (100)
  categories: Category[]; // Syllabus 설정
  assignments: Assignment[]; // Canvas 성적
}

interface Category {
  name: string;
  weight: number;
  count: number;
}
```

**출력 데이터 구조:**

```typescript
interface CalculationResult {
  achievable: boolean; // 목표 달성 가능 여부
  remainingDeductible: number; // 남은 감점 여유 (%)
  currentProgress: number; // 현재 진행률 (%)
  maxPotential: number; // 현재 최대 도달 가능 점수
  recommendations: RecommendationItem[];
}

interface RecommendationItem {
  assignmentId: string;
  name: string;
  category: string;
  weight: number; // 배점
  currentScore: number | null; // 현재 점수 (완료된 경우)
  minRequired: number; // 최소 필요 점수
  status: "completed" | "pending" | "sacrifice";
}
```

**전략 1: 균등 감점 + 희생 전략**

```typescript
function calculateStrategy1(input: CalculationInput): CalculationResult {
  // 1. 현재 점수 계산
  const currentScore = calculateCurrentScore(input.assignments);

  // 2. 감점 가능 점수 계산
  const remainingWeight = calculateRemainingWeight(input.assignments);
  const deductible = remainingWeight - (input.targetGrade - currentScore);

  // 3. 남은 항목 개수
  const pendingAssignments = input.assignments.filter(
    (a) => a.status === "pending"
  );

  // 4. 균등 감점 계산
  let evenDeduction = deductible / pendingAssignments.length;

  // 5. 희생 항목 처리 (반복)
  let recommendations = [];
  let sacrificed = [];

  while (true) {
    let hasNegative = false;

    for (const assignment of pendingAssignments) {
      if (sacrificed.includes(assignment.id)) continue;

      const minScore = assignment.weight - evenDeduction;

      if (minScore < 0) {
        sacrificed.push(assignment.id);
        evenDeduction =
          (deductible - sum(sacrificed.map((id) => getWeight(id)))) /
          (pendingAssignments.length - sacrificed.length);
        hasNegative = true;
        break;
      }
    }

    if (!hasNegative) break;
  }

  // 6. 최종 권장 점수 계산
  // ...

  return result;
}
```

**전략 2: 비례 배분**

```typescript
function calculateStrategy2(input: CalculationInput): CalculationResult {
  // 1. 현재 점수 계산
  const currentScore = calculateCurrentScore(input.assignments);

  // 2. 남은 총 배점
  const remainingWeight = calculateRemainingWeight(input.assignments);

  // 3. 감점 가능 점수
  const deductible = remainingWeight - (input.targetGrade - currentScore);

  // 4. 달성 비율 계산
  const achievementRatio = (remainingWeight - deductible) / remainingWeight;

  // 5. 각 항목 최소 점수 = 배점 × 달성 비율
  const recommendations = input.assignments
    .filter((a) => a.status === "pending")
    .map((a) => ({
      ...a,
      minRequired: a.weight * achievementRatio,
    }));

  return result;
}
```

**전략 3: 시험 외 만점 가정**

```typescript
function calculateStrategy3(input: CalculationInput): CalculationResult {
  // 1. HW/Quiz는 모두 만점 가정
  const nonExamAssignments = input.assignments.filter(
    (a) => a.status === "pending" && a.category !== "Exams"
  );
  const nonExamTotal = sum(nonExamAssignments.map((a) => a.weight));

  // 2. 현재 점수 + HW/Quiz 만점
  const scoreWithNonExam =
    calculateCurrentScore(input.assignments) + nonExamTotal;

  // 3. 남은 시험에서 필요한 점수
  const examAssignments = input.assignments.filter(
    (a) => a.status === "pending" && a.category === "Exams"
  );
  const requiredFromExams = input.targetGrade - scoreWithNonExam;

  // 4. 시험 배점으로 나누어 분배
  // ...

  return result;
}
```

**Vitest 테스트 케이스:**

```typescript
describe('Strategy 1: 균등 감점', () => {
  test('exam3(10%) + quiz10(1%), 감점 7%', () => {
    const input = {
      currentScore: 76,
      targetGrade: 93,
      totalWeight: 100,
      categories: [...],
      assignments: [
        { id: '1', name: 'exam1', weight: 10, earnedScore: 8, status: 'completed' },
        { id: '2', name: 'exam2', weight: 10, earnedScore: 9, status: 'completed' },
        // ... 완료된 항목들 (합 76%)
        { id: '3', name: 'exam3', weight: 10, earnedScore: null, status: 'pending' },
        { id: '4', name: 'quiz10', weight: 1, earnedScore: null, status: 'pending' }
      ]
    };

    const result = calculateStrategy1(input);

    expect(result.achievable).toBe(true);
    expect(result.remainingDeductible).toBeCloseTo(0);

    const exam3 = result.recommendations.find(r => r.name === 'exam3');
    const quiz10 = result.recommendations.find(r => r.name === 'quiz10');

    expect(exam3.minRequired).toBeCloseTo(4);
    expect(quiz10.minRequired).toBe(0);
    expect(quiz10.status).toBe('sacrifice');
  });
});
```

---

### Phase 5: 대시보드 UI

**구현 항목:**

1. Progress Bar (Current Max Potential)
2. 헤더 정보 컴포넌트
3. 전략 선택 드롭다운
4. 카테고리별 테이블
5. 실시간 재계산 로직
6. 알림/경고 시스템

**컴포넌트 구조:**

```
Dashboard
├─ Header
│  ├─ StrategySelector (드롭다운)
│  ├─ ScoreInfo (현재/목표/진행률)
│  └─ RemainingDeductible (여유 점수)
├─ ProgressBar
│  └─ MaxPotentialIndicator
├─ CategoryTables (카테고리별)
│  └─ AssignmentRow[]
└─ AlertSystem
   └─ Alert[]
```

**Progress Bar 계산:**

```typescript
function calculateMaxPotential(assignments: Assignment[]): number {
  const completed = assignments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.earnedScore, 0);

  const pending = assignments
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + a.weight, 0); // 만점 가정

  return completed + pending;
}
```

**알림 시스템:**

```typescript
interface Alert {
  type: "success" | "warning" | "error";
  message: string;
}

// 예시
const alerts: Alert[] = [
  {
    type: "success",
    message: "✅ 모든 전략으로 목표 달성 가능합니다",
  },
  {
    type: "warning",
    message: "⚠️ 전략 3으로는 목표 달성이 불가능합니다",
  },
  {
    type: "error",
    message: "❌ 여유 점수 1% 미만 - 주의가 필요합니다",
  },
];
```

---

## 핵심 함수 구조

```typescript
// Phase 1: 인증 및 강의
async function verifyToken(token: string, baseUrl: string): Promise<boolean>;
async function getCourses(token: string, baseUrl: string): Promise<Course[]>;

// Phase 2: Syllabus 파싱
async function uploadPDF(file: File): Promise<string>;
async function parseSyllabusWithClaude(pdfText: string): Promise<SyllabusData>;
async function getCanvasAssignments(courseId: string): Promise<Assignment[]>;
function compareSyllabusCanvas(
  syllabus: SyllabusData,
  canvas: Assignment[]
): Comparison;

// Phase 3: 동기화
function normalizeCategory(categoryName: string): string;
function mapAssignmentsToCategories(
  assignments: Assignment[],
  categories: Category[]
): Assignment[];
function syncGrades(): void;

// Phase 4: 계산
function calculateStrategy1(input: CalculationInput): CalculationResult;
function calculateStrategy2(input: CalculationInput): CalculationResult;
function calculateStrategy3(input: CalculationInput): CalculationResult;
function calculateMaxPotential(assignments: Assignment[]): number;

// Phase 5: UI 업데이트
function recalculate(strategyType: 1 | 2 | 3): void;
function updateDashboard(): void;
```

---

## Canvas API 참고

**Base URL:**

```
https://{institution}.instructure.com/api/v1
```

**주요 엔드포인트:**

1. **사용자 정보 (토큰 검증용):**

```
GET /api/v1/users/self
Headers: Authorization: Bearer {token}
```

2. **강의 목록:**

```
GET /api/v1/courses?enrollment_state=active&per_page=100
Headers: Authorization: Bearer {token}
```

3. **Assignment 목록:**

```
GET /api/v1/courses/{course_id}/assignments?include[]=submission&per_page=100
Headers: Authorization: Bearer {token}
```

**Response 예시:**

```json
{
  "id": 123456,
  "name": "Quiz 1",
  "points_possible": 10,
  "assignment_group_id": 789,
  "submission": {
    "score": 8.5,
    "grade": "85%",
    "workflow_state": "graded"
  }
}
```

---

## 주의사항

### 1. 보안

- **절대 localStorage에 토큰 평문 저장 금지**
- sessionStorage 사용 (탭 닫으면 자동 삭제)
- 모든 Canvas API 요청은 Next.js API Route 프록시 통과

### 2. Canvas API

- Rate Limit: 초당 10 요청
- `per_page=100` 파라미터로 pagination 최소화
- 에러 핸들링 필수 (401, 403, 404, 429)

### 3. AI 파싱

- Claude API token 환경변수로 관리
- 파싱 실패 시 사용자 수정 UI로 fallback
- Syllabus 형식 다양성 고려

### 4. 계산 로직

- 부동소수점 오차 처리 (`toFixed(2)` 사용)
- Edge case 처리:
  - 남은 항목 0개
  - 이미 목표 달성
  - 배점 합 ≠ 100%
  - 음수 점수

### 5. 사용자 경험

- 로딩 상태 표시 (Canvas API 응답 느릴 수 있음)
- 에러 메시지 명확하게
- 각 단계별 진행 상태 표시

---

## 환경 변수

```env
# .env.local
CLAUDE_API_KEY=your_claude_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 개발 시작

1. Next.js 프로젝트 생성
2. shadcn/ui 설치 및 설정
3. Phase 1부터 순차적으로 개발
4. 각 Phase 완료 후 테스트
5. Phase 4에서 Vitest 테스트 작성 필수

**중요:** 각 Phase가 완전히 완성되기 전에 다음 Phase로 넘어가지 말 것. 특히 Phase 2의 AI 파싱과 비교 로직이 핵심이므로 충분한 테스트 필요.

---

## 질문 사항

개발 중 다음 사항이 불명확하면 사용자에게 확인:

1. Canvas 기관별 URL 구조 차이
2. AI 파싱 실패 시 처리 방법
3. 카테고리 매핑 실패 시 처리 방법
4. UI/UX 디자인 세부사항

```

```
