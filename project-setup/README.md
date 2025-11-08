# Canvas Grade Calculator - 프로젝트 현황

## 📋 프로젝트 개요

Canvas LMS 연동 성적 역산 웹 서비스입니다. 사용자가 Canvas Personal Access Token을 입력하면, 현재 강의의 syllabus를 AI로 파싱하고 남은 과제/시험에서 목표 학점을 달성하기 위한 최소 점수를 계산해주는 서비스입니다.

## 🎯 핵심 기능

- ✅ Canvas API 연동 (Personal Access Token 사용)
- ✅ PDF Syllabus AI 파싱 (Claude API)
- ✅ 3가지 계산 전략 제공
- ✅ 실시간 성적 동기화 및 대시보드

---

## 🛠 기술 스택

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

## 📁 프로젝트 구조

```
TEST/
├── 📝 설정 파일
│   ├── package.json              (프로젝트 의존성)
│   ├── tsconfig.json             (TypeScript 설정)
│   ├── next.config.js            (Next.js 설정)
│   ├── tailwind.config.ts        (Tailwind CSS 설정)
│   ├── postcss.config.js         (PostCSS 설정)
│   ├── vitest.config.ts          (Vitest 테스트 설정)
│   ├── components.json           (shadcn/ui 설정)
│   ├── .env.local                (환경 변수)
│   └── .gitignore                (Git 무시 파일)
│
├── 📱 App Router (Next.js 14)
│   └── app/
│       ├── layout.tsx                          (루트 레이아웃)
│       ├── page.tsx                            (랜딩 페이지)
│       ├── globals.css                         (전역 스타일)
│       ├── courses/
│       │   ├── page.tsx                        (강의 목록)
│       │   └── [courseId]/
│       │       ├── syllabus/page.tsx           (Syllabus 업로드)
│       │       └── dashboard/page.tsx          (대시보드)
│       └── api/
│           ├── canvas/
│           │   ├── verify-token/route.ts       (토큰 검증)
│           │   ├── courses/route.ts            (강의 목록)
│           │   └── assignments/[courseId]/route.ts (과제 목록)
│           └── ai/
│               └── parse-syllabus/route.ts     (AI Syllabus 파싱)
│
├── 🎨 UI 컴포넌트 (shadcn/ui)
│   └── components/ui/
│       ├── input.tsx                (입력 필드)
│       ├── button.tsx               (버튼)
│       ├── card.tsx                 (카드)
│       ├── table.tsx                (테이블)
│       ├── progress.tsx             (진행 바)
│       └── alert.tsx                (알림)
│
├── 📚 라이브러리 & 유틸리티
│   └── lib/
│       ├── types.ts                 (TypeScript 타입 정의)
│       ├── store.ts                 (Zustand 상태 관리)
│       ├── utils.ts                 (UI 유틸리티)
│       └── utils/
│           ├── helpers.ts           (헬퍼 함수)
│           └── calculations.ts      (3가지 계산 전략)
│
└── 🧪 테스트
    └── __tests__/
        ├── calculations.test.ts     (계산 로직 테스트)
        └── helpers.test.ts          (헬퍼 함수 테스트)
```

---

## ✅ 현재 진행 상황

### 완료된 작업

- [x] Next.js 14 프로젝트 초기 설정
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] shadcn/ui 설정
- [x] 프로젝트 파일 구조 생성
- [x] 패키지 의존성 설치 (518개 패키지)
- [x] 추가 UI 의존성 설치 (@radix-ui 컴포넌트)
- [x] 환경 변수 파일 생성 (.env.local)
- [x] 개발 서버 실행 환경 구축

### 진행 중인 작업

- [ ] **Phase 1**: 토큰 입력 & 강의 선택
  - [ ] 랜딩 페이지 UI
  - [ ] Canvas API 토큰 검증
  - [ ] 강의 목록 표시

### 예정된 작업

