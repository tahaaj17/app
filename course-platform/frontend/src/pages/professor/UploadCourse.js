import React, { useState, useEffect } from 'react';
import professorService from '../../services/professorService';

const UploadCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modules, setModules] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'cours',
    module_id: '',
    group_id: '',
    video_link: '',
    status: 'draft'
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (formData.module_id) {
      updateAvailableGroups(formData.module_id);
    } else {
      setAvailableGroups([]);
      setFormData(prev => ({ ...prev, group_id: '' }));
    }
  }, [formData.module_id]);

  const fetchModules = async () => {
    try {
      const response = await professorService.getMyModules();
      setModules(response.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules. Please refresh the page.');
    }
  };

  const updateAvailableGroups = (moduleId) => {
    const moduleGroups = modules
      .filter(m => m.module_id === parseInt(moduleId))
      .map(m => ({
        group_id: m.group_id,
        group_name: m.group_name
      }));
    
    // Remove duplicates
    const uniqueGroups = moduleGroups.filter((group, index, self) =>
      index === self.findIndex(g => g.group_id === group.group_id)
    );
    
    setAvailableGroups(uniqueGroups);
  };

  const getUniqueModules = () => {
    const uniqueModulesMap = new Map();
    modules.forEach(m => {
      if (!uniqueModulesMap.has(m.module_id)) {
        uniqueModulesMap.set(m.module_id, {
          module_id: m.module_id,
          module_name: m.module_name,
          module_code: m.module_code
        });
      }
    });
    return Array.from(uniqueModulesMap.values());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setFileError('File size must be less than 50MB');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'video/mp4',
      'video/mpeg',
      'video/quicktime'
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Allowed: PDF, PPT, PPTX, DOC, DOCX, ZIP, MP4');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a course title');
      return;
    }

    if (!formData.module_id) {
      setError('Please select a module');
      return;
    }

    if (!formData.group_id) {
      setError('Please select a group');
      return;
    }

    if (formData.type === 'video' && !formData.video_link.trim() && !selectedFile) {
      setError('Please provide either a video link or upload a video file');
      return;
    }

    if (formData.type !== 'video' && !selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('type', formData.type);
      uploadData.append('module_id', formData.module_id);
      uploadData.append('group_id', formData.group_id);
      uploadData.append('video_link', formData.video_link);
      uploadData.append('status', formData.status);

      if (selectedFile) {
        uploadData.append('file', selectedFile);
      }

      await professorService.uploadCourse(uploadData);
      
      setSuccess('Course uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'cours',
        module_id: '',
        group_id: '',
        video_link: '',
        status: 'draft'
      });
      setSelectedFile(null);
      setAvailableGroups([]);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('Error uploading course:', err);
      setError(err.response?.data?.error || 'Failed to upload course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uniqueModules = getUniqueModules();

  return (
    <div>
      <div className="page-header">
        <h1>Upload Course</h1>
        <p>Upload a new course material for your students</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Algorithms - Chapter 1"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Provide a brief description of the course content..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Type */}
            <div className="form-group">
              <label>Course Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="cours">Cours (Lecture)</option>
                <option value="td">TD (Tutorial)</option>
                <option value="tp">TP (Practical Work)</option>
                <option value="video">Video</option>
              </select>
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                Select the type of course material you're uploading
              </small>
            </div>

            {/* Module */}
            <div className="form-group">
              <label>Module *</label>
              <select
                name="module_id"
                value={formData.module_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a module</option>
                {uniqueModules.map((module) => (
                  <option key={module.module_id} value={module.module_id}>
                    {module.module_name} ({module.module_code})
                  </option>
                ))}
              </select>
              {uniqueModules.length === 0 && (
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545' }}>
                  No modules assigned. Please contact the administrator.
                </small>
              )}
            </div>

            {/* Group */}
            <div className="form-group">
              <label>Group *</label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleInputChange}
                required
                disabled={!formData.module_id}
              >
                <option value="">Select a group</option>
                {availableGroups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
              {!formData.module_id && (
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                  Please select a module first
                </small>
              )}
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label>
                Upload File {formData.type !== 'video' && '*'}
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.mp4,.mpeg,.mov"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                Accepted formats: PDF, PPT, PPTX, DOC, DOCX, ZIP, MP4 (Max 50MB)
              </small>
              {fileError && (
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545' }}>
                  {fileError}
                </small>
              )}
              {selectedFile && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  color: '#155724'
                }}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Video Link (for video type) */}
            {formData.type === 'video' && (
              <div className="form-group">
                <label>Video Link (Optional)</label>
                <input
                  type="url"
                  name="video_link"
                  value={formData.video_link}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                  Provide a link to an external video (YouTube, Vimeo, etc.) or upload a video file above
                </small>
              </div>
            )}

            {/* Status */}
            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="draft">Draft (Not visible to students)</option>
                <option value="published">Published (Visible to students)</option>
              </select>
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                Draft courses can be edited before publishing
              </small>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || fileError}
              >
                {loading ? 'Uploading...' : 'Upload Course'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.location.href = '/professor/courses'}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Upload Guidelines</h3>
        </div>
        <div className="card-body">
          <ul style={{ paddingLeft: '1.5rem', color: '#666', lineHeight: '1.8' }}>
            <li>
              <strong>Course Title:</strong> Use a clear, descriptive title that helps students identify the content
            </li>
            <li>
              <strong>Description:</strong> Provide context about what students will learn from this material
            </li>
            <li>
              <strong>File Size:</strong> Maximum file size is 50MB. For larger files, consider splitting them or using compression
            </li>
            <li>
              <strong>Video Content:</strong> You can either upload a video file or provide a link to an external video platform
            </li>
            <li>
              <strong>Draft vs Published:</strong> Use "Draft" status to prepare content before making it visible to students
            </li>
            <li>
              <strong>Module & Group:</strong> Ensure you select the correct module and group - you can only upload to modules you're assigned to
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadCourse;
