import React, { useState, useEffect } from 'react';
import professorService from '../../services/professorService';

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, filterType, filterStatus, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await professorService.getMyCourses();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(course => course.type === filterType);
    }

    if (filterStatus) {
      filtered = filtered.filter(course => course.status === filterStatus);
    }

    setFilteredCourses(filtered);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await professorService.deleteCourse(courseId);
      setSuccess('Course deleted successfully');
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      type: course.type,
      video_link: course.video_link || '',
      status: course.status || 'draft'
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('title', editingCourse.title);
      formData.append('description', editingCourse.description);
      formData.append('type', editingCourse.type);
      formData.append('video_link', editingCourse.video_link);
      formData.append('status', editingCourse.status);

      await professorService.updateCourse(editingCourse.id, formData);
      setSuccess('Course updated successfully');
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.error || 'Failed to update course');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Courses</h1>
        <p>Manage all your uploaded courses</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by title, module, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="cours">Cours</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              {courses.length === 0
                ? 'No courses uploaded yet. Start by uploading your first course!'
                : 'No courses match your search criteria.'}
            </p>
            {courses.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.location.href = '/professor/upload'}
                >
                  Upload Course
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
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
                  <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {course.status}
                  </span>
                </div>
                <h4>{course.title}</h4>
              </div>

              <div className="course-meta">
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Module:</strong> {course.module_name}
                </p>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Group:</strong> {course.group_name}
                </p>
                {course.description && (
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>
                    {course.description.length > 100
                      ? `${course.description.substring(0, 100)}...`
                      : course.description}
                  </p>
                )}
                {course.file_name && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                    File: {course.file_name}
                  </p>
                )}
                {course.video_link && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                    Video Link: {course.video_link.substring(0, 30)}...
                  </p>
                )}
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                  Uploaded: {formatDate(course.created_at)}
                </p>
              </div>

              <div className="course-actions">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(course)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(course.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCourse && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Course</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={editingCourse.type}
                  onChange={(e) => setEditingCourse({ ...editingCourse, type: e.target.value })}
                  required
                >
                  <option value="cours">Cours</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {editingCourse.type === 'video' && (
                <div className="form-group">
                  <label>Video Link</label>
                  <input
                    type="url"
                    value={editingCourse.video_link}
                    onChange={(e) => setEditingCourse({ ...editingCourse, video_link: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={editingCourse.status}
                  onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  Update Course
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
                {courses.length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Total Courses</p>
            </div>
            <div>
              <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
                {courses.filter(c => c.status === 'published').length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Published</p>
            </div>
            <div>
              <h3 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>
                {courses.filter(c => c.status === 'draft').length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Drafts</p>
            </div>
            <div>
              <h3 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>
                {courses.filter(c => c.type === 'video').length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
