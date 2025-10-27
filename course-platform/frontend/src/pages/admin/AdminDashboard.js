import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UsersManagement from './UsersManagement';
import FilieresManagement from './FilieresManagement';
import GroupsManagement from './GroupsManagement';
import ModulesManagement from './ModulesManagement';
import AssignmentsManagement from './AssignmentsManagement';
import CoursesView from './CoursesView';
import Overview from './Overview';

const AdminDashboard = () => {
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
          <h2>Admin Panel</h2>
          <p>{user?.name}</p>
        </div>
        
        <ul className="sidebar-nav">
          <li><Link to="/admin">Overview</Link></li>
          <li><Link to="/admin/users">Users</Link></li>
          <li><Link to="/admin/filieres">Filières</Link></li>
          <li><Link to="/admin/groups">Groups</Link></li>
          <li><Link to="/admin/modules">Modules</Link></li>
          <li><Link to="/admin/assignments">Assignments</Link></li>
          <li><Link to="/admin/courses">All Courses</Link></li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/filieres" element={<FilieresManagement />} />
          <Route path="/groups" element={<GroupsManagement />} />
          <Route path="/modules" element={<ModulesManagement />} />
          <Route path="/assignments" element={<AssignmentsManagement />} />
          <Route path="/courses" element={<CoursesView />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
