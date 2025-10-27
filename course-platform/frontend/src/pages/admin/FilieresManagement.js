import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const FilieresManagement = () => {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFilieres();
      setFilieres(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch filieres');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (filiere = null) => {
    if (filiere) {
      setEditingFiliere(filiere);
      setFormData({
        name: filiere.name,
        description: filiere.description || ''
      });
    } else {
      setEditingFiliere(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFiliere(null);
    setFormData({
      name: '',
      description: ''
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

    try {
      if (editingFiliere) {
        await adminService.updateFiliere(editingFiliere._id, formData);
        setSuccess('Filiere updated successfully');
      } else {
        await adminService.createFiliere(formData);
        setSuccess('Filiere created successfully');
      }
      
      handleCloseModal();
      fetchFilieres();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (filiereId, filiereName) => {
    if (window.confirm(`Are you sure you want to delete filiere "${filiereName}"? This will affect all related groups and modules.`)) {
      try {
        await adminService.deleteFiliere(filiereId);
        setSuccess('Filiere deleted successfully');
        fetchFilieres();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete filiere');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading filieres...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Filieres Management</h1>
        <p>Manage all filieres (study programs)</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Filieres</h3>
          <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
            Add New Filiere
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filieres.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No filieres found</td>
                </tr>
              ) : (
                filieres.map((filiere) => (
                  <tr key={filiere._id}>
                    <td><strong>{filiere.name}</strong></td>
                    <td>{filiere.description || 'No description'}</td>
                    <td>{new Date(filiere.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(filiere)}
                        className="btn btn-warning btn-sm"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(filiere._id, filiere.name)}
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
              <h3>{editingFiliere ? 'Edit Filiere' : 'Add New Filiere'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Business Administration"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the filiere"
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
                {editingFiliere ? 'Update Filiere' : 'Create Filiere'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilieresManagement;
