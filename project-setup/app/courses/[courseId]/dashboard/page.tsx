"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { GoalSelector } from "@/components/dashboard/GoalSelector";
import { CategoryTable } from "@/components/dashboard/CategoryTable";
import { StrategySelector } from "@/components/dashboard/StrategySelector";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface Category {
  id: string;
  name: string;
  weight: number;
  average: number;
  items: any[];
}

export default function DashboardPage({
  params,
}: {
  params: { courseId: string };
}) {
  const [courseName, setCourseName] = useState("Course Name");
  const [selectedGrade, setSelectedGrade] = useState("A");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    const name =
      sessionStorage.getItem("current_course_name") || "Selected Course";
    setCourseName(name);

    // Load saved categories or use demo data
    const storageKey = `grade_planner:${name}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.warn("Failed to load categories", e);
      }
    } else {
      // Demo data
      setCategories([
        {
          id: "1",
          name: "Assignments",
          weight: 40,
          average: 85.5,
          items: [],
        },
        {
          id: "2",
          name: "Exams",
          weight: 50,
          average: 78.0,
          items: [],
        },
        {
          id: "3",
          name: "Participation",
          weight: 10,
          average: 95.0,
          items: [],
        },
      ]);
    }
  }, []);

  // Save categories when they change
  useEffect(() => {
    if (categories.length > 0) {
      const storageKey = `grade_planner:${courseName}`;
      localStorage.setItem(storageKey, JSON.stringify({ categories }));
    }
  }, [categories, courseName]);

  const handleUpdateCategory = (updated: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updated.id ? updated : cat))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: "New Category",
      weight: 0,
      average: 0,
      items: [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const currentGrade = categories.reduce(
    (sum, cat) => sum + (cat.average * cat.weight) / 100,
    0
  );
  const maxGrade = categories.reduce(
    (sum, cat) => sum + (100 * cat.weight) / 100,
    0
  );

  // Grade thresholds
  const gradeThresholds: Record<string, number> = {
    A: 93,
    "A-": 90,
    "B+": 87,
    B: 83,
    "B-": 80,
    "C+": 77,
    C: 73,
    "C-": 70,
  };

  const targetGrade = gradeThresholds[selectedGrade] || 93;

  return (
    <div className="flex min-h-screen">
      <Sidebar courseId={params.courseId} />

      <div className="flex-1 bg-[var(--bg-left)] overflow-y-auto lg:ml-[260px]">
        {/* Header */}
        <header className="bg-white px-8 py-5 border-b border-[var(--border)] shadow-[var(--shadow-sm)] flex justify-between items-center">
          <div>
            <div className="text-[13px] text-[var(--txt-muted)] mb-1">
              Current Course
            </div>
            <h2 className="text-[28px] font-bold text-[var(--txt)] mb-3">
              {courseName}
            </h2>
            <GoalSelector
              selectedGrade={selectedGrade}
              onGradeSelect={setSelectedGrade}
            />
          </div>
          <Button
            onClick={() => setShowSetupModal(true)}
            className="bg-white border border-[var(--border)] hover:bg-[var(--bg-gray)] text-[var(--txt)] shadow-[var(--shadow-sm)]"
          >
            <Upload className="w-5 h-5 mr-2" />
            Course Setup
          </Button>
        </header>

        {/* Main Content */}
        <div className="max-w-[1200px] mx-auto px-8 py-7">
          {/* Progress Bar */}
          <ProgressBar
            maxGrade={maxGrade}
            targetGrade={targetGrade}
            targetLabel={selectedGrade}
          />

          {/* Grade Categories */}
          <div className="bg-white border border-[var(--border-light)] rounded-xl p-7 mt-4 shadow-[var(--shadow-sm)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Grade Categories</h3>
              <Button
                onClick={handleAddCategory}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            <div className="space-y-4">
              <CategoryTable
                categories={categories}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />
            </div>

            <div className="mt-4 p-3 bg-[var(--bg-gray)] rounded-lg text-sm">
              <span className="font-semibold">Total Weight:</span>{" "}
              <span
                className={
                  totalWeight === 100
                    ? "text-[var(--success)]"
                    : "text-[var(--txt)]"
                }
              >
                {totalWeight}%
              </span>
              {totalWeight !== 100 && (
                <span className="text-red-600 ml-2">Must equal 100%</span>
              )}
            </div>
          </div>

          {/* Current Grade Summary */}
          <div className="bg-white border border-[var(--border-light)] rounded-xl p-7 mt-4 shadow-[var(--shadow-sm)]">
            <details>
              <summary className="cursor-pointer font-semibold py-2">
                View Current Grade Summary
              </summary>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[var(--border-light)]">
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-left p-3 font-semibold">
                        Current Average
                      </th>
                      <th className="text-left p-3 font-semibold">
                        Weight (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-[var(--border-light)]"
                      >
                        <td className="p-3">{cat.name}</td>
                        <td className="p-3">{cat.average.toFixed(1)}%</td>
                        <td className="p-3">{cat.weight}%</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-[var(--bg-gray)]">
                      <td className="p-3">Current Grade</td>
                      <td className="p-3">{currentGrade.toFixed(1)}%</td>
                      <td className="p-3">{totalWeight}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
