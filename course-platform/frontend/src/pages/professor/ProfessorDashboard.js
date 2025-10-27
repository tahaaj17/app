import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfessorOverview from './ProfessorOverview';
import MyModules from './MyModules';
import MyCourses from './MyCourses';
import UploadCourse from './UploadCourse';

const ProfessorDashboard = () => {
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
          <h2>Professor Panel</h2>
          <p>{user?.name}</p>
        </div>
        
        <ul className="sidebar-nav">
          <li><Link to="/professor">Overview</Link></li>
          <li><Link to="/professor/modules">My Modules</Link></li>
          <li><Link to="/professor/courses">My Courses</Link></li>
          <li><Link to="/professor/upload">Upload Course</Link></li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<ProfessorOverview />} />
          <Route path="/modules" element={<MyModules />} />
          <Route path="/courses" element={<MyCourses />} />
          <Route path="/upload" element={<UploadCourse />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
