import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    filiere: '',
    year: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, filieresRes] = await Promise.all([
        adminService.getGroups(),
        adminService.getFilieres()
      ]);
      setGroups(groupsRes.data);
      setFilieres(filieresRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        filiere: group.filiere?._id || '',
        year: group.year
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        filiere: '',
        year: 1
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      filiere: '',
      year: 1
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
      if (editingGroup) {
        await adminService.updateGroup(editingGroup._id, formData);
        setSuccess('Group updated successfully');
      } else {
        await adminService.createGroup(formData);
        setSuccess('Group created successfully');
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete group "${groupName}"?`)) {
      try {
        await adminService.deleteGroup(groupId);
        setSuccess('Group deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Groups Management</h1>
        <p>Manage all student groups</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Groups</h3>
          <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
            Add New Group
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Filiere</th>
                <th>Year</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No groups found</td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group._id}>
                    <td><strong>{group.name}</strong></td>
                    <td>{group.filiere?.name || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">Year {group.year}</span>
                    </td>
                    <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(group)}
                        className="btn btn-warning btn-sm"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(group._id, group.name)}
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
              <h3>{editingGroup ? 'Edit Group' : 'Add New Group'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Group A, Group 1"
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
                <label>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                {editingGroup ? 'Update Group' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
