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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            <h2 id="course">{courseName}</h2>
          </div>
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
