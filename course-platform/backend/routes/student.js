const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply authentication and student authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('student'));

// Browse courses
router.get('/filieres', studentController.getFilieres);
router.get('/filieres/:filiere_id/groups', studentController.getGroupsByFiliere);
router.get('/filieres/:filiere_id/modules', studentController.getModulesByFiliere);
router.get('/courses', studentController.getCourses);
router.get('/courses/:id', studentController.getCourseDetails);
router.get('/courses/:id/download', studentController.downloadCourse);
router.get('/search', studentController.searchCourses);

module.exports = router;
