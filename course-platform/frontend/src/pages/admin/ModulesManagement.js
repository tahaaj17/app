import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const ModulesManagement = () => {
  const [modules, setModules] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    filiere: '',
    semester: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, filieresRes] = await Promise.all([
        adminService.getModules(),
        adminService.getFilieres()
      ]);
      setModules(modulesRes.data);
      setFilieres(filieresRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        code: module.code,
        description: module.description || '',
        filiere: module.filiere?._id || '',
        semester: module.semester
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        filiere: '',
        semester: 1
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      filiere: '',
      semester: 1
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.filiere) {
      setError('Please select a filiere');
      return;
    }

    try {
      if (editingModule) {
        await adminService.updateModule(editingModule._id, formData);
        setSuccess('Module updated successfully');
      } else {
        await adminService.createModule(formData);
        setSuccess('Module created successfully');
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (moduleId, moduleName) => {
    if (window.confirm(`Are you sure you want to delete module "${moduleName}"?`)) {
      try {
        await adminService.deleteModule(moduleId);
        setSuccess('Module deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete module');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading modules...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Modules Management</h1>
        <p>Manage all course modules</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Modules</h3>
          <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
            Add New Module
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Filiere</th>
                <th>Semester</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No modules found</td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr key={module._id}>
                    <td><strong>{module.code}</strong></td>
                    <td>{module.name}</td>
                    <td>{module.filiere?.name || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">Semester {module.semester}</span>
                    </td>
                    <td>{module.description || 'No description'}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(module)}
                        className="btn btn-warning btn-sm"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module._id, module.name)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingModule ? 'Edit Module' : 'Add New Module'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Module Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., CS101, MATH201"
                  required
                />
              </div>

              <div className="form-group">
                <label>Module Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>

              <div className="form-group">
                <label>Filiere</label>
                <select
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a filiere</option>
                  {filieres.map((filiere) => (
                    <option key={filiere._id} value={filiere._id}>
                      {filiere.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the module"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingModule ? 'Update Module' : 'Create Module'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesManagement;
