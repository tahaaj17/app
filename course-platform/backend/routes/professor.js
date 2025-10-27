const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const professorController = require('../controllers/professorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/mpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PPT, DOCX, ZIP, and video files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Apply authentication and professor authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('professor'));

// Get professor's assigned modules
router.get('/modules', professorController.getMyModules);

// Course management
router.get('/courses', professorController.getMyCourses);
router.get('/courses/:id', professorController.getCourseDetails);
router.post('/courses', upload.single('file'), professorController.uploadCourse);
router.put('/courses/:id', upload.single('file'), professorController.updateCourse);
router.delete('/courses/:id', professorController.deleteCourse);

module.exports = router;
