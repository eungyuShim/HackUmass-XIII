// GradeStrategy.tsx - Grade Strategy with sliders and projected grade
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useProgressStore } from '@/app/stores/useProgressStore';

export default function GradeStrategy() {
  const categories = useCategoryStore((state) => state.categories);
  const currentTargetGrade = useProgressStore((state) => state.currentTargetGrade);
  const ungradedItems = useProgressStore((state) => state.ungradedItems);
  const projectedGrade = useProgressStore((state) => state.projectedGrade);
  const collectUngradedItems = useProgressStore((state) => state.collectUngradedItems);
  const calculateTotalDeductiblePoints = useProgressStore((state) => state.calculateTotalDeductiblePoints);
  const updateSlider = useProgressStore((state) => state.updateSlider);
  const togglePin = useProgressStore((state) => state.togglePin);
  const calculateProjectedGrade = useProgressStore((state) => state.calculateProjectedGrade);
  
  // Update ungraded items when categories change
  useEffect(() => {
    collectUngradedItems(categories);
  }, [categories, collectUngradedItems]);
  
  // Recalculate when target grade changes
  useEffect(() => {
    calculateTotalDeductiblePoints(categories);
  }, [currentTargetGrade, categories, calculateTotalDeductiblePoints]);
  
  // Update projected grade when sliders change
  useEffect(() => {
    calculateProjectedGrade(categories);
  }, [ungradedItems, categories, calculateProjectedGrade]);
  
  const handleSliderChange = (index: number, value: number) => {
    updateSlider(index, value);
    // Recalculate projected grade after slider change
    calculateProjectedGrade(categories);
  };
  
  const handlePinToggle = (index: number) => {
    togglePin(index);
  };
  
  const hasUngradedItems = ungradedItems.length > 0;
  
  return (
    <>
      {/* Target Strategy Card */}
      {hasUngradedItems && (
        <div className="card" id="targetStrategy">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 id="strategyTitle" style={{ margin: 0 }}>
              Strategy for {currentTargetGrade}
            </h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: 'var(--txt-muted)', marginBottom: '2px' }}>
                Projected Grade
              </div>
              <div 
                id="projectedGrade" 
                style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: 'var(--accent)' 
                }}
              >
                {projectedGrade.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div 
            id="ungradedItemsList" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}
          >
            {ungradedItems.map((item, index) => (
              <div key={`${item.categoryId}-${item.itemName}`} className="ungraded-item-slider">
                <div className="slider-header">
                  <div className="slider-item-info">
                    <div className="slider-item-text">
                      <div className="slider-item-name">
                        {item.itemName}
                      </div>
                      <div className="slider-item-category">
                        {item.categoryName}
                      </div>
                    </div>
                    <button
                      className={`pin-btn ${item.isPinned ? 'pin-btn--active' : ''}`}
                      type="button"
                      onClick={() => handlePinToggle(index)}
                    >
                      <Image
                        src="/icons/pin-fill.svg"
                        alt="pin"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                  <input
                    type="number"
                    className="slider-value-input"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.assumedScore}
                    onChange={(e) => handleSliderChange(index, parseFloat(e.target.value) || 0)}
                    disabled={item.isPinned}
                  />
                </div>
                <input
                  type="range"
                  className="target-slider"
                  min="0"
                  max="100"
                  step="0.1"
                  value={item.assumedScore}
                  onChange={(e) => handleSliderChange(index, parseFloat(e.target.value))}
                  disabled={item.isPinned}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

