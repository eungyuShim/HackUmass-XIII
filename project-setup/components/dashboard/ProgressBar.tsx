"use client";

interface ProgressBarProps {
  maxGrade: number;
  targetGrade: number;
  targetLabel: string;
}

export function ProgressBar({
  maxGrade,
  targetGrade,
  targetLabel,
}: ProgressBarProps) {
  const maxWidth = Math.min(maxGrade, 100);
  const targetPosition = Math.min(targetGrade, 100);

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-xl p-7 shadow-[var(--shadow-sm)]">
      <h3 className="text-lg font-semibold mb-5">Grade Range Projection</h3>

      <div className="relative">
        {/* Progress bar background */}
        <div className="h-3 bg-[var(--bg-gray)] rounded-full overflow-hidden relative">
          {/* Fill */}
          <div
            className="h-full bg-gradient-to-r from-[var(--success)] to-[var(--success-light)] rounded-full transition-all duration-500"
            style={{ width: `${maxWidth}%` }}
          />
        </div>

        {/* Target pin */}
        {targetGrade > 0 && (
          <div
            className="absolute -top-8 flex flex-col items-center transition-all duration-300"
            style={{
              left: `${targetPosition}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="px-2 py-1 bg-[var(--accent)] text-white text-xs font-bold rounded mb-1"
              title={`${targetLabel} ≥ ${targetGrade}%`}
            >
              {targetLabel}
            </div>
            <svg
              width="16"
              height="20"
              viewBox="0 0 24 24"
              fill="var(--accent)"
              className="drop-shadow-md"
            >
              <path
                d="M12 2L12 17M12 17L8 13M12 17L16 13"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {/* Label */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-[var(--txt-muted)]">
            Maximum Possible Grade
          </span>
          <span className="text-2xl font-bold text-[var(--accent)]">
            {maxWidth.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
