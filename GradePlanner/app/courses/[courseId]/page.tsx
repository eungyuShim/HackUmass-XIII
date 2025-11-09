"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useFirstVisit } from "@/hooks/useAppInit";
import CategoryList from "@/components/dashboard/CategoryList";
import ProgressBar from "@/components/dashboard/ProgressBar";
import GradeStrategy from "@/components/dashboard/GradeStrategy";
import SetupModal from "@/components/setup/SetupModal";
import Toast from "@/components/shared/Toast";
import { CategorySkeleton } from "@/components/shared/Skeleton";
import "@/components/shared/global.css";
import "@/components/dashboard/dashboard.css";
import "@/components/setup/setup.css";

export default function CourseDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const isFirstVisit = useFirstVisit();
  const setCategories = useCategoryStore((state) => state.setCategories);
  const { isAuthenticated, getAuthHeaders } = useAuthStore();

  // Load course info and assignments from Canvas
  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    // Validate courseId
    if (!courseId) {
      setToast({ message: "Invalid course ID", type: "error" });
      router.push("/courses");
      return;
    }

    loadCourseData();
  }, [courseId, isAuthenticated, router]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = getAuthHeaders();

      // Fetch assignment groups and assignments from Canvas
      const response = await fetch(`/api/canvas/assignments/${courseId}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assignments");
      }

      console.log("Canvas API Response:", data); // Debug log

      // Set course name (from sessionStorage or API)
      const savedCourseName = sessionStorage.getItem(`course_name_${courseId}`);
      if (savedCourseName) {
        setCourseName(savedCourseName);
      } else if (data.courseName) {
        setCourseName(data.courseName);
        sessionStorage.setItem(`course_name_${courseId}`, data.courseName);
      }

      // Convert Canvas categories to app format
      if (data.categories && data.categories.length > 0) {
        const formattedCategories = data.categories.map(
          (cat: any, index: number) => {
            console.log("Processing category:", cat); // Debug log

            return {
              id: index + 1, // Use simple incremental ID
              name: cat.name,
              weight: cat.weight || 0,
              items:
                cat.assignments?.map((assignment: any) => {
                  console.log(
                    "Processing assignment:",
                    assignment.name,
                    assignment
                  ); // Debug log

                  // Convert score to percentage (score/maxScore * 100) with 1 decimal place
                  let scorePercentage = null;
                  if (assignment.graded && assignment.points > 0) {
                    scorePercentage = parseFloat(
                      ((assignment.earned / assignment.points) * 100).toFixed(1)
                    );
                  }

                  return {
                    name: assignment.name,
                    score: scorePercentage,
                    maxScore: assignment.points || 0,
                    dueDate: assignment.dueDate,
                    submitted: assignment.submitted || false,
                    graded: assignment.graded || false,
                    late: assignment.late || false,
                    missing: assignment.missing || false,
                  };
                }) || [],
              editingName: false,
              editingWeight: false,
              showItems: true,
            };
          }
        );

        console.log("Formatted categories:", formattedCategories); // Debug log
        setCategories(formattedCategories);
        setToast({
          message: "Course data loaded successfully!",
          type: "success",
        });
      } else {
        console.log("No categories found in response");
        setToast({
          message: "No assignment categories found for this course",
          type: "warning",
        });
      }
    } catch (err) {
      console.error("Failed to fetch course data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load course data";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Open setup modal on first visit
  useEffect(() => {
    if (isFirstVisit && !loading) {
      setIsSetupModalOpen(true);
    }
  }, [isFirstVisit, loading]);

  const handleBackToCourses = () => {
    router.push("/courses");
  };

  const handleRefreshData = () => {
    loadCourseData();
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h1>
            Grade
            <br />
            Planner
          </h1>
          <p>Academic planning made easy</p>
          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <button
                onClick={handleBackToCourses}
                className="nav-link nav-link-button"
              >
                ← Back to Courses
              </button>
            </li>
          </ul>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Course Tools</div>
            <ul className="nav-list">
              <li className="nav-item">
                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="nav-link nav-link-button"
                >
                  Setup Course Data
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Data</div>
            <ul className="nav-list">
              <li className="nav-item">
                <button
                  onClick={handleRefreshData}
                  className="nav-link nav-link-button"
                >
                  Refresh Data
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div>
            <div className="header-subtitle">Current Course</div>
            <h2 id="course">{courseName || "Loading..."}</h2>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: "2rem" }}>
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "#ef4444",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>
              Error loading course
            </p>
            <p style={{ fontSize: "14px" }}>{error}</p>
            <button
              className="btn btn--outline"
              style={{ marginTop: "16px" }}
              onClick={handleBackToCourses}
            >
              Back to Courses
            </button>
          </div>
        ) : (
          <div className="wrap">
            {/* Setup Modal */}
            <SetupModal
              isOpen={isSetupModalOpen}
              onClose={() => setIsSetupModalOpen(false)}
            />

            {/* Progress Bar */}
            <ProgressBar />

            {/* Grade Strategy */}
            <GradeStrategy />

            {/* Categories */}
            <div className="card">
              <CategoryList />
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
