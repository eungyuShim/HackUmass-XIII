// ProgressBar.tsx - 현재 점수 및 진행도 표시
'use client';

import Image from 'next/image';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useProgressStore } from '@/app/stores/useProgressStore';
import { GRADE_MAP, GRADE_OPTIONS } from '@/app/types/dashboard';

export default function ProgressBar() {
  // Subscribe to categories to trigger re-render when they change
  const categories = useCategoryStore((state) => state.categories);
  const calcProgressStats = useCategoryStore((state) => state.calcProgressStats);
  const currentTargetGrade = useProgressStore((state) => state.currentTargetGrade);
  const setTargetGrade = useProgressStore((state) => state.setTargetGrade);
  
  // Recalculate stats whenever categories change
  const stats = calcProgressStats();
  
  const maxPercentage = Math.min(100, Math.max(0, stats.maxPct));
  const targetThreshold = GRADE_MAP[currentTargetGrade];
  const pinPosition = targetThreshold; // Position in percentage
  
  const handleGradeClick = (grade: string) => {
    setTargetGrade(grade as any);
  };
  
  return (
    <div className="card">
      <h3>Grade Range Projection</h3>
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              id="maxFill" 
              style={{ width: `${maxPercentage}%` }}
            ></div>
          </div>
          <div 
            className="progress-pin" 
            id="targetPin" 
            style={{ display: 'flex', left: `${pinPosition}%` }}
          >
            <div 
              className="progress-pin-label" 
              id="targetPinLabel" 
              title={`${currentTargetGrade} ≥ ${targetThreshold}%`}
            >
              {currentTargetGrade}
            </div>
            <Image
              src="/icons/pin.svg"
              alt="target"
              width={20}
              height={20}
              className="progress-pin-icon"
            />
          </div>
          <div className="progress-label">
            <span className="progress-label-text">Maximum Possible Grade</span>
            <span className="progress-label-value" id="maxVal">
              {maxPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Grade Selection Buttons */}
      <div className="grade-select-hint">Select a target letter grade to see required strategy:</div>
      <div className="grade-options" id="gradeOptions">
        {GRADE_OPTIONS.map((grade) => (
          <button
            key={grade}
            className={`grade-btn ${currentTargetGrade === grade ? 'active' : ''}`}
            data-grade={grade}
            onClick={() => handleGradeClick(grade)}
          >
            {grade}
          </button>
        ))}
      </div>
    </div>
  );
}
