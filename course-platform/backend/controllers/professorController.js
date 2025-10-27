const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get professor's assigned modules
exports.getMyModules = (req, res) => {
  const sql = `
    SELECT pm.*, m.name as module_name, m.code as module_code, 
           g.name as group_name, f.name as filiere_name
    FROM professor_modules pm
    LEFT JOIN modules m ON pm.module_id = m.id
    LEFT JOIN groups g ON pm.group_id = g.id
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE pm.professor_id = ?
    ORDER BY m.name, g.name
  `;
  
  db.all(sql, [req.user.id], (err, modules) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(modules);
  });
};

// Get professor's courses
exports.getMyCourses = (req, res) => {
  const sql = `
    SELECT c.*, m.name as module_name, g.name as group_name
    FROM courses c
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    WHERE c.professor_id = ?
    ORDER BY c.created_at DESC
  `;
  
  db.all(sql, [req.user.id], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
};

// Upload course
exports.uploadCourse = (req, res) => {
  const { title, description, type, module_id, group_id, video_link } = req.body;
  const professor_id = req.user.id;

  // Verify professor is assigned to this module and group
  const checkSql = 'SELECT * FROM professor_modules WHERE professor_id = ? AND module_id = ? AND group_id = ?';
  
  db.get(checkSql, [professor_id, module_id, group_id], (err, assignment) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!assignment) {
      return res.status(403).json({ error: 'You are not assigned to this module and group' });
    }

    let file_path = null;
    let file_name = null;
    let file_type = null;

    if (req.file) {
      file_path = req.file.path;
      file_name = req.file.originalname;
      file_type = req.file.mimetype;
    }

    const sql = `
      INSERT INTO courses (title, description, type, file_path, file_name, file_type, 
                          video_link, professor_id, module_id, group_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [title, description, type, file_path, file_name, file_type, 
                 video_link, professor_id, module_id, group_id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error uploading course' });
      }
      res.status(201).json({ 
        message: 'Course uploaded successfully', 
        id: this.lastID 
      });
    });
  });
};

// Update course
exports.updateCourse = (req, res) => {
  const { id } = req.params;
  const { title, description, type, video_link, status } = req.body;
  const professor_id = req.user.id;

  // Check if course belongs to professor
  const checkSql = 'SELECT * FROM courses WHERE id = ? AND professor_id = ?';
  
  db.get(checkSql, [id, professor_id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }

    let file_path = course.file_path;
    let file_name = course.file_name;
    let file_type = course.file_type;

    if (req.file) {
      // Delete old file if exists
      if (course.file_path && fs.existsSync(course.file_path)) {
        fs.unlinkSync(course.file_path);
      }
      
      file_path = req.file.path;
      file_name = req.file.originalname;
      file_type = req.file.mimetype;
    }

    const sql = `
      UPDATE courses 
      SET title = ?, description = ?, type = ?, file_path = ?, file_name = ?, 
          file_type = ?, video_link = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND professor_id = ?
    `;

    db.run(sql, [title, description, type, file_path, file_name, file_type, 
                 video_link, status, id, professor_id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating course' });
      }
      res.json({ message: 'Course updated successfully' });
    });
  });
};

// Delete course
exports.deleteCourse = (req, res) => {
  const { id } = req.params;
  const professor_id = req.user.id;

  // Get course to delete file
  const getSql = 'SELECT * FROM courses WHERE id = ? AND professor_id = ?';
  
  db.get(getSql, [id, professor_id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }

    // Delete file if exists
    if (course.file_path && fs.existsSync(course.file_path)) {
      fs.unlinkSync(course.file_path);
    }

    const deleteSql = 'DELETE FROM courses WHERE id = ? AND professor_id = ?';
    db.run(deleteSql, [id, professor_id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting course' });
      }
      res.json({ message: 'Course deleted successfully' });
    });
  });
};

// Get course details
exports.getCourseDetails = (req, res) => {
  const { id } = req.params;
  const professor_id = req.user.id;

  const sql = `
    SELECT c.*, m.name as module_name, g.name as group_name
    FROM courses c
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    WHERE c.id = ? AND c.professor_id = ?
  `;

  db.get(sql, [id, professor_id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  });
};
