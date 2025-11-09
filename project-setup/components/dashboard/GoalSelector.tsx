"use client";

interface GradeButtonProps {
  grade: string;
  isSelected: boolean;
  onClick: () => void;
}

function GradeButton({ grade, isSelected, onClick }: GradeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-semibold text-sm transition-all
        ${
          isSelected
            ? "bg-[var(--accent)] text-white shadow-md scale-105"
            : "bg-white border border-[var(--border-light)] text-[var(--txt)] hover:border-[var(--accent)] hover:shadow-sm"
        }
      `}
    >
      {grade}
    </button>
  );
}

interface GoalSelectorProps {
  selectedGrade: string;
  onGradeSelect: (grade: string) => void;
}

export function GoalSelector({
  selectedGrade,
  onGradeSelect,
}: GoalSelectorProps) {
  const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-"];

  return (
    <div>
      <div className="text-sm text-[var(--txt-muted)] mb-3">
        Select a target letter grade to see required strategy:
      </div>
      <div className="flex flex-wrap gap-2">
        {grades.map((grade) => (
          <GradeButton
            key={grade}
            grade={grade}
            isSelected={selectedGrade === grade}
            onClick={() => onGradeSelect(grade)}
          />
        ))}
      </div>
    </div>
  );
}
