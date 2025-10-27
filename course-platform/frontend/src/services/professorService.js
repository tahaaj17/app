import api from './api';

const professorService = {
  getMyModules: () => api.get('/professor/modules'),
  getMyCourses: () => api.get('/professor/courses'),
  getCourseDetails: (id) => api.get(`/professor/courses/${id}`),
  
  uploadCourse: (formData) => api.post('/professor/courses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  updateCourse: (id, formData) => api.put(`/professor/courses/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  deleteCourse: (id) => api.delete(`/professor/courses/${id}`),
};

export default professorService;
