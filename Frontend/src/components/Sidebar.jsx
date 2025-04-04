import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const isCourseDetailsPage = location.pathname.startsWith('/course/') || location.pathname.startsWith('/lesson/');

  const navItems = [
    // { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📚' },
    { path: '/all-lessons', label: 'All Lessons', icon: '📖' },
    { path: '/user-lessons', label: 'My Lessons', icon: '📓' },
    { path: '/assessment', label: 'Assessment', icon: '📝' },
  ]; 

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isCourseDetailsPage ? 'collapsible' : ''}`}>
      <div className="sidebar-logo">
        <h2>NovaLearn</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <i>{item.icon}</i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 