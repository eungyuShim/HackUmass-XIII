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
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenPresent = sessionStorage.getItem('canvas_token_present') === '1';
      setHasToken(tokenPresent);
    }
  }, []);

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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Grade<br/>Planner</h1>
          <p>Academic planning made easy</p>
        </div>
        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/courses" className="nav-link active">
                My Courses
              </a>
            </li>
            <li className="nav-item">
              <a href="/dashboard" className="nav-link">
                Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h2>My Courses</h2>
          <div className="header-subtitle">Select a course to get started</div>
          <div className="pill" id="tok">
            {hasToken ? '✓ Token detected' : 'Demo mode (no token)'}
          </div>
        </header>

        <div className="grid-wrapper">
          <section className="grid" id="list">
            {courses.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '4rem 2rem',
                color: 'var(--txt-muted)'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No courses found</p>
                <p style={{ fontSize: '14px' }}>
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
