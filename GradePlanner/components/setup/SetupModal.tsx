// SetupModal.tsx - Course Setup Modal
"use client";

import { useState } from "react";
import Image from "next/image";
import { useSetupStore } from "@/app/stores/useSetupStore";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import SetupCategoryCard from "./SetupCategoryCard";

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupModal({ isOpen, onClose }: SetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [syllabusSuggestions, setSyllabusSuggestions] = useState<any[]>([]);

  const setupCategories = useSetupStore((state) => state.setupCategories);
  const addSetupCategory = useSetupStore((state) => state.addSetupCategory);
  const getTotalWeight = useSetupStore((state) => state.getTotalWeight);
  const reset = useSetupStore((state) => state.reset);
  const setSetupCategories = useSetupStore((state) => state.setSetupCategories);

  const setCategories = useCategoryStore((state) => state.setCategories);
  const categories = useCategoryStore((state) => state.categories);
  const bumpId = useCategoryStore((state) => state.bumpId);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setUploadStatus("");
    setSelectedFile(null);
    setIsUploading(false);
    setUploadError("");
    setSyllabusSuggestions([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes("pdf")) {
        setUploadError("Please select a PDF file");
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File is too large. Maximum size is 10MB");
        return;
      }

      setSelectedFile(file);
      setUploadStatus(`✓ File selected: ${file.name}`);
      setUploadError("");
    }
  };

  const handleSkipToAnalysis = () => {
    setUploadStatus("");
    setUploadError("");

    // Load sample categories if store is empty
    if (setupCategories.length === 0) {
      const sampleCategories = [
        { id: 1, name: "Exams", weight: 40, count: 3 },
        { id: 2, name: "Homework", weight: 30, count: 10 },
        { id: 3, name: "Quizzes", weight: 20, count: 8 },
        { id: 4, name: "Participation", weight: 10, count: 1 },
      ];
      setSetupCategories(sampleCategories);
    }

    setStep(2);
  };

  const handleProceedToAnalysis = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadStatus("🔄 Uploading and analyzing syllabus...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ai/parse-syllabus", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse syllabus");
      }

      // Parse syllabus categories
      if (result.data && result.data.categories) {
        const parsedCategories = result.data.categories.map(
          (cat: any, index: number) => ({
            id: index + 1,
            name: cat.name || "Untitled Category",
            weight: cat.weight || 0,
            count: cat.count || 1,
          })
        );

        // If Canvas data exists, merge with syllabus (Syllabus fills gaps)
        if (categories.length > 0) {
          const mergedCategories = mergeSyllabusWithCanvas(
            categories,
            parsedCategories
          );
          setSetupCategories(mergedCategories);
          setUploadStatus(
            "✓ Syllabus merged with Canvas data! Review suggestions below."
          );
          setSyllabusSuggestions(parsedCategories);
        } else {
          // No Canvas data, use syllabus as primary source
          setSetupCategories(parsedCategories);
          setUploadStatus("✓ Syllabus parsed successfully!");
        }
      } else {
        setUploadStatus("⚠ Parsing completed but no categories found");
      }

      // Move to step 2 after a short delay
      setTimeout(() => {
        setStep(2);
      }, 1000);
    } catch (error) {
      console.error("Syllabus parsing error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to parse syllabus"
      );
      setUploadStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  // Merge syllabus with Canvas data (syllabus fills gaps, doesn't replace)
  const mergeSyllabusWithCanvas = (
    canvasCategories: any[],
    syllabusCategories: any[]
  ) => {
    const merged = [...canvasCategories];

    syllabusCategories.forEach((sylCat) => {
      // Check if category exists in Canvas
      const existingIndex = merged.findIndex(
        (canvasCat) =>
          canvasCat.name.toLowerCase() === sylCat.name.toLowerCase()
      );

      if (existingIndex === -1) {
        // Category doesn't exist in Canvas - ADD IT (보완)
        merged.push({
          id: Math.max(...merged.map((c) => c.id), 0) + 1,
          name: sylCat.name,
          weight: sylCat.weight,
          count: sylCat.count,
        });
      } else {
        // Category exists - UPDATE count if Canvas has fewer items
        const canvasCat = merged[existingIndex];
        if (canvasCat.count < sylCat.count) {
          merged[existingIndex] = {
            ...canvasCat,
            count: sylCat.count, // Use syllabus count if higher
          };
        }
      }
    });

    return merged;
  };

  const handleBackToUpload = () => {
    setStep(1);
  };

  const handleConfirmSetup = () => {
    const totalWeight = getTotalWeight();

    if (totalWeight !== 100) {
      alert("Grade weights must total 100%");
      return;
    }

    // Convert setup categories to dashboard categories
    const newCategories = setupCategories.map((setupCat, index) => {
      const items = Array.from({ length: setupCat.count }, (_, i) => ({
        name: `${setupCat.name} ${i + 1}`,
        score: null,
        _editingName: false,
        _editingScore: false,
      }));

      return {
        id: setupCat.id,
        name: setupCat.name,
        weight: setupCat.weight,
        items,
        _open: false,
        _editingName: false,
        _editingWeight: false,
      };
    });

    // Set the categories in the category store
    setCategories(newCategories);

    // Update nextCategoryId to be one more than the highest ID
    const maxId = Math.max(...setupCategories.map((cat) => cat.id), 0);
    for (let i = 0; i <= maxId; i++) {
      bumpId();
    }

    // Reset setup store
    reset();

    // Close modal
    handleClose();
  };

  const totalWeight = getTotalWeight();
  const isWeightValid = totalWeight === 100;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content setup-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
                Upload your course syllabus PDF for automatic grading category
                detection using AI, or skip to enter categories manually.
              </p>

              {selectedFile && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setUploadStatus("");
                      setUploadError("");
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      background: "white",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <div
                className="upload-area"
                onClick={() =>
                  document.getElementById("syllabusFileUpload")?.click()
                }
                style={{
                  cursor: isUploading ? "not-allowed" : "pointer",
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                <div className="upload-icon">
                  <Image
                    src="/icons/file-upload.svg"
                    alt="Upload"
                    width={64}
                    height={64}
                  />
                </div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    margin: "12px 0 4px",
                  }}
                >
                  {selectedFile ? "Change file" : "Click to upload syllabus"}
                </p>
                <p className="upload-hint">PDF files only (Max 10MB)</p>
              </div>

              <input
                type="file"
                id="syllabusFileUpload"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={isUploading}
              />

              {uploadStatus && (
                <div
                  className="upload-status"
                  style={{
                    color: uploadStatus.includes("✓")
                      ? "var(--success)"
                      : "var(--primary)",
                    fontWeight: 500,
                  }}
                >
                  {uploadStatus}
                </div>
              )}

              {uploadError && (
                <div
                  className="upload-status"
                  style={{
                    color: "var(--error, #dc2626)",
                    fontWeight: 500,
                  }}
                >
                  ❌ {uploadError}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSkipToAnalysis}
                className="btn btn-secondary"
                disabled={isUploading}
              >
                Skip Upload
              </button>
              <button
                onClick={handleProceedToAnalysis}
                className="btn btn-primary"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Analyzing..." : "Proceed"}
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
                Define your grade categories, their weights, and number of
                items.
              </p>

              <div className="setup-categories-container">
                <div className="setup-categories-list">
                  {setupCategories.map((category) => (
                    <SetupCategoryCard key={category.id} category={category} />
                  ))}
                </div>

                <button
                  onClick={addSetupCategory}
                  className="btn btn-secondary btn-block"
                >
                  + Add Category
                </button>
              </div>

              <div className="setup-total-weight">
                <span>Total Weight: </span>
                <strong
                  className={isWeightValid ? "weight-valid" : "weight-invalid"}
                >
                  {totalWeight}%
                </strong>
                {!isWeightValid && (
                  <span className="setup-weight-warning">
                    {" "}
                    ⚠ Must equal 100%
                  </span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleBackToUpload}
                className="btn btn-secondary"
              >
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
