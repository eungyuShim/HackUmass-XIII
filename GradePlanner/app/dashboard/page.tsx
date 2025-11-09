"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import { useFirstVisit } from "@/hooks/useAppInit";
import CategoryList from "@/components/dashboard/CategoryList";
import ProgressBar from "@/components/dashboard/ProgressBar";
import GradeStrategy from "@/components/dashboard/GradeStrategy";
import SetupModal from "@/components/setup/SetupModal";
import "@/components/shared/global.css";
import "@/components/dashboard/dashboard.css";
import "@/components/setup/setup.css";

export default function DashboardPage() {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFirstVisit = useFirstVisit();
  const router = useRouter();
  const setCategories = useCategoryStore((state) => state.setCategories);

  // Load course info and assignments from Canvas
  useEffect(() => {
    const loadCourseData = async () => {
      if (typeof window === "undefined") return;

      const currentCourseId = sessionStorage.getItem("current_course_id");
      const currentCourseName = sessionStorage.getItem("current_course_name");
      const token = sessionStorage.getItem("canvas_token");
      const baseUrl = sessionStorage.getItem("canvas_base_url");

      if (!currentCourseId || !currentCourseName) {
        router.push("/courses");
        return;
      }

      if (!token || !baseUrl) {
        router.push("/");
        return;
      }

      setCourseId(currentCourseId);
      setCourseName(currentCourseName);
      setLoading(true);
      setError("");

      try {
        // Fetch assignment groups and assignments from Canvas
        const response = await fetch(
          `/api/canvas/assignments/${currentCourseId}`,
          {
            headers: {
              "x-canvas-token": token,
              "x-canvas-base-url": baseUrl,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch assignments");
        }

        console.log("Canvas API Response:", data); // Debug log

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
        } else {
          console.log("No categories found in response");
        }
      } catch (err) {
        console.error("Failed to fetch course data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load course data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [router, setCategories]);

  // Open setup modal on first visit
  useEffect(() => {
    if (isFirstVisit && !loading) {
      setIsSetupModalOpen(true);
    }
  }, [isFirstVisit, loading]);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
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
              <a href="/courses" className="nav-link">
                Back to Courses
              </a>
            </li>
          </ul>
          
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              Course Tools
            </div>
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
            <div className="sidebar-section-title">
              Data
            </div>
            <ul className="nav-list">
              <li className="nav-item">
                <button 
                  onClick={() => window.location.reload()}
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <div>
            <div className="header-subtitle">
              Current Course
            </div>
            <h2 id="course">{courseName || "Loading..."}</h2>
          </div>
        </header>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "var(--txt-muted)",
            }}
          >
            <p style={{ fontSize: "18px" }}>Loading course data...</p>
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
              onClick={() => router.push("/courses")}
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
    </div>
  );
}
