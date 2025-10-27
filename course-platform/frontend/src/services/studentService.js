import api from './api';

const studentService = {
  getFilieres: () => api.get('/student/filieres'),
  getGroupsByFiliere: (filiereId) => api.get(`/student/filieres/${filiereId}/groups`),
  getModulesByFiliere: (filiereId) => api.get(`/student/filieres/${filiereId}/modules`),
  getCourses: (params) => api.get('/student/courses', { params }),
  getCourseDetails: (id) => api.get(`/student/courses/${id}`),
  downloadCourse: (id) => api.get(`/student/courses/${id}/download`, { responseType: 'blob' }),
  searchCourses: (query) => api.get('/student/search', { params: { query } }),
};

export default studentService;
