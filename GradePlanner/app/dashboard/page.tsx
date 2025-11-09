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
          const formattedCategories = data.categories.map((cat: any, index: number) => {
            console.log("Processing category:", cat); // Debug log
            
            return {
              id: index + 1, // Use simple incremental ID
              name: cat.name,
              weight: cat.weight || 0,
              items:
                cat.assignments?.map((assignment: any) => {
                  console.log("Processing assignment:", assignment.name, assignment); // Debug log
                  
                  return {
                    name: assignment.name,
                    score: assignment.graded ? assignment.earned : null,
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
          });

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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>
            Grade
            <br />
            Planner
          </h1>
          <p>Academic planning made easy</p>
        </div>
        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/courses" className="nav-link">
                ← Back to Courses
              </a>
            </li>
            <li className="nav-item">
              <a href="/dashboard" className="nav-link active">
                Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--txt-muted)",
                marginBottom: "4px",
              }}
            >
              Current Course
            </div>
            <h2 id="course">{courseName || "Loading..."}</h2>
          </div>
          <button
            className="upload-btn"
            onClick={() => setIsSetupModalOpen(true)}
            disabled={loading}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Syllabus Upload
          </button>
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
