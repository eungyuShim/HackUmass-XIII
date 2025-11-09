# Canvas Grade Calculator - Project Overview

## 📋 Project Overview

A Canvas LMS integrated grade calculation web service. When users input their Canvas Personal Access Token, the service uses AI to parse the course syllabus and calculates the minimum scores needed on remaining assignments/exams to achieve target grades.

## 🎯 Core Features

- ✅ Canvas API Integration (Personal Access Token authentication)
- ✅ PDF Syllabus AI Parsing (Claude API)
- ✅ 2 Calculation Strategies (Equal Distribution, Proportional Distribution)
- ✅ Real-time Grade Synchronization and Dashboard
- ✅ Slider-based Score Adjustment with Real-time Recalculation

---

## 🛠 Tech Stack

```
📦 Core Framework
├─ Next.js 14 (App Router)
├─ TypeScript
└─ Tailwind CSS

🎨 UI Components
└─ Custom Components (auth, courses, dashboard, setup, shared)

📊 State Management
├─ Zustand (useCategoryStore, useProgressStore, useSetupStore)
└─ sessionStorage (Canvas Token)

🔌 API
├─ Next.js API Routes (Canvas API proxy)
├─ Claude API (Sonnet 3.5 - PDF parsing)
└─ Custom hooks (useAppInit, useStorage)

📄 PDF Processing
└─ pdf-parse (server-side)

🧪 Testing
└─ Vitest (calculation logic verification)

💾 Storage
└─ localStorage (syllabus settings, calculation results)

🚀 Deploy
└─ Vercel
```

---

## 📁 Project Structure

```
GradePlanner/
├── 📄 Configuration Files
│   ├── .env.local.example         (environment variables template)
│   ├── .gitignore                 (Git ignore file)
│   ├── components.json            (component config)
│   ├── next.config.js             (Next.js config)
│   ├── package.json               (project dependencies)
│   ├── package-lock.json          (dependency lock file)
│   ├── postcss.config.js          (PostCSS config)
│   ├── tailwind.config.ts         (Tailwind CSS config)
│   ├── tsconfig.json              (TypeScript config)
│   └── vitest.config.ts           (Vitest test config)
│
├── 📄 Documentation
│   ├── README.md                  (project overview)
│   ├── STRUCTURE.md               (detailed structure documentation)
│   ├── MIGRATION.md               (migration guide)
│   └── instruction_prompt.md      (development instructions)
│
├── 📁 __tests__/
│   ├── calculations.test.ts       (calculation logic tests)
│   └── helpers.test.ts            (helper function tests)
│
├── 📁 app/
│   ├── layout.tsx                 (root layout)
│   ├── page.tsx                   (landing page)
│   │
│   ├── 📁 api/
│   │   ├── 📁 ai/
│   │   │   └── parse-syllabus/
│   │   │       └── route.ts       (AI Syllabus parsing endpoint)
│   │   │
│   │   └── 📁 canvas/
│   │       ├── assignments/
│   │       │   └── [courseId]/
│   │       │       └── route.ts   (assignment list endpoint)
│   │       ├── courses/
│   │       │   └── route.ts       (course list endpoint)
│   │       └── verify/
│   │           └── route.ts       (token verification endpoint)
│   │
│   ├── 📁 courses/
│   │   └── page.tsx               (course selection page)
│   │
│   ├── 📁 dashboard/
│   │   └── page.tsx               (main dashboard page)
│   │
│   ├── 📁 stores/
│   │   ├── useCategoryStore.ts    (category state management)
│   │   ├── useProgressStore.ts    (progress state management)
│   │   └── useSetupStore.ts       (setup state management)
│   │
│   └── 📁 types/
│       ├── dashboard.ts           (dashboard type definitions)
│       └── setup.ts               (setup type definitions)
│
├── 📁 components/
│   ├── 📁 auth/
│   │   └── index.css              (authentication styles)
│   │
│   ├── 📁 courses/
│   │   └── course.css             (course selection styles)
│   │
│   ├── 📁 dashboard/
│   │   ├── CategoryCard.tsx       (category card component)
│   │   ├── CategoryItem.tsx       (category item component)
│   │   ├── CategoryList.tsx       (category list component)
│   │   ├── dashboard.css          (dashboard styles)
│   │   ├── GradeStrategy.tsx      (strategy selection component)
│   │   └── ProgressBar.tsx        (progress bar component)
│   │
│   ├── 📁 setup/
│   │   ├── setup.css              (setup styles)
│   │   ├── SetupCategoryCard.tsx  (setup category card)
│   │   └── SetupModal.tsx         (setup modal component)
│   │
│   └── 📁 shared/
│       └── global.css             (global shared styles)
│
├── 📁 hooks/
│   ├── useAppInit.ts              (app initialization hook)
│   └── useStorage.ts              (localStorage management hook)
│
└── 📁 public/
    └── 📁 icons/
        ├── eye-alt.svg            (visibility icon)
        ├── eye-close.svg          (hidden icon)
        ├── file-upload.svg        (upload icon)
        ├── list.svg               (list icon)
        ├── pin-fill.svg           (pinned icon)
        ├── pin.svg                (pin icon)
        ├── send-outline.svg       (send icon)
        └── trash.svg              (delete icon)
```

---

## 📝 Workflow

### 1. Token Input and Connection

- Input Canvas Personal Access Token
- Input Canvas institution URL (e.g., `https://umass.instructure.com`)
- Verify token and save to localStorage

### 2. Course Selection

- Fetch current semester active course list via Canvas API
- Select a course

### 3. Syllabus Setup

- Upload PDF (AI auto-analysis) or skip
- AI analysis: Extract category score weights, exam info, assignment/quiz counts
- Set attendance initial value to full points
- User confirmation and modification, then save to localStorage

