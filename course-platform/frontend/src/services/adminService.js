import api from './api';

const adminService = {
  // Users
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Filieres
  getFilieres: () => api.get('/admin/filieres'),
  createFiliere: (data) => api.post('/admin/filieres', data),
  updateFiliere: (id, data) => api.put(`/admin/filieres/${id}`, data),
  deleteFiliere: (id) => api.delete(`/admin/filieres/${id}`),

  // Groups
  getGroups: () => api.get('/admin/groups'),
  createGroup: (data) => api.post('/admin/groups', data),
  updateGroup: (id, data) => api.put(`/admin/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`),

  // Modules
  getModules: () => api.get('/admin/modules'),
  createModule: (data) => api.post('/admin/modules', data),
  updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),

  // Assignments
  getAssignments: () => api.get('/admin/assignments'),
  createAssignment: (data) => api.post('/admin/assignments', data),
  deleteAssignment: (id) => api.delete(`/admin/assignments/${id}`),

  // Courses
  getAllCourses: () => api.get('/admin/courses'),
};

export default adminService;
