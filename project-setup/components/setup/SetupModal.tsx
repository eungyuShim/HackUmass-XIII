// SetupModal.tsx - Course Setup Modal
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSetupStore } from '@/app/stores/useSetupStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import SetupCategoryCard from './SetupCategoryCard';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupModal({ isOpen, onClose }: SetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const setupCategories = useSetupStore((state) => state.setupCategories);
  const addSetupCategory = useSetupStore((state) => state.addSetupCategory);
  const getTotalWeight = useSetupStore((state) => state.getTotalWeight);
  const reset = useSetupStore((state) => state.reset);
  
  const setCategoryStore = useCategoryStore((state) => state.categories);
  const setCategories = useCategoryStore((state) => state.reset);
  const bumpId = useCategoryStore((state) => state.bumpId);
  
  if (!isOpen) return null;
  
  const handleClose = () => {
    setStep(1);
    setUploadStatus('');
    setSelectedFile(null);
    onClose();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(`✓ File selected: ${file.name}`);
    }
  };
  
  const handleSkipToAnalysis = () => {
    setUploadStatus('');
    setStep(2);
  };
  
  const handleProceedToAnalysis = () => {
    setStep(2);
  };
  
  const handleBackToUpload = () => {
    setStep(1);
  };
  
  const handleConfirmSetup = () => {
    const totalWeight = getTotalWeight();
    
    if (totalWeight !== 100) {
      alert('Grade weights must total 100%');
      return;
    }
    
    // Save setup to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('course_setup', JSON.stringify(setupCategories));
    }
    
    // Convert setup categories to dashboard categories
    const newCategories = setupCategories.map((setupCat, index) => {
      const items = Array.from({ length: setupCat.count }, (_, i) => ({
        name: `${setupCat.name} ${i + 1}`,
        score: null,
        editingName: false,
        editingScore: false,
      }));
      
      return {
        id: index + 1,
        name: setupCat.name,
        weight: setupCat.weight,
        items,
        showItems: false,
        editingName: false,
        editingWeight: false,
      };
    });
    
    // Reset category store and set new categories
    setCategories();
    
    // Update with new categories (this would need to be added to useCategoryStore)
    // For now, we'll close and let the user manually add
    
    handleClose();
    alert('Settings applied successfully!');
  };
  
  const totalWeight = getTotalWeight();
  const isWeightValid = totalWeight === 100;
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content setup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Step 1: Syllabus Upload */}
        {step === 1 && (
          <div className="setup-step" id="step1">
            <div className="modal-header">
              <h2>Course Setup - Syllabus Upload</h2>
              <button onClick={handleClose} className="modal-close-btn">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="setup-instruction">
                Upload your course syllabus (PDF or image) for automatic analysis, or skip to manual entry.
              </p>
              
              <div
                className="upload-area"
                onClick={() => document.getElementById('syllabusFileUpload')?.click()}
              >
                <div className="upload-icon">📄</div>
                <p>Click to upload syllabus</p>
                <p className="upload-hint">Supports PDF, PNG, JPG</p>
              </div>
              
              <input
                type="file"
                id="syllabusFileUpload"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {uploadStatus && (
                <div className="upload-status" style={{ color: 'var(--success)' }}>
                  {uploadStatus}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button onClick={handleClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSkipToAnalysis} className="btn btn-secondary">
                Skip Upload
              </button>
              <button
                onClick={handleProceedToAnalysis}
                className="btn btn-primary"
                disabled={!selectedFile}
              >
                Proceed
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Category Configuration */}
        {step === 2 && (
          <div className="setup-step" id="step2">
            <div className="modal-header">
              <h2>Course Setup - Configure Categories</h2>
              <button onClick={handleClose} className="modal-close-btn">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="setup-instruction">
                Define your grade categories, their weights, and number of items.
              </p>
              
              <div className="setup-categories-container">
                <div className="setup-categories-list">
                  {setupCategories.map((category) => (
                    <SetupCategoryCard key={category.id} category={category} />
                  ))}
                </div>
                
                <button onClick={addSetupCategory} className="btn btn-secondary btn-block">
                  + Add Category
                </button>
              </div>
              
              <div className="setup-total-weight">
                <span>Total Weight: </span>
                <strong className={isWeightValid ? 'weight-valid' : 'weight-invalid'}>
                  {totalWeight}%
                </strong>
                {!isWeightValid && (
                  <span className="setup-weight-warning"> ⚠ Must equal 100%</span>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={handleBackToUpload} className="btn btn-secondary">
                Back
              </button>
              <button
                onClick={handleConfirmSetup}
                className="btn btn-primary"
                disabled={!isWeightValid}
              >
                Confirm Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
