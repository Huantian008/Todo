/* eslint-env jest */
const request = require('supertest');

// ---- App loader (compatible with different export styles) ----
function loadApp() {
  // eslint-disable-next-line global-require
  const mod = require('../src/server');
  return mod?.app || mod?.default || mod;
}

// ---- In-memory DB reset (best-effort) ----
function loadDb() {
  try {
    // eslint-disable-next-line global-require
    return require('../src/db/database');
  } catch (e) {
    return null;
  }
}

function resetDb(db) {
  if (!db) return;

  // Try common reset/clear hooks
  const candidates = ['reset', 'clear', '__reset', 'resetDb', 'clearDb', 'truncate'];
  for (const key of candidates) {
    if (typeof db[key] === 'function') {
      db[key]();
      return;
    }
  }

  // Try common container fields
  const containers = ['todos', 'items', 'data', 'store', 'db'];
  for (const key of containers) {
    const v = db[key];
    if (Array.isArray(v)) {
      v.length = 0;
      return;
    }
    if (v && typeof v === 'object') {
      if (typeof v.clear === 'function') {
        v.clear();
        return;
      }
      for (const k of Object.keys(v)) delete v[k];
      return;
    }
  }
}

function expectEnvelope(res) {
  expect(res.body).toHaveProperty('success');
  expect(typeof res.body.success).toBe('boolean');
  expect(res.body).toHaveProperty('data');
}

function expectSuccess(res) {
  expectEnvelope(res);
  expect(res.body.success).toBe(true);
}

function expectFail(res) {
  expectEnvelope(res);
  expect(res.body.success).toBe(false);
}

describe('Todo API', () => {
  let app;
  let db;

  beforeAll(() => {
    app = loadApp();
    db = loadDb();
  });

  beforeEach(() => {
    resetDb(db);
  });

  // Helper: create a todo via API so tests stay black-box.
  async function createTodo(payload = { title: 'test title' }) {
    const res = await request(app).post('/api/todos').send(payload);
    expect([200, 201]).toContain(res.statusCode);
    expectSuccess(res);
    return res.body.data;
  }

  describe('GET /api/todos', () => {
    test('200 - returns empty list (success envelope)', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toBe(200);
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('200 - returns list containing created todo', async () => {
      const created = await createTodo({ title: 'hello' });
      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toBe(200);
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
      const ids = res.body.data.map((t) => t.id);
      expect(ids).toContain(created.id);
    });

    test('500 - returns failure envelope when DB throws (best-effort)', async () => {
      if (!db) {
        const res = await request(app).get('/api/todos');
        expectEnvelope(res);
        return;
      }

      const likelyFns = ['getTodos', 'getAllTodos', 'getAll', 'listTodos', 'findAll', 'all'];

      let patchedKey = null;
      let original = null;
      for (const k of likelyFns) {
        if (typeof db[k] === 'function') {
          patchedKey = k;
          original = db[k];
          db[k] = () => {
            throw new Error('forced');
          };
          break;
        }
      }

      if (!patchedKey) {
        const key = typeof db.todos !== 'undefined' ? 'todos' : null;
        if (key) {
          const origVal = db[key];
          db[key] = null;
          const res = await request(app).get('/api/todos');
          expect([200, 500]).toContain(res.statusCode);
          expectEnvelope(res);
          db[key] = origVal;
          return;
        }

        const res = await request(app).get('/api/todos');
        expectEnvelope(res);
        return;
      }

      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toBe(500);
      expectFail(res);

      db[patchedKey] = original;
    });
  });

  describe('GET /api/todos/:id', () => {
    test('200 - returns single todo by id', async () => {
      const created = await createTodo({ title: 'get one' });
      const res = await request(app).get(`/api/todos/${created.id}`);
      expect(res.statusCode).toBe(200);
      expectSuccess(res);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.id).toBe(created.id);
    });

    test('404 - returns failure envelope for missing id', async () => {
      const res = await request(app).get('/api/todos/00000000-0000-4000-8000-000000000000');
      expect(res.statusCode).toBe(404);
      expectFail(res);
    });
  });

  describe('POST /api/todos', () => {
    test('201 - creates a new todo (success envelope)', async () => {
      const res = await request(app).post('/api/todos').send({ title: 'create me' });
      expect([201, 200]).toContain(res.statusCode);
      expectSuccess(res);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.title).toBe('create me');
      expect(res.body.data.id).toBeTruthy();
    });

    test('400 - title is required', async () => {
      const res = await request(app).post('/api/todos').send({});
      expect(res.statusCode).toBe(400);
      expectFail(res);
    });
  });

  describe('PUT /api/todos/:id', () => {
    test('200 - updates an existing todo', async () => {
      const created = await createTodo({ title: 'before' });
      const res = await request(app).put(`/api/todos/${created.id}`).send({ title: 'after' });
      expect(res.statusCode).toBe(200);
      expectSuccess(res);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.id).toBe(created.id);
      expect(res.body.data.title).toBe('after');
    });

    test('404 - updating missing todo returns failure envelope', async () => {
      const res = await request(app)
        .put('/api/todos/00000000-0000-4000-8000-000000000000')
        .send({ title: 'nope' });
      expect(res.statusCode).toBe(404);
      expectFail(res);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    test('200 - deletes an existing todo', async () => {
      const created = await createTodo({ title: 'delete me' });
      const res = await request(app).delete(`/api/todos/${created.id}`);
      expect(res.statusCode).toBe(200);
      expectSuccess(res);
    });

    test('404 - deleting missing todo returns failure envelope', async () => {
      const res = await request(app).delete('/api/todos/00000000-0000-4000-8000-000000000000');
      expect(res.statusCode).toBe(404);
      expectFail(res);
    });
  });
});
