# CLAUDE.md

This file is the **single source of truth** for understanding and working on this repository.
If other docs contradict this file, update them to match this file (or mark them as deprecated).

## What This Repo Is

A full-stack Todo web app built as a **multi-AI collaboration exercise**:

- **Backend:** Express.js REST API (`backend/`)
- **Frontend:** React + TypeScript + Vite + Tailwind (`frontend/`)
- **Contract:** REST endpoints under `/api/todos`, with a consistent JSON envelope response.

## Repository Layout (Current Code)

```
todo-app-multiai/
├── README.md                          # points here
├── CLAUDE.md                          # you are reading it
├── .aiconfig                          # role/model constraints (project-level)
├── backend/                           # Express.js REST API
│   ├── src/
│   │   ├── controllers/todo.controller.js
│   │   ├── models/todo.model.js
│   │   ├── routes/todo.routes.js
│   │   ├── db/database.js            # in-memory Map store
│   │   └── server.js                 # Express app + listen()
│   └── tests/todo.test.js            # Jest + Supertest
└── frontend/                          # React + TS UI
    ├── src/
    │   ├── components/
    │   │   ├── App.tsx
    │   │   ├── AddTodo.tsx
    │   │   ├── Header.tsx
    │   │   ├── TodoList.tsx
    │   │   └── TodoItem.tsx
    │   └── main.tsx
    └── vite.config.ts
```

## How To Run (Local)

### Backend (port `3001`)

Working dir: `backend/`

```bash
npm install
cp .env.example .env
npm start
```

Dev (auto-reload):

```bash
npm run dev
```

Health check: `GET /health`

### Frontend (Vite dev server, usually `5173`)

Working dir: `frontend/`

```bash
npm install
npm run dev
```

Build/preview:

```bash
npm run build
npm run preview
```

## Backend: Storage + API Contract

### Storage (current implementation)

The backend uses an **in-memory** `Map` store (`backend/src/db/database.js`). This means data is lost on restart.

### Base URL

`http://localhost:3001/api/todos`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | List all todos |
| GET | `/api/todos/:id` | Get one todo |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |

### Response Envelope (source of truth)

All endpoints respond with this envelope:

```json
{
  "success": true,
  "data": {}
}
```

Notes:
- `GET /api/todos` also includes `count` in the response.
- Error responses use `success: false` and an `error` string.

### Todo Shape (what the UI expects)

```ts
interface Todo {
  id: string;          // UUID
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;   // ISO timestamp (current UI expects a string)
  updatedAt: string;   // ISO timestamp (current UI expects a string)
}
```

## Frontend: Integration Rules

- Axios responses are wrapped: access the actual payload via `response.data.data`.
- Todo `id` is a UUID string everywhere.
- Backend runs on `http://localhost:3001` and frontend calls `http://localhost:3001/api/todos` directly.

## Multi-AI Rules (Do Not Break)

These rules are enforced by convention and by `.aiconfig`/skill configs:

- **Codex owns backend:** changes under `backend/`.
- **Gemini owns frontend:** changes under `frontend/`.
- **Claude owns integration/docs:** cross-cutting reviews and docs like this file.

Gemini model constraint (project policy):
- Allowed: `gemini-3-flash-preview` (default), `gemini-3-pro-preview` (fallback).
- Not allowed: any Gemini 2.x models.

## Testing

Backend tests:

```bash
cd backend
npm test
```

Target coverage: `> 80%`.

Unit-only tests (no HTTP listen, useful in restricted sandboxes):

```bash
cd backend
npm run test:unit
```

## Doc Map (Supplementary Only)

These files are optional and must not conflict with `CLAUDE.md`:

- `ARCHITECTURE.md`: high-level architecture and goals (keep consistent with current code)
- `AI_WORKFLOW.md`: multi-AI collaboration workflow
- `MULTI_AI_USAGE.md`: CLI usage examples for Codex/Gemini/Claude
- `GEMINI_3_ONLY.md`: Gemini model policy (Gemini 3 only)
- `GEMINI_MODELS.md`: model policy summary (must match `GEMINI_3_ONLY.md`)
- `SKILL_USAGE.md`, `.claude/skills/multi-ai-planner.md`: optional skill notes/config
