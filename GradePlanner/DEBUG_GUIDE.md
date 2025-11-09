# 🔍 Canvas API Quiz/Lab 0점 문제 디버깅 가이드

## 📋 문제 상황

Canvas API가 Quiz 4개에 대해 `earned: 0`을 반환하는데, 이것이:

- **실제로 0점을 받은 것**인지
- **아직 안 본 시험**인지 구분이 안 되는 상황

## 🛠️ 추가된 디버깅 로직

### 1. Canvas API 원본 응답 로깅

**위치**: `app/api/canvas/assignments/[courseId]/route.ts`

Canvas API의 **원본 응답**을 로깅하여 submission 객체의 실제 구조를 확인합니다.

```typescript
// Quiz와 Lab의 원본 submission 객체 출력
assignmentGroups.forEach((group) => {
  group.assignments?.forEach((assignment) => {
    // submission: null인지, score: 0인지 등 확인
  });
});
```

### 2. Mapper 로직 상세 로깅

**위치**: `lib/canvas/mapper.ts`

각 Assignment가 매핑되는 과정을 상세히 로깅합니다.

```typescript
// Quiz/Lab에 대해:
// - submission 객체 존재 여부
// - workflow_state 값
// - score 값
// - 최종 earned 값 결정 과정
```

### 3. 매핑 후 최종 데이터 확인

**위치**: `app/api/canvas/assignments/[courseId]/route.ts`

매핑이 완료된 후 최종 데이터 상태를 확인합니다.

## 📊 로그 확인 방법

### 터미널에서 확인

개발 서버를 실행한 터미널에서 다음과 같은 로그를 확인할 수 있습니다:

```
🔍 CANVAS API RAW RESPONSE =====================================
Course ID: 12345

📁 Group: Quizzes
  📝 Quiz 1
     Points: 10
     Submission: {
       "workflow_state": "unsubmitted",
       "score": null,
       ...
     }

============================================================
📝 Assignment: Quiz 1
   Points Possible: 10
   Submission exists: YES
   Submission details:
      workflow_state: unsubmitted
      score: null
      submitted_at: null
      graded_at: null
      missing: false
      late: false
      excused: false
============================================================
   ✅ hasSubmission: false
   ✅ Final earned value: null
   ✅ Will be counted in grade: NO

✅ AFTER MAPPING ===============================================
📁 Quizzes:
  📝 Quiz 1
     Points: 10, Earned: null
     Submitted: false, Graded: false
     Missing: false, Excused: false
============================================================
```

## 🎯 진단 시나리오

### 시나리오 A: Canvas가 실제로 0점 처리

```json
{
  "submission": {
    "workflow_state": "graded",
    "score": 0,
    "submitted_at": "2024-11-01T10:00:00Z",
    "graded_at": "2024-11-02T10:00:00Z"
  }
}
```

**결과**: `earned: 0` (정상)
**의미**: 실제로 0점을 받았으므로 0점으로 계산해야 함

### 시나리오 B: 제출했지만 채점 안됨

```json
{
  "submission": {
    "workflow_state": "submitted",
    "score": null,
    "submitted_at": "2024-11-01T10:00:00Z",
    "graded_at": null
  }
}
```

**결과**: `earned: null` (정상)
**의미**: 제출했지만 아직 채점되지 않음

### 시나리오 C: 아직 제출 안함

```json
{
  "submission": {
    "workflow_state": "unsubmitted",
    "score": null,
    "submitted_at": null,
    "graded_at": null
  }
}
```

**결과**: `earned: null` (정상)
**의미**: 아직 제출하지 않음, 성적 계산에서 제외

### 시나리오 D: submission 객체 자체가 없음

```json
{
  "submission": null
}
```

**결과**: `earned: null` (정상)
**의미**: 제출 정보 없음, 성적 계산에서 제외

## 🔄 개선된 로직

### 이전 (문제):

```typescript
const hasSubmission =
  assignment.submission?.workflow_state === "graded" ||
  assignment.submission?.workflow_state === "submitted";

let earned: number | null = null;
if (hasSubmission) {
  earned = assignment.submission?.score ?? 0; // ❌ null → 0 변환
}
```

### 이후 (해결):

```typescript
const hasSubmission =
  assignment.submission !== null &&
  assignment.submission !== undefined &&
  (assignment.submission.workflow_state === "graded" ||
    assignment.submission.workflow_state === "submitted");

let earned: number | null = null;
if (hasSubmission && assignment.submission) {
  // ✅ score가 명시적으로 숫자인 경우만 사용
  earned =
    typeof assignment.submission.score === "number"
      ? assignment.submission.score
      : null;
}
```

## 📝 다음 단계

1. **앱에서 코스 데이터 새로고침**

   - Canvas 인증 후 코스 페이지 접속
   - 브라우저 개발자 도구 열기 (F12)
   - 터미널 로그 확인

2. **로그 분석**

   - Quiz 4개의 submission 상태 확인
   - `workflow_state` 값 확인
   - `score` 값 확인 (null vs 0)

3. **Canvas 웹사이트 직접 확인**

   - Canvas에 로그인
   - 해당 Quiz들의 실제 상태 확인
   - "Not Submitted" vs "Graded: 0/10" 확인

4. **결과 보고**
   - 터미널 로그 스크린샷
   - Canvas UI 스크린샷
   - 비교 분석

## 🚀 서버 재시작

캐시를 완전히 제거하고 새로 시작:

```bash
cd GradePlanner
rm -rf .next
npm run dev
```

포트 3001에서 실행됩니다 (3000이 사용 중인 경우).

## 📌 핵심 확인 사항

✅ **Canvas API 원본 응답**의 `submission` 객체 구조
✅ **workflow_state** 값 (graded, submitted, unsubmitted, pending_review)
✅ **score** 값 (숫자, null, undefined)
✅ **Canvas UI**에서 실제 Quiz 상태
✅ **최종 earned 값**이 올바르게 계산되는지

이 정보를 통해 문제의 정확한 원인을 파악할 수 있습니다!
