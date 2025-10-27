import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const AssignmentsManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    professor: '',
    module: '',
    group: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, usersRes, modulesRes, groupsRes] = await Promise.all([
        adminService.getAssignments(),
        adminService.getUsers(),
        adminService.getModules(),
        adminService.getGroups()
      ]);
      
      setAssignments(assignmentsRes.data);
      // Filter only professors
      setProfessors(usersRes.data.filter(user => user.role === 'professor'));
      setModules(modulesRes.data);
      setGroups(groupsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      professor: '',
      module: '',
      group: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      professor: '',
      module: '',
      group: ''
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

    if (!formData.professor || !formData.module || !formData.group) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await adminService.createAssignment(formData);
      setSuccess('Assignment created successfully');
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await adminService.deleteAssignment(assignmentId);
        setSuccess('Assignment deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete assignment');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assignments Management</h1>
        <p>Assign professors to modules and groups</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>All Assignments</h3>
          <button onClick={handleOpenModal} className="btn btn-primary btn-sm">
            Create New Assignment
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Professor</th>
                <th>Module</th>
                <th>Group</th>
                <th>Filiere</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No assignments found</td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>
                      <strong>{assignment.professor?.name || 'N/A'}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{assignment.professor?.email}</small>
                    </td>
                    <td>
                      <strong>{assignment.module?.name || 'N/A'}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{assignment.module?.code}</small>
                    </td>
                    <td>{assignment.group?.name || 'N/A'}</td>
                    <td>{assignment.group?.filiere?.name || 'N/A'}</td>
                    <td>{new Date(assignment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(assignment._id)}
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
              <h3>Create New Assignment</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Professor</label>
                <select
                  name="professor"
                  value={formData.professor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a professor</option>
                  {professors.map((professor) => (
                    <option key={professor._id} value={professor._id}>
                      {professor.name} ({professor.email})
                    </option>
                  ))}
                </select>
                {professors.length === 0 && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    No professors available. Please create professor users first.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Module</label>
                <select
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module.code} - {module.name} ({module.filiere?.name})
                    </option>
                  ))}
                </select>
                {modules.length === 0 && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    No modules available. Please create modules first.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Group</label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} - {group.filiere?.name} (Year {group.year})
                    </option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
                    No groups available. Please create groups first.
                  </small>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={professors.length === 0 || modules.length === 0 || groups.length === 0}
              >
                Create Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsManagement;
