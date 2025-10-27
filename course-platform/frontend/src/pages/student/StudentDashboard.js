import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentOverview from './StudentOverview';
import BrowseCourses from './BrowseCourses';
import SearchCourses from './SearchCourses';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Student Portal</h2>
          <p>{user?.name}</p>
        </div>
        
        <ul className="sidebar-nav">
          <li><Link to="/student">Overview</Link></li>
          <li><Link to="/student/browse">Browse Courses</Link></li>
          <li><Link to="/student/search">Search Courses</Link></li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<StudentOverview />} />
          <Route path="/browse" element={<BrowseCourses />} />
          <Route path="/search" element={<SearchCourses />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
