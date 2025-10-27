import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

const StudentOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all courses to calculate stats
      const response = await studentService.getCourses({});
      const courses = response.data;
      
      // Get recent courses (last 5)
      const sortedCourses = [...courses].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setStats({
        totalCourses: courses.length,
        recentCourses: sortedCourses.slice(0, 5)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load overview data');
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading overview...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's an overview of your course platform</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Section */}
      <div className="grid grid-3">
        <div className="stats-card">
          <h3>{stats.totalCourses}</h3>
          <p>Available Courses</p>
        </div>
        
        <div className="stats-card">
          <h3>{user?.filiere?.name || 'N/A'}</h3>
          <p>Your Filiere</p>
        </div>
        
        <div className="stats-card">
          <h3>{user?.group?.name || 'N/A'}</h3>
          <p>Your Group</p>
        </div>
      </div>

      {/* Recent Courses Section */}
      <div className="card">
        <div className="card-header">
          <h3>Recently Added Courses</h3>
        </div>
        <div className="card-body">
          {stats.recentCourses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              No courses available yet
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Professor</th>
                    <th>Module</th>
                    <th>Type</th>
                    <th>Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>{course.professor?.name || 'N/A'}</td>
                      <td>{course.module?.name || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          course.type === 'cours' ? 'badge-info' :
                          course.type === 'td' ? 'badge-success' :
                          course.type === 'tp' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {course.type?.toUpperCase()}
                        </span>
                      </td>
                      <td>{formatDate(course.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/student/browse" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-sm">
                Browse All Courses
              </button>
            </a>
            <a href="/student/search" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary btn-sm">
                Search Courses
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="card">
        <div className="card-header">
          <h3>Your Information</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Name:</strong> {user?.name}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Filiere:</strong> {user?.filiere?.name || 'Not assigned'}
            </div>
            <div>
              <strong>Group:</strong> {user?.group?.name || 'Not assigned'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
