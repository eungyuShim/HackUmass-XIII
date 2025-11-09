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

  const courses: Course[] = [
    { id: 'C-160', name: 'MICROBIO 160', term: 'Fall 2025' },
    { id: 'C-514', name: 'CS 514 — Algorithms', term: 'Fall 2025' },
  ];

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
            <li className="nav-item">
              <a href="#" className="nav-link">
                Settings
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

        <section className="grid" id="list">
          {courses.map((course) => (
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
          ))}
        </section>
      </main>
    </div>
  );
}
