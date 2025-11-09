'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/shared/global.css';
import '@/components/courses/course.css';

interface Course {
  id: string;
  name: string;
  term: string;
}

export default function CoursesPage() {
  const [hasToken, setHasToken] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenPresent = sessionStorage.getItem('canvas_token_present') === '1';
      setHasToken(tokenPresent);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      router.push('/');
    }
  };

  // TODO: Fetch courses from Canvas API
  const courses: Course[] = [];

  const handleViewCourse = (course: Course) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_course_id', course.id);
      sessionStorage.setItem('current_course_name', course.name);
      router.push('/dashboard');
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h1>Grade<br/>Planner</h1>
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
            <div className="sidebar-section-title">
              Account
            </div>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <div>
            <h2>My Courses</h2>
            <div className="header-subtitle">Select a course to get started</div>
          </div>
          <div className="pill" id="tok">
            {hasToken ? 'Token detected' : 'Demo mode (no token)'}
          </div>
        </header>

        <div className="grid-wrapper">
          <section className="grid" id="list">
            {courses.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No courses found</p>
                <p className="empty-state-message">
                  {hasToken 
                    ? 'No courses are available for this account.' 
                    : 'Please enter your Canvas access token to view your courses.'}
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="card">
                  <h3>{course.name}</h3>
                  <div className="card-term">{course.term}</div>
                  <div className="card-pill">Course ID: {course.id}</div>
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
    </div>
  );
}