### 4. Canvas Grade Synchronization

- Fetch all assignments for the selected course via Canvas API
- Automatically map each assignment to categories
- Fill in earned scores for graded items
- Set earned = null for pending items

### 5. Target Grade Selection

- Select from dropdown: A (93%), A- (90%), B+ (87%), etc.

### 6. Calculation Strategy Selection (Required)

**Strategy 1: Equal Distribution**

- Distribute burden equally across all items
- "Sacrifice small items, focus on big items" strategy
- Distribute deductions equally, items that can't handle deductions get 0 and redistribute

**Strategy 2: Proportional Distribution**

- Distribute burden proportionally to weights
- "Pay attention to all items evenly" strategy
- Calculate minimum scores proportional to each item's weight

### 7. Dashboard - Display Calculation Results

**Top Progress Bar**

- Current Max Potential: Maximum achievable score assuming full points on remaining items
- Real-time updates

**Header Information**

- Selected strategy (switchable via dropdown)
- Current score / Target score / Progress (%)
- Remaining deduction buffer

**Category Table**

- Item name, weight, status icon (✅ Complete / ⏳ Pending / 🗑️ Dropped)
- Completed items: Display actual earned score, non-editable
- Pending items: Display minimum required score, slider enabled

### 8. Slider Score Adjustment (Optional)

**Slider Features**

- Range: Calculated minimum score ~ full points
- Real-time adjustment
- Automatically recalculate other items' minimum scores when adjusted

**Cascading Recalculation**

1. Adjust specific item slider (e.g., raise exam3 to 7%)
2. Immediately reflect adjusted item value
3. Recalculate current total score
4. Required score = Target - Current score
5. Recalculate minimum scores for other remaining items
6. Update progress bar and UI

**Constraints**

- Minimum: Cannot go below calculated minimum score
- Maximum: Item's full points
- Completed items: Slider disabled

### 9. Real-time Feedback

**Feedback Messages**

- ✅ "Goal achieved! +2% buffer"
- ⚠️ "1% short of goal"
- 💡 "Raising Exam 3 to 5% will achieve goal!"

**Handling Impossible Situations**

- Warning: "⚠️ Goal unachievable with current settings"
- Suggestion: "💡 Raising Exam 3 to X% will achieve goal"

### 10. Strategy Switching

- Switch between Strategy 1 ↔ Strategy 2 via dropdown
- On strategy change: Recalculate all minimum scores, reset slider values, auto-update UI
- Return to step 7 to display new calculation results

---

## 🔧 Core Functions

```javascript
// Authentication & Data (API Routes)
// app/api/canvas/verify/route.ts
verifyToken(); // Verify Canvas token

// app/api/canvas/courses/route.ts
getCourses(); // Fetch course list

// app/api/canvas/assignments/[courseId]/route.ts
getAssignments(); // Fetch assignment list

// app/api/ai/parse-syllabus/route.ts
parseSyllabusWithAI(); // Parse Syllabus with AI

// State Management (Zustand Stores)
// app/stores/useSetupStore.ts
useSetupStore; // Syllabus setup state

// app/stores/useCategoryStore.ts
useCategoryStore; // Category and assignment state

// app/stores/useProgressStore.ts
useProgressStore; // Progress and calculation state

// Custom Hooks
// hooks/useAppInit.ts
useAppInit(); // Initialize app state

// hooks/useStorage.ts
useStorage(); // localStorage management

// Calculation Strategies (__tests__/calculations.test.ts)
calculateStrategy1(); // Equal Distribution
calculateStrategy2(); // Proportional Distribution

// Slider Adjustment & Recalculation
onSliderChange(itemId, newValue); // Called when slider changes
recalculateRemaining(); // Recalculate minimum scores for remaining items
validateGoal(); // Check if goal is achievable

// Helper Functions
applyDropPolicy(); // (Planned) Apply drop policy
calculateMaxPotential(); // Calculate max potential score for progress bar
switchStrategy(); // Switch strategy (includes slider reset)
updateDashboard(); // Update UI
```

---

## 🚀 Getting Started

### 1. Environment Variables Setup

Copy `.env.local.example` to `.env.local` and input your Claude API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
CLAUDE_API_KEY=your_actual_claude_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run Development Server

```bash
npm run dev
```

Once the server is running, visit http://localhost:3000 in your browser.

### 3. Run Tests

```bash
npm test
```

---

## 🔐 Security Considerations

- **Canvas Token Management**: Stored in sessionStorage (auto-deleted when tab closes)
- **API Proxy**: All Canvas API requests proxied through Next.js API Routes
- **Environment Variables**: Claude API key managed via environment variables (.env.local)
- **CORS Prevention**: Direct Canvas API calls from client prohibited

---

## 🧪 Testing Strategy

### Calculation Logic Tests (Vitest)

**File**: `__tests__/calculations.test.ts`

- Strategy 1: Equal Distribution tests
- Strategy 2: Proportional Distribution tests
- Edge cases: No remaining items, goal already achieved, negative scores, slider adjustment scenarios

### Helper Function Tests

**File**: `__tests__/helpers.test.ts`

- Utility function tests
- Data transformation tests
- Validation logic tests

---

## 📚 Reference Documentation

- [Canvas API Documentation](https://canvas.instructure.com/doc/api/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

## 🐛 Known Issues

No known issues at this time

---

## 📄 License

MIT License

---

## 👥 Contributors

- Eungyu
- Jongchan
- Jooyoung

---

## 📞 Contact

For project inquiries, please create an issue.

---

**Last Updated**: November 9, 2025
**Version**: 0.1.0 (Initial setup complete)
