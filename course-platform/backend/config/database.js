const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'professor', 'student')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Filieres (Programs) table
    db.run(`
      CREATE TABLE IF NOT EXISTS filieres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Groups table
    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        filiere_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE
      )
    `);

    // Modules table
    db.run(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        filiere_id INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE
      )
    `);

    // Professor-Module assignment table
    db.run(`
      CREATE TABLE IF NOT EXISTS professor_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professor_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        UNIQUE(professor_id, module_id, group_id)
      )
    `);

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('cours', 'td', 'tp', 'video')),
        file_path TEXT,
        file_name TEXT,
        file_type TEXT,
        video_link TEXT,
        professor_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      )
    `);

    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT OR IGNORE INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@course-platform.com', ?, 'admin')
    `, [hashedPassword]);

    console.log('Database initialized successfully');
  });
}

module.exports = db;
