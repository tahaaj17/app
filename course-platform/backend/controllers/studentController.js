const db = require('../config/database');
const path = require('path');

// Get all filieres
exports.getFilieres = (req, res) => {
  const sql = 'SELECT * FROM filieres ORDER BY name';
  db.all(sql, [], (err, filieres) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(filieres);
  });
};

// Get groups by filiere
exports.getGroupsByFiliere = (req, res) => {
  const { filiere_id } = req.params;
  const sql = 'SELECT * FROM groups WHERE filiere_id = ? ORDER BY name';
  
  db.all(sql, [filiere_id], (err, groups) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(groups);
  });
};

// Get modules by filiere
exports.getModulesByFiliere = (req, res) => {
  const { filiere_id } = req.params;
  const sql = 'SELECT * FROM modules WHERE filiere_id = ? ORDER BY name';
  
  db.all(sql, [filiere_id], (err, modules) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(modules);
  });
};

// Get all courses (with filters)
exports.getCourses = (req, res) => {
  const { filiere_id, module_id, group_id } = req.query;
  
  let sql = `
    SELECT c.*, u.name as professor_name, m.name as module_name, 
           m.code as module_code, g.name as group_name, f.name as filiere_name
    FROM courses c
    LEFT JOIN users u ON c.professor_id = u.id
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE c.status = 'published'
  `;
  
  const params = [];
  
  if (filiere_id) {
    sql += ' AND m.filiere_id = ?';
    params.push(filiere_id);
  }
  
  if (module_id) {
    sql += ' AND c.module_id = ?';
    params.push(module_id);
  }
  
  if (group_id) {
    sql += ' AND c.group_id = ?';
    params.push(group_id);
  }
  
  sql += ' ORDER BY c.created_at DESC';
  
  db.all(sql, params, (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
};

// Get course details
exports.getCourseDetails = (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT c.*, u.name as professor_name, u.email as professor_email,
           m.name as module_name, m.code as module_code, m.description as module_description,
           g.name as group_name, f.name as filiere_name
    FROM courses c
    LEFT JOIN users u ON c.professor_id = u.id
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE c.id = ? AND c.status = 'published'
  `;
  
  db.get(sql, [id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  });
};

// Download course file
exports.downloadCourse = (req, res) => {
  const { id } = req.params;
  
  const sql = 'SELECT * FROM courses WHERE id = ? AND status = "published"';
  
  db.get(sql, [id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (!course.file_path) {
      return res.status(404).json({ error: 'No file available for this course' });
    }
    
    const filePath = path.resolve(course.file_path);
    res.download(filePath, course.file_name, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error downloading file' });
      }
    });
  });
};

// Search courses
exports.searchCourses = (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const sql = `
    SELECT c.*, u.name as professor_name, m.name as module_name, 
           g.name as group_name, f.name as filiere_name
    FROM courses c
    LEFT JOIN users u ON c.professor_id = u.id
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    LEFT JOIN filieres f ON m.filiere_id = f.id
    WHERE c.status = 'published' 
    AND (c.title LIKE ? OR c.description LIKE ? OR m.name LIKE ?)
    ORDER BY c.created_at DESC
  `;
  
  const searchTerm = `%${query}%`;
  
  db.all(sql, [searchTerm, searchTerm, searchTerm], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
};
