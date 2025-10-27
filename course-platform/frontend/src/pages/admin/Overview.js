import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const Overview = () => {
  const [stats, setStats] = useState({
    users: 0,
    professors: 0,
    students: 0,
    filieres: 0,
    modules: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, filieresRes, modulesRes, coursesRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getFilieres(),
        adminService.getModules(),
        adminService.getAllCourses(),
      ]);

      const users = usersRes.data;
      setStats({
        users: users.length,
        professors: users.filter(u => u.role === 'professor').length,
        students: users.filter(u => u.role === 'student').length,
        filieres: filieresRes.data.length,
        modules: modulesRes.data.length,
        courses: coursesRes.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Course Platform Administration</p>
      </div>

      <div className="grid grid-3">
        <div className="stats-card">
          <h3>{stats.users}</h3>
          <p>Total Users</p>
        </div>
        <div className="stats-card">
          <h3>{stats.professors}</h3>
          <p>Professors</p>
        </div>
        <div className="stats-card">
          <h3>{stats.students}</h3>
          <p>Students</p>
        </div>
        <div className="stats-card">
          <h3>{stats.filieres}</h3>
          <p>Filières</p>
        </div>
        <div className="stats-card">
          <h3>{stats.modules}</h3>
          <p>Modules</p>
        </div>
        <div className="stats-card">
          <h3>{stats.courses}</h3>
          <p>Courses</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-body">
          <p>Use the sidebar to navigate through different management sections:</p>
          <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
            <li>Manage users (professors, students, admins)</li>
            <li>Create and organize filières (programs)</li>
            <li>Set up groups and modules</li>
            <li>Assign professors to modules and groups</li>
            <li>View all uploaded courses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
