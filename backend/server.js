const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5555;

app.use(cors());
app.use(express.json());

// GET all todos
app.get('/api/todos', (req, res) => {
  const { sortBy } = req.query;

  let orderClause = 'ORDER BY order_index ASC, created_at DESC';

  if (sortBy === 'priority') {
    orderClause = `ORDER BY
      CASE priority
        WHEN 'high' THEN 1
        WHEN 'mid' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END,
      order_index ASC`;
  } else if (sortBy === 'dueDate') {
    orderClause = `ORDER BY
      CASE
        WHEN due_date IS NULL THEN 1
        ELSE 0
      END,
      due_date ASC,
      order_index ASC`;
  }

  db.all(`SELECT * FROM todos ${orderClause}`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST create new todo
app.post('/api/todos', (req, res) => {
  const { text, priority = 'none', due_date = null } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Get the max order_index to add new todo at the end
  db.get('SELECT MAX(order_index) as maxOrder FROM todos', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const newOrder = (row.maxOrder || 0) + 1;

    db.run(
      'INSERT INTO todos (text, priority, due_date, order_index) VALUES (?, ?, ?, ?)',
      [text, priority, due_date, newOrder],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json(row);
        });
      }
    );
  });
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed, priority, due_date, order_index } = req.body;

  let query = 'UPDATE todos SET updated_at = CURRENT_TIMESTAMP';
  const params = [];

  if (text !== undefined) {
    query += ', text = ?';
    params.push(text);
  }

  if (completed !== undefined) {
    query += ', completed = ?';
    params.push(completed ? 1 : 0);
  }

  if (priority !== undefined) {
    query += ', priority = ?';
    params.push(priority);
  }

  if (due_date !== undefined) {
    query += ', due_date = ?';
    params.push(due_date);
  }

  if (order_index !== undefined) {
    query += ', order_index = ?';
    params.push(order_index);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

// POST reorder todos
app.post('/api/todos/reorder', (req, res) => {
  const { todos } = req.body;

  if (!todos || !Array.isArray(todos)) {
    return res.status(400).json({ error: 'Todos array is required' });
  }

  const updates = todos.map((todo, index) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE todos SET order_index = ? WHERE id = ?',
        [index, todo.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(updates)
    .then(() => {
      res.json({ message: 'Todos reordered successfully' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
