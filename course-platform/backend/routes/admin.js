const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Filiere management
router.get('/filieres', adminController.getAllFilieres);
router.post('/filieres', adminController.createFiliere);
router.put('/filieres/:id', adminController.updateFiliere);
router.delete('/filieres/:id', adminController.deleteFiliere);

// Group management
router.get('/groups', adminController.getAllGroups);
router.post('/groups', adminController.createGroup);
router.put('/groups/:id', adminController.updateGroup);
router.delete('/groups/:id', adminController.deleteGroup);

// Module management
router.get('/modules', adminController.getAllModules);
router.post('/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// Professor-Module assignments
router.get('/assignments', adminController.getProfessorAssignments);
router.post('/assignments', adminController.assignProfessorToModule);
router.delete('/assignments/:id', adminController.deleteAssignment);

// View all courses
router.get('/courses', adminController.getAllCourses);

module.exports = router;
