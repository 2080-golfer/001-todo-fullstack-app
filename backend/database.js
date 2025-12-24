const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'none',
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add new columns to existing tables (migration)
  db.run(`ALTER TABLE todos ADD COLUMN order_index INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding order_index column:', err.message);
    }
  });

  db.run(`ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'none'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding priority column:', err.message);
    }
  });

  db.run(`ALTER TABLE todos ADD COLUMN due_date TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding due_date column:', err.message);
    }
  });
});

module.exports = db;
