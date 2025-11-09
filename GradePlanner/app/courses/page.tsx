"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseCardSkeleton } from "@/components/shared/Skeleton";
import Toast from "@/components/shared/Toast";
import "@/components/shared/global.css";
import "@/components/courses/course.css";

interface Course {
  id: string;
  name: string;
  courseCode: string;
  term: string;
  color: string;
}

export default function CoursesPage() {
  const [hasToken, setHasToken] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      if (typeof window === "undefined") return;

      const token = sessionStorage.getItem("canvas_token");
      const baseUrl = sessionStorage.getItem("canvas_base_url");

      if (!token || !baseUrl) {
        setHasToken(false);
        setLoading(false);
        return;
      }

      setHasToken(true);
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/canvas/courses", {
          headers: {
            "x-canvas-token": token,
            "x-canvas-base-url": baseUrl,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch courses");
        }

        setCourses(data.courses || []);
        if (data.courses && data.courses.length > 0) {
          setToast({
            message: `Loaded ${data.courses.length} course(s)`,
            type: "success",
          });
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load courses";
        setError(errorMessage);
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      router.push("/");
    }
  };

  const handleViewCourse = (course: Course) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_course_id", course.id);
      sessionStorage.setItem("current_course_name", course.name);
      router.push("/dashboard");
    }
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
              <a href="/courses" className="nav-link active">
                My Courses
              </a>
            </li>
          </ul>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
            <ul className="nav-list">
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link nav-link-button"
                >
                  Logout
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
      <main className="main-content">
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
            <h2>My Courses</h2>
            <div className="header-subtitle">
              Select a course to get started
            </div>
          </div>
          <div className="pill" id="tok">
            {hasToken ? "✓ Token detected" : "Demo mode (no token)"}
          </div>
        </header>

        <div className="grid-wrapper">
          <section className="grid" id="list">
            {loading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : error ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem 2rem",
                  color: "#ef4444",
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                  Error loading courses
                </p>
                <p style={{ fontSize: "14px" }}>{error}</p>
                <button
                  className="btn btn--outline"
                  style={{ marginTop: "16px" }}
                  onClick={() => router.push("/")}
                >
                  Back to Login
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem 2rem",
                  color: "var(--txt-muted)",
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                  No courses found
                </p>
                <p style={{ fontSize: "14px" }}>
                  {hasToken
                    ? "No active courses are available for this account."
                    : "Please enter your Canvas access token to view your courses."}
                </p>
                {!hasToken && (
                  <button
                    className="btn btn--primary"
                    style={{ marginTop: "16px" }}
                    onClick={() => router.push("/")}
                  >
                    Enter Token
                  </button>
                )}
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="card"
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "100%",
                      backgroundColor: course.color,
                      position: "absolute",
                      left: 0,
                      top: 0,
                      borderRadius: "8px 0 0 8px",
                    }}
                  />
                  <h3>{course.name}</h3>
                  <div className="card-term">{course.courseCode}</div>
                  <div className="card-pill">Term: {course.term}</div>
                  <div
                    className="card-pill"
                    style={{ marginTop: "4px", fontSize: "12px", opacity: 0.7 }}
                  >
                    Course ID: {course.id}
                  </div>
                  <div className="row">
                    <button
                      className="btn btn--primary"
                      onClick={() => handleViewCourse(course)}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

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
