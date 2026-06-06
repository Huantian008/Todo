# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: Express API for Todo CRUD.
- `backend/src/`: app code split by responsibility:
  `controllers/`, `models/`, `routes/`, `db/`, `server.js`.
- `backend/tests/`: Jest + Supertest API tests (`todo.test.js`).
- `frontend/`: React + TypeScript + Vite client.
- `frontend/src/components/`: UI components (`App.tsx`, `AddTodo.tsx`, `TodoList.tsx`, etc.).
- Root docs (`CLAUDE.md`, `ARCHITECTURE.md`) describe architecture and collaboration rules.

## Build, Test, and Development Commands
- Backend setup/run:
  - `cd backend && npm install`
  - `cp .env.example .env` (first-time setup)
  - `npm start` (run API on `:3001`)
  - `npm run dev` (nodemon auto-reload)
  - `npm test` (Jest with coverage)
  - `npm run test:unit` (unit tests without HTTP listen)
- Frontend setup/run:
  - `cd frontend && npm install`
  - `npm run dev` (Vite dev server, usually `:5173`)
  - `npm run build` (TypeScript compile + production build)
  - `npm run preview` (serve built app)
  - `npm run typecheck` (TypeScript check only)

## Coding Style & Naming Conventions
- JavaScript/TypeScript style in this repo uses:
  - 2-space indentation
  - semicolons
  - single quotes
- Keep modules focused by layer (`controller` vs `model` vs `route`).
- Naming:
  - React components: `PascalCase` filenames (`TodoItem.tsx`)
  - JS modules: dot-suffix style (`todo.controller.js`, `todo.model.js`)
  - variables/functions: `camelCase`
- No dedicated lint script is currently configured; keep changes consistent with nearby code and run tests before opening a PR.

## Testing Guidelines
- Frameworks: `jest` + `supertest` (backend).
- Location: add tests under `backend/tests/`.
- Prefer endpoint-level behavior tests with response envelope assertions (`success`, `data`, and error cases).
- Run `cd backend && npm test` before pushing.
- Coverage target in project docs: `>80%` for backend.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history:
  - `feat(backend): ...`
  - `fix(backend): ...`
  - `test(backend): ...`
  - `chore(...): ...`
  - `docs: ...`
- Keep commit scope precise (`backend`, `frontend`, `docker`, `ai-service`).
- PRs should include:
  - clear summary of behavior changes
  - affected paths (example: `backend/src/routes/todo.routes.js`)
  - test evidence (command + result)
  - screenshots/GIFs for frontend UI changes.

## Agent Collaboration Notes
- Repository convention: Codex primarily edits `backend/`, Gemini primarily edits `frontend/`, Claude maintains integration/docs.
- Treat `CLAUDE.md` as the source of truth when docs diverge.
