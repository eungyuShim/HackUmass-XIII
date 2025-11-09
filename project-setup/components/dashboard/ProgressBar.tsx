// ProgressBar.tsx - 현재 점수 및 진행도 표시
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useProgressStore } from '@/app/stores/useProgressStore';
import { GRADE_MAP, GRADE_OPTIONS, TargetGrade } from '@/app/types/dashboard';

export default function ProgressBar() {
  // Subscribe to categories to trigger re-render when they change
  const categories = useCategoryStore((state) => state.categories);
  const calcProgressStats = useCategoryStore((state) => state.calcProgressStats);
  const currentTargetGrade = useProgressStore((state) => state.currentTargetGrade);
  const setTargetGrade = useProgressStore((state) => state.setTargetGrade);
  const maxPossibleGrade = useProgressStore((state) => state.maxPossibleGrade);
  const calculateMaxPossibleGrade = useProgressStore((state) => state.calculateMaxPossibleGrade);
  
  // Recalculate stats whenever categories change
  const stats = calcProgressStats();
  
  // Calculate max possible grade
  useEffect(() => {
    calculateMaxPossibleGrade(categories);
  }, [categories, calculateMaxPossibleGrade]);
  
  // Set initial target grade to highest achievable grade
  useEffect(() => {
    if (categories.length > 0) {
      const maxGrade = calculateMaxPossibleGrade(categories);
      
      // Find the highest achievable grade
      const achievableGrade = GRADE_OPTIONS.find((grade) => {
        const threshold = GRADE_MAP[grade as TargetGrade];
        return maxGrade >= threshold;
      });
      
      if (achievableGrade && achievableGrade !== currentTargetGrade) {
        setTargetGrade(achievableGrade as TargetGrade);
      }
    }
  }, [categories.length]); // Only run when categories are first loaded
  
  const maxPercentage = Math.min(100, Math.max(0, stats.maxPct));
  const targetThreshold = GRADE_MAP[currentTargetGrade];
  const pinPosition = targetThreshold; // Position in percentage
  
  const handleGradeClick = (grade: string) => {
    setTargetGrade(grade as any);
  };
  
  // Check if a grade is achievable
  const isGradeAchievable = (grade: string): boolean => {
    const threshold = GRADE_MAP[grade as TargetGrade];
    return maxPossibleGrade >= threshold;
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
        {GRADE_OPTIONS.map((grade) => {
          const achievable = isGradeAchievable(grade);
          return (
            <button
              key={grade}
              className={`grade-btn ${currentTargetGrade === grade ? 'active' : ''} ${!achievable ? 'disabled' : ''}`}
              data-grade={grade}
              onClick={() => achievable && handleGradeClick(grade)}
              disabled={!achievable}
              title={!achievable ? `Cannot achieve ${grade} (Max: ${maxPossibleGrade.toFixed(1)}%)` : ''}
            >
              {grade}
            </button>
          );
        })}
      </div>
    </div>
  );
}
