import React, { useState, useEffect } from 'react';
import professorService from '../../services/professorService';

const ProfessorOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    modulesCount: 0,
    coursesCount: 0,
    publishedCount: 0,
    draftCount: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch modules and courses
      const [modulesRes, coursesRes] = await Promise.all([
        professorService.getMyModules(),
        professorService.getMyCourses()
      ]);

      const modules = modulesRes.data;
      const courses = coursesRes.data;

      // Calculate stats
      const publishedCourses = courses.filter(c => c.status === 'published');
      const draftCourses = courses.filter(c => c.status === 'draft');

      setStats({
        modulesCount: modules.length,
        coursesCount: courses.length,
        publishedCount: publishedCourses.length,
        draftCount: draftCourses.length
      });

      // Get recent courses (last 5)
      setRecentCourses(courses.slice(0, 5));

    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError(err.response?.data?.error || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      cours: '#667eea',
      td: '#28a745',
      tp: '#ffc107',
      video: '#dc3545'
    };
    return colors[type] || '#6c757d';
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
        <h1>Professor Overview</h1>
        <p>Welcome to your dashboard</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <h3>{stats.modulesCount}</h3>
          <p>Assigned Modules</p>
        </div>
        <div className="stats-card">
          <h3>{stats.coursesCount}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stats-card">
          <h3>{stats.publishedCount}</h3>
          <p>Published Courses</p>
        </div>
        <div className="stats-card">
          <h3>{stats.draftCount}</h3>
          <p>Draft Courses</p>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Courses</h3>
        </div>
        <div className="card-body">
          {recentCourses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              No courses uploaded yet. Start by uploading your first course!
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Module</th>
                    <th>Group</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCourses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.title}</strong>
                      </td>
                      <td>{course.module_name}</td>
                      <td>{course.group_name}</td>
                      <td>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getTypeColor(course.type),
                            textTransform: 'uppercase'
                          }}
                        >
                          {course.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td>{formatDate(course.created_at)}</td>
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
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => window.location.href = '/professor/upload'}
            >
              Upload New Course
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => window.location.href = '/professor/courses'}
            >
              View All Courses
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => window.location.href = '/professor/modules'}
            >
              View My Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorOverview;
