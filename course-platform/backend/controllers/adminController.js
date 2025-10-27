const bcrypt = require('bcryptjs');
const db = require('../config/database');

// User Management
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
  db.all(sql, [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
};

exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  
  db.run(sql, [name, email, hashedPassword, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.status(201).json({ message: 'User created successfully', id: this.lastID });
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const sql = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
  db.run(sql, [name, email, role, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
};

// Filiere Management
exports.getAllFilieres = (req, res) => {
  const sql = 'SELECT * FROM filieres ORDER BY name';
  db.all(sql, [], (err, filieres) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(filieres);
  });
};

exports.createFiliere = (req, res) => {
  const { name, code, description } = req.body;
  const sql = 'INSERT INTO filieres (name, code, description) VALUES (?, ?, ?)';
  
  db.run(sql, [name, code, description], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating filiere' });
    }
    res.status(201).json({ message: 'Filiere created successfully', id: this.lastID });
  });
};

exports.updateFiliere = (req, res) => {
  const { id } = req.params;
  const { name, code, description } = req.body;
  const sql = 'UPDATE filieres SET name = ?, code = ?, description = ? WHERE id = ?';
  
  db.run(sql, [name, code, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating filiere' });
    }
    res.json({ message: 'Filiere updated successfully' });
  });
};

exports.deleteFiliere = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM filieres WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting filiere' });
    }
    res.json({ message: 'Filiere deleted successfully' });
  });
};

// Group Management
exports.getAllGroups = (req, res) => {
  const sql = `
    SELECT g.*, f.name as filiere_name 
    FROM groups g 
    LEFT JOIN filieres f ON g.filiere_id = f.id 
    ORDER BY g.name
  `;
  db.all(sql, [], (err, groups) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(groups);
  });
};

exports.createGroup = (req, res) => {
  const { name, filiere_id } = req.body;
  const sql = 'INSERT INTO groups (name, filiere_id) VALUES (?, ?)';
  
  db.run(sql, [name, filiere_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating group' });
    }
    res.status(201).json({ message: 'Group created successfully', id: this.lastID });
  });
};

exports.updateGroup = (req, res) => {
  const { id } = req.params;
  const { name, filiere_id } = req.body;
  const sql = 'UPDATE groups SET name = ?, filiere_id = ? WHERE id = ?';
  
  db.run(sql, [name, filiere_id, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating group' });
    }
    res.json({ message: 'Group updated successfully' });
  });
};

exports.deleteGroup = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM groups WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting group' });
    }
    res.json({ message: 'Group deleted successfully' });
  });
};

// Module Management
exports.getAllModules = (req, res) => {
  const sql = `
    SELECT m.*, f.name as filiere_name 
    FROM modules m 
    LEFT JOIN filieres f ON m.filiere_id = f.id 
    ORDER BY m.name
  `;
  db.all(sql, [], (err, modules) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(modules);
  });
};

exports.createModule = (req, res) => {
  const { name, code, filiere_id, description } = req.body;
  const sql = 'INSERT INTO modules (name, code, filiere_id, description) VALUES (?, ?, ?, ?)';
  
  db.run(sql, [name, code, filiere_id, description], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating module' });
    }
    res.status(201).json({ message: 'Module created successfully', id: this.lastID });
  });
};

exports.updateModule = (req, res) => {
  const { id } = req.params;
  const { name, code, filiere_id, description } = req.body;
  const sql = 'UPDATE modules SET name = ?, code = ?, filiere_id = ?, description = ? WHERE id = ?';
  
  db.run(sql, [name, code, filiere_id, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating module' });
    }
    res.json({ message: 'Module updated successfully' });
  });
};

exports.deleteModule = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM modules WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting module' });
    }
    res.json({ message: 'Module deleted successfully' });
  });
};

// Professor-Module Assignment
exports.assignProfessorToModule = (req, res) => {
  const { professor_id, module_id, group_id } = req.body;
  const sql = 'INSERT INTO professor_modules (professor_id, module_id, group_id) VALUES (?, ?, ?)';
  
  db.run(sql, [professor_id, module_id, group_id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Assignment already exists' });
      }
      return res.status(500).json({ error: 'Error creating assignment' });
    }
    res.status(201).json({ message: 'Professor assigned successfully', id: this.lastID });
  });
};

exports.getProfessorAssignments = (req, res) => {
  const sql = `
    SELECT pm.*, u.name as professor_name, m.name as module_name, g.name as group_name
    FROM professor_modules pm
    LEFT JOIN users u ON pm.professor_id = u.id
    LEFT JOIN modules m ON pm.module_id = m.id
    LEFT JOIN groups g ON pm.group_id = g.id
    ORDER BY u.name, m.name
  `;
  db.all(sql, [], (err, assignments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(assignments);
  });
};

exports.deleteAssignment = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM professor_modules WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting assignment' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  });
};

// View all courses
exports.getAllCourses = (req, res) => {
  const sql = `
    SELECT c.*, u.name as professor_name, m.name as module_name, g.name as group_name
    FROM courses c
    LEFT JOIN users u ON c.professor_id = u.id
    LEFT JOIN modules m ON c.module_id = m.id
    LEFT JOIN groups g ON c.group_id = g.id
    ORDER BY c.created_at DESC
  `;
  db.all(sql, [], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
};
