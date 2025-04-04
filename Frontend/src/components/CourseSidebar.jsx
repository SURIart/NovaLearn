import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const CourseSidebar = ({ courseId }) => {
  const location = useLocation();

  const courseNavItems = [
    { path: `/course/${courseId}/video`, label: '🎥 Video' },
    { path: `/course/${courseId}/doubt`, label: '❓ Doubt' },
    { path: `/course/${courseId}/whiteboard`, label: '✏️ Whiteboard' },
    { path: `/course/${courseId}/assessment`, label: '📝 Assessment' },
    { path: `/course/${courseId}/mindmap`, label: '🗺️ Mindmap' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Course Navigation</h2>
      </div>
      <nav className="sidebar-nav">
        {courseNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default CourseSidebar; 