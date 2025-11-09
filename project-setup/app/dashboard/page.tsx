'use client';

import { useState, useEffect } from 'react';
import { useCourseName } from '@/hooks/useStorage';
import { useFirstVisit } from '@/hooks/useAppInit';
import CategoryList from '@/components/dashboard/CategoryList';
import ProgressBar from '@/components/dashboard/ProgressBar';
import GradeStrategy from '@/components/dashboard/GradeStrategy';
import SetupModal from '@/components/setup/SetupModal';
import '@/components/shared/global.css';
import '@/components/dashboard/dashboard.css';
import '@/components/setup/setup.css';

export default function DashboardPage() {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const courseName = useCourseName();
  const isFirstVisit = useFirstVisit();
  
  // Open setup modal on first visit
  useEffect(() => {
    if (isFirstVisit) {
      setIsSetupModalOpen(true);
    }
  }, [isFirstVisit]);
  
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
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)', marginBottom: '4px' }}>
              Current Course
            </div>
            <h2 id="course">{courseName}</h2>
          </div>
          <button 
            className="upload-btn" 
            onClick={() => setIsSetupModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Course Setup
          </button>
        </header>

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
      </div>
    </div>
  );
}