- [ ] **Phase 2**: Syllabus AI 파싱 & 설정
- [ ] **Phase 3**: Canvas 성적 동기화
- [ ] **Phase 4**: 계산 엔진 (전략 1, 2, 3)
- [ ] **Phase 5**: 대시보드 UI

---

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 열어 Claude API 키를 입력하세요:

```env
CLAUDE_API_KEY=your_actual_claude_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 브라우저에서 http://localhost:3000 에 접속하세요.

### 3. 테스트 실행

```bash
npm test
```

---

## 📦 설치된 주요 패키지

### 핵심 프레임워크

- `next@14.2.3` - React 프레임워크
- `react@18.2.0` - UI 라이브러리
- `typescript@5.4.5` - 타입 시스템

### UI 컴포넌트

- `@radix-ui/react-*` - Headless UI 컴포넌트
- `tailwindcss@3.4.3` - CSS 프레임워크
- `lucide-react@0.index.html379.0` - 아이콘 라이브러리

### 상태 관리 & 데이터

- `zustand@4.5.2` - 전역 상태 관리
- `swr@2.2.5` - 데이터 페칭 & 캐싱

### AI & PDF

- `pdf-parse@1.1.1` - PDF 텍스트 추출
- `@anthropic-ai/sdk@0.24.0` - Claude API 클라이언트

### 테스팅

- `vitest@1.6.0` - 유닛 테스트 프레임워크
- `@testing-library/react@15.0.7` - React 컴포넌트 테스팅

---

## 🔐 보안 고려사항

- **Canvas Token 관리**: sessionStorage에 저장 (탭 닫으면 자동 삭제)
- **API 프록시**: 모든 Canvas API 요청은 Next.js API Route를 통해 프록시
- **환경 변수**: Claude API 키는 환경 변수로 관리 (.env.local)
- **CORS 방지**: 클라이언트에서 직접 Canvas API 호출 금지

---

## 📝 개발 플로우

### Phase 1: 토큰 입력 & 강의 선택

1. Canvas Personal Access Token 입력
2. 기관 URL 입력 (예: https://umass.instructure.com)
3. 토큰 검증
4. 현재 학기 활성 강의 목록 표시
5. 강의 선택 → Phase 2로 이동

### Phase 2: Syllabus AI 파싱 & 설정

1. PDF 업로드
2. Claude API로 성적 카테고리 추출
3. Canvas API로 실제 assignments 가져오기
4. Syllabus vs Canvas 비교
5. 사용자 수정 테이블
6. localStorage 저장

### Phase 3: Canvas 성적 동기화

1. 카테고리 정규화
2. Assignment → Category 자동 매핑
3. 성적 데이터 파싱 및 저장

### Phase 4: 계산 엔진

1. **전략 1**: 균등 감점 + 희생 전략
2. **전략 2**: 비례 배분
3. **전략 3**: 시험 외 만점 가정
4. Vitest 테스트 케이스 작성

### Phase 5: 대시보드 UI

1. Progress Bar (Current → Max Potential)
2. 전략 선택 드롭다운
3. 카테고리별 테이블
4. 실시간 재계산 로직
5. 알림/경고 시스템

---

## 🧪 테스트 전략

### 계산 로직 테스트 (Vitest)

- 전략 1: 균등 감점 테스트
- 전략 2: 비례 배분 테스트
- 전략 3: 시험 외 만점 테스트
- Edge cases: 남은 항목 0개, 이미 목표 달성, 음수 점수

### API 테스트

- Canvas API 토큰 검증
- 강의 목록 조회
- Assignment 조회
- AI Syllabus 파싱

---

## 📚 참고 문서

- [Canvas API Documentation](https://canvas.instructure.com/doc/api/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

## 🐛 알려진 이슈

현재 알려진 이슈 없음

---

## 📄 라이선스

MIT License

---

## 👥 기여자

- JooYoung (개발자)

---

## 📞 문의

프로젝트 관련 문의사항은 이슈를 생성해주세요.

---

**최종 업데이트**: 2025년 11월 8일
**버전**: 0.1.0 (초기 설정 완료)
