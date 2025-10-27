import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [filters, setFilters] = useState({
    filiere: '',
    module: '',
    group: '',
    type: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFilieres();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (filters.filiere) {
      fetchModulesByFiliere(filters.filiere);
      fetchGroupsByFiliere(filters.filiere);
    } else {
      setModules([]);
      setGroups([]);
      setFilters(prev => ({ ...prev, module: '', group: '' }));
    }
  }, [filters.filiere]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchFilieres = async () => {
    try {
      const response = await studentService.getFilieres();
      setFilieres(response.data);
    } catch (err) {
      console.error('Error fetching filieres:', err);
    }
  };

  const fetchModulesByFiliere = async (filiereId) => {
    try {
      const response = await studentService.getModulesByFiliere(filiereId);
      setModules(response.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const fetchGroupsByFiliere = async (filiereId) => {
    try {
      const response = await studentService.getGroupsByFiliere(filiereId);
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.filiere) params.filiere = filters.filiere;
      if (filters.module) params.module = filters.module;
      if (filters.group) params.group = filters.group;
      if (filters.type) params.type = filters.type;
      
      const response = await studentService.getCourses(params);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      filiere: '',
      module: '',
      group: '',
      type: ''
    });
  };

  const handleViewDetails = async (courseId) => {
    try {
      const response = await studentService.getCourseDetails(courseId);
      setSelectedCourse(response.data);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    }
  };

  const handleDownload = async (courseId, courseTitle) => {
    try {
      setSuccess('');
      setError('');
      
      const response = await studentService.downloadCourse(courseId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      
      // Get filename from content-disposition header or use default
      let filename = courseTitle + '.pdf';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccess('Course downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Browse Courses</h1>
        <p>Filter and explore available courses</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Filters Section */}
      <div className="card">
        <div className="card-header">
          <h3>Filters</h3>
          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            Reset Filters
          </button>
        </div>
        <div className="card-body">
          <div className="filters">
            <div className="filter-group">
              <label>Filiere</label>
              <select 
                name="filiere" 
                value={filters.filiere} 
                onChange={handleFilterChange}
              >
                <option value="">All Filieres</option>
                {filieres.map(filiere => (
                  <option key={filiere._id} value={filiere._id}>
                    {filiere.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Module</label>
              <select 
                name="module" 
                value={filters.module} 
                onChange={handleFilterChange}
                disabled={!filters.filiere}
              >
                <option value="">All Modules</option>
                {modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Group</label>
              <select 
                name="group" 
                value={filters.group} 
                onChange={handleFilterChange}
                disabled={!filters.filiere}
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="cours">Cours</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="examen">Examen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            Found {courses.length} course{courses.length !== 1 ? 's' : ''}
          </div>
          
          {courses.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#999' }}>
                  No courses found matching your filters
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-2">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <div style={{ marginBottom: '1rem' }}>
                    <h4>{course.title}</h4>
                    <span className={`badge ${
                      course.type === 'cours' ? 'badge-info' :
                      course.type === 'td' ? 'badge-success' :
                      course.type === 'tp' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {course.type?.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ 
                    color: '#666', 
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {course.description || 'No description available'}
                  </p>
                  
                  <div className="course-meta">
                    <div><strong>Professor:</strong> {course.professor?.name || 'N/A'}</div>
                    <div><strong>Module:</strong> {course.module?.name || 'N/A'}</div>
                    <div><strong>Group:</strong> {course.group?.name || 'N/A'}</div>
                    <div><strong>Filiere:</strong> {course.filiere?.name || 'N/A'}</div>
                    <div><strong>Added:</strong> {formatDate(course.createdAt)}</div>
                  </div>
                  
                  <div className="course-actions">
                    <button 
                      onClick={() => handleDownload(course._id, course.title)}
                      className="btn btn-primary btn-sm"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleViewDetails(course._id)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCourse.title}</h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <span className={`badge ${
                  selectedCourse.type === 'cours' ? 'badge-info' :
                  selectedCourse.type === 'td' ? 'badge-success' :
                  selectedCourse.type === 'tp' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {selectedCourse.type?.toUpperCase()}
                </span>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Description</h4>
                <p style={{ color: '#666' }}>
                  {selectedCourse.description || 'No description available'}
                </p>
              </div>
              
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong>Professor:</strong> {selectedCourse.professor?.name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedCourse.professor?.email || 'N/A'}
                </div>
                <div>
                  <strong>Module:</strong> {selectedCourse.module?.name || 'N/A'}
                </div>
                <div>
                  <strong>Group:</strong> {selectedCourse.group?.name || 'N/A'}
                </div>
                <div>
                  <strong>Filiere:</strong> {selectedCourse.filiere?.name || 'N/A'}
                </div>
                <div>
                  <strong>File:</strong> {selectedCourse.file?.originalName || 'N/A'}
                </div>
                <div>
                  <strong>Date Added:</strong> {formatDate(selectedCourse.createdAt)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleDownload(selectedCourse._id, selectedCourse.title)}
                  className="btn btn-primary btn-sm"
                >
                  Download Course
                </button>
                <button 
                  onClick={closeModal}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
