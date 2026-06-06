const Todo = require('../models/todo.model');
const db = require('../db/database');

// Get all todos
const getAllTodos = (req, res) => {
  try {
    const todos = db.getAll();
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

// Get single todo
const getTodoById = (req, res) => {
  try {
    const todo = db.getById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

// Create new todo
const createTodo = (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
        data: null
      });
    }

    const todo = new Todo(title, description);
    db.create(todo);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

// Update todo
const updateTodo = (req, res) => {
  try {
    const todo = db.getById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
        data: null
      });
    }

    todo.update(req.body);
    db.update(req.params.id, todo);

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

// Delete todo
const deleteTodo = (req, res) => {
  try {
    const deleted = db.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found',
        data: null
      });
    }

    res.json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
