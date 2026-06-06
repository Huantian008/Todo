const fs = require('fs');
const path = require('path');
const Todo = require('../models/todo.model');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

// File-based persistent database
class Database {
  constructor() {
    this.todos = new Map();
    this._loadFromFile();
  }

  // ---- Private helpers ----

  _ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  _loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          for (const item of items) {
            // Reconstruct Todo instance so methods like .update() work
            const todo = Object.assign(
              Object.create(Todo.prototype),
              item
            );
            this.todos.set(todo.id, todo);
          }
        }
      }
    } catch (err) {
      // Corrupted or unreadable file: start fresh
      console.warn('Failed to load todos from file, starting with empty store:', err.message);
    }
  }

  _saveToFile() {
    try {
      this._ensureDataDir();
      const items = Array.from(this.todos.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist todos to file:', err.message);
    }
  }

  // ---- Public API (unchanged signature) ----

  getAll() {
    return Array.from(this.todos.values());
  }

  getById(id) {
    return this.todos.get(id);
  }

  create(todo) {
    this.todos.set(todo.id, todo);
    this._saveToFile();
    return todo;
  }

  update(id, todo) {
    if (!this.todos.has(id)) {
      return null;
    }
    this.todos.set(id, todo);
    this._saveToFile();
    return todo;
  }

  delete(id) {
    const result = this.todos.delete(id);
    if (result) {
      this._saveToFile();
    }
    return result;
  }

  clear() {
    this.todos.clear();
    this._saveToFile();
  }
}

// Singleton instance
const db = new Database();

module.exports = db;
