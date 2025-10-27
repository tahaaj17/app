import React, { useState } from 'react';
import studentService from '../../services/studentService';

const SearchCourses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      
      const response = await studentService.searchCourses(searchQuery);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search courses');
      console.error('Error searching courses:', err);
    } finally {
      setLoading(false);
    }
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

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}>{part}</mark> : 
        part
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Search Courses</h1>
        <p>Search for courses by title, description, or professor name</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Search Section */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Enter course title, description, or professor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
            <strong>Tips:</strong> Search by course title, keywords in description, or professor name
          </div>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="loading">Searching courses...</div>
      ) : hasSearched ? (
        <>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            Found {courses.length} course{courses.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
          
          {courses.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '0.5rem' }}>
                  No courses found
                </p>
                <p style={{ color: '#999' }}>
                  Try different keywords or check your spelling
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-2">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <div style={{ marginBottom: '1rem' }}>
                    <h4>{highlightText(course.title, searchQuery)}</h4>
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
                    {course.description ? 
                      highlightText(course.description, searchQuery) : 
                      'No description available'
                    }
                  </p>
                  
                  <div className="course-meta">
                    <div>
                      <strong>Professor:</strong> {
                        course.professor?.name ? 
                          highlightText(course.professor.name, searchQuery) : 
                          'N/A'
                      }
                    </div>
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
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#999' }}>
              Enter a search term to find courses
            </p>
          </div>
        </div>
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

export default SearchCourses;
