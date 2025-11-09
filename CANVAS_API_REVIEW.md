# Canvas API Integration Review

## ✅ Canvas API 사용 현황 체크리스트

### 1. **환경 설정**
- ✅ `.env.local` - Canvas URL 및 토큰 설정됨
- ✅ Canvas API Base URL: `https://umamherst.instructure.com/api/v1`
- ✅ Access Token: 저장 및 사용 중

### 2. **API 클라이언트 (`lib/canvas/`)**
- ✅ `client.ts` - CanvasApiClient 클래스 구현
  - ✅ Bearer token 인증
  - ✅ 에러 처리
  - ✅ 메서드: getCourses(), getAssignments(), getAssignmentGroups(), verifyToken()
- ✅ `types.ts` - Canvas API 타입 정의 (Course, Assignment, AssignmentGroup 등)
- ✅ `mapper.ts` - Canvas 데이터 → 앱 데이터 변환

### 3. **API Routes (Next.js API)**

#### `/api/canvas/verify` ✅
- **Method**: POST
- **기능**: Canvas 토큰 검증 및 사용자 정보 가져오기
- **Canvas API**: `GET /users/self/profile`
- **사용 여부**: ✅ 로그인 페이지에서 사용 중

#### `/api/canvas/courses` ✅  
- **Method**: GET
- **기능**: 활성 코스 목록 가져오기
- **Canvas API**: `GET /courses?enrollment_state=active`
- **사용 여부**: ✅ 코스 페이지에서 사용 중
- **응답 데이터**:
  - Course ID (실제 Canvas ID)
  - Course name
  - Course code
  - Term ID
  - Enrollment info

#### `/api/canvas/assignments/[courseId]` ✅
- **Method**: GET  
- **기능**: 특정 코스의 과제 그룹 및 과제 가져오기
- **Canvas API**: `GET /courses/:id/assignment_groups?include[]=assignments&include[]=submission`
- **사용 여부**: ✅ Dashboard에서 사용 중
- **응답 데이터**:
  - Assignment groups (카테고리)
  - Assignments (과제, 퀴즈, 시험)
  - Scores (점수)
  - Submission status
  - Due dates

#### `/api/canvas/assignment-groups/[courseId]` ✅
- **Method**: GET
- **기능**: Assignment groups만 가져오기
- **Canvas API**: `GET /courses/:id/assignment_groups`  
- **사용 여부**: ⚠️ 현재 미사용 (위의 assignments API로 통합됨)

### 4. **프론트엔드 페이지**

#### 로그인 페이지 (`app/page.tsx`) ✅
- ✅ Canvas 토큰 입력 UI
- ✅ POST `/api/canvas/verify`로 토큰 검증
- ✅ sessionStorage에 저장:
  - `canvas_token`
  - `canvas_base_url`
  - `canvas_user` (사용자 정보)
- ✅ 성공 시 `/courses`로 이동
- ✅ 에러 처리 및 로딩 상태

#### 코스 목록 페이지 (`app/courses/page.tsx`) ✅
- ✅ GET `/api/canvas/courses`로 실제 코스 가져오기
- ✅ 표시 정보:
  - ✅ Course name (Canvas에서)
  - ✅ Course code (Canvas에서)
  - ✅ Course ID (실제 Canvas ID 표시 추가됨)
  - ✅ Term (Canvas에서)
  - ✅ 자동 생성 색상
- ✅ 코스 선택 시 sessionStorage에 저장:
  - `current_course_id`
  - `current_course_name`
- ✅ `/dashboard`로 이동

#### 대시보드 페이지 (`app/dashboard/page.tsx`) ✅
- ✅ GET `/api/canvas/assignments/[courseId]`로 과제 데이터 가져오기
- ✅ Canvas Assignment Groups → 카테고리 변환
- ✅ 표시 정보:
  - ✅ Category name (Assignment Group name)
  - ✅ Weight (group_weight)
  - ✅ Assignments list
  - ✅ Score (submission.score)
  - ✅ Max score (points_possible)
  - ✅ Graded status
  - ✅ Late/Missing flags
  - ✅ Due dates
- ✅ 디버그 로그 추가 (콘솔에서 확인 가능)

### 5. **Canvas 데이터 플로우**

```
Canvas LMS
    ↓
Canvas REST API
    ↓
/api/canvas/* (Next.js API Routes)
    ↓
CanvasApiClient (lib/canvas/client.ts)
    ↓
Canvas Data Mappers (lib/canvas/mapper.ts)
    ↓
Frontend Components
    ↓
Zustand Store (useCategoryStore.ts)
    ↓
UI Display
```

### 6. **실제 Canvas 데이터 사용 확인**

#### ✅ Assignment Types 지원:
- Assignments
- Quizzes  
- Exams
- Discussions
- 기타 모든 Canvas assignment types

#### ✅ 가져오는 데이터:
- Course info (id, name, code, term)
- Assignment groups (categories with weights)
- Individual assignments (name, points, due dates)
- Submission data (score, status, late/missing flags)
- User profile (id, name, email)

### 7. **문제점 및 개선사항**

#### ⚠️ 현재 문제:
1. **Dashboard 데이터 파싱** - ID 생성 방식 개선됨 (incremental ID 사용)
2. **Console logs** - 디버깅용 로그 추가됨
3. **Course ID 표시** - 카드에 실제 Canvas Course ID 표시 추가

#### ✅ 해결됨:
1. 토큰 검증 - POST /api/canvas/verify 구현
2. 실제 코스 데이터 - GET /api/canvas/courses 사용
3. 과제 데이터 - GET /api/canvas/assignments/[courseId] 사용
4. 데이터 매핑 - Canvas → App format 변환 작동

### 8. **테스트 방법**

1. **브라우저 Console 열기** (F12 → Console)
2. http://localhost:3001 접속
3. Canvas 토큰 입력 및 제출
4. 코스 선택
5. **Console에서 다음 로그 확인**:
   - "Canvas API Response:" - 실제 API 응답
   - "Processing category:" - 각 카테고리 처리
   - "Processing assignment:" - 각 과제 처리
   - "Formatted categories:" - 최종 변환된 데이터

### 9. **Canvas API 엔드포인트 사용 현황**

| Canvas API | 사용 여부 | 용도 |
|-----------|---------|------|
| GET /users/self/profile | ✅ | 토큰 검증, 사용자 정보 |
| GET /courses | ✅ | 활성 코스 목록 |
| GET /courses/:id/assignment_groups | ✅ | 과제 그룹 + 과제 |
| GET /courses/:id/assignments | ⚠️ | 미사용 (assignment_groups로 통합) |

### 10. **결론**

✅ **Canvas API는 정상적으로 통합되어 있습니다!**

- 모든 주요 데이터는 실제 Canvas API에서 가져옴
- Course ID는 실제 Canvas ID 사용
- Assignment 데이터는 Canvas submission 포함
- 토큰 인증 작동
- 에러 처리 구현됨

**다음 확인사항:**
1. 브라우저 Console에서 디버그 로그 확인
2. 실제 과제 점수가 제대로 표시되는지 확인
3. Weight(가중치)가 Canvas assignment group의 값과 일치하는지 확인
