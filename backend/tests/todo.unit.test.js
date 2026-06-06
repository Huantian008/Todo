/* eslint-env jest */
const Todo = require('../src/models/todo.model');
const db = require('../src/db/database');
const controller = require('../src/controllers/todo.controller');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('Todo model + controller unit tests', () => {
  beforeEach(() => {
    db.clear();
  });

  describe('Todo model', () => {
    test('creates todo with defaults', () => {
      const todo = new Todo('learn testing');
      expect(todo.id).toBeTruthy();
      expect(todo.title).toBe('learn testing');
      expect(todo.description).toBe('');
      expect(todo.completed).toBe(false);
      expect(typeof todo.createdAt).toBe('string');
      expect(typeof todo.updatedAt).toBe('string');
    });

    test('update changes provided fields and updates timestamp', async () => {
      const todo = new Todo('before', 'old');
      const prevUpdatedAt = todo.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 2));
      todo.update({ title: 'after', completed: true });

      expect(todo.title).toBe('after');
      expect(todo.description).toBe('old');
      expect(todo.completed).toBe(true);
      expect(todo.updatedAt >= prevUpdatedAt).toBe(true);
    });
  });

  describe('Database singleton', () => {
    test('create/get/update/delete lifecycle', () => {
      const todo = new Todo('db test');
      db.create(todo);
      expect(db.getAll()).toHaveLength(1);
      expect(db.getById(todo.id)).toBe(todo);

      todo.update({ title: 'db test updated' });
      db.update(todo.id, todo);
      expect(db.getById(todo.id).title).toBe('db test updated');

      expect(db.delete(todo.id)).toBe(true);
      expect(db.getById(todo.id)).toBeUndefined();
    });
  });

  describe('Controller (no HTTP server)', () => {
    test('createTodo returns 400 when title is missing', () => {
      const req = { body: {} };
      const res = createMockRes();
      controller.createTodo(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Title is required');
    });

    test('createTodo + getAllTodos happy path', () => {
      const createReq = { body: { title: 'controller create', description: 'desc' } };
      const createRes = createMockRes();
      controller.createTodo(createReq, createRes);

      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.title).toBe('controller create');

      const listRes = createMockRes();
      controller.getAllTodos({}, listRes);
      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data)).toBe(true);
      expect(listRes.body.count).toBe(1);
    });

    test('updateTodo returns 404 for missing id', () => {
      const req = { params: { id: 'missing' }, body: { title: 'x' } };
      const res = createMockRes();
      controller.updateTodo(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Todo not found');
    });

    test('deleteTodo returns deleted id', () => {
      const todo = new Todo('delete me');
      db.create(todo);

      const req = { params: { id: todo.id } };
      const res = createMockRes();
      controller.deleteTodo(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ id: todo.id });
      expect(db.getById(todo.id)).toBeUndefined();
    });
  });
});
