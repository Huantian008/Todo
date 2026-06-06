# CLAUDE.md

This file is the **single source of truth** for understanding and working on this repository.
If other docs contradict this file, update them to match this file (or mark them as deprecated).

## What This Repo Is

A full-stack Todo web app built as a **multi-AI collaboration exercise**:

- **Backend:** Go + Gin REST API (`backend/`)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS (`frontend/`)
- **Database:** MongoDB (`mongodb://localhost:27017`)
- **Weather Service:** Proxied AMap (Gaode) Web Service API
- **Contract:** REST endpoints under `/api/todos` and `/api/weather`, with a consistent JSON envelope response.

## Repository Layout (Current Code)

```
todo-app-multiai/
├── README.md                          # project introduction
├── CLAUDE.md                          # you are reading it
├── ARCHITECTURE.md                    # system architecture
├── docker-compose.yml                 # local MongoDB docker configuration
├── backend/                           # Go REST API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                # application entry point
│   ├── internal/
│   │   ├── config/                    # godotenv config loader
│   │   ├── db/                        # MongoDB database connector
│   │   ├── models/                    # Go data structures (Todo, Weather)
│   │   ├── repositories/              # MongoDB CRUD data access
│   │   ├── services/                  # Gaode Weather API service integrations
│   │   ├── handlers/                  # request/response controllers
│   │   └── routes/                    # Gin routes + CORS middleware
│   ├── tests/
│   │   └── todo_test.go               # in-memory HTTP endpoint tests
│   ├── go.mod
│   ├── go.sum
│   └── .env.example
└── frontend/                          # React + TS + Tailwind UI
    ├── src/
    │   ├── api/                       # API client services (todos, weather)
    │   ├── components/                # React UI elements (App, TodoList, WeatherCard, TodayHeader, EmptyState)
    │   ├── hooks/                     # Custom React hooks (useGeolocation)
    │   ├── types/                     # TypeScript type definitions (todo, weather)
    │   ├── main.tsx
    │   └── style.css                  # global Tailwind styles & dynamic weather variables
    ├── package.json
    └── vite.config.ts
```

## How To Run (Local)

### Prerequisites

- Go (1.20+)
- MongoDB (Running locally on `27017` or via Docker: `docker compose up -d mongodb`)
- Gaode Weather API Key (stored in `backend/.env` as `AMAP_KEY`)

### Backend (port `3001`)

Working dir: `backend/`

```bash
# Setup env file
cp .env.example .env

# Run local development server
go run ./cmd/server
```

Unit + Integration tests:

```bash
go test ./...
```

### Frontend (Vite dev server, usually `5173`)

Working dir: `frontend/`

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Build/Typecheck:

```bash
npm run typecheck
npm run build
```

---

## Backend: Storage + API Contract

### Storage

The backend uses a local **MongoDB** server. The database is named `todo_app`.

### Base URL

`http://localhost:3001`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/api/todos?date=YYYY-MM-DD` | List all todos (optionally filtered by date) |
| GET | `/api/todos/:id` | Get one todo |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo (supports partial updates) |
| DELETE | `/api/todos/:id` | Delete todo |
| GET | `/api/weather/today?lat=<lat>&lng=<lng>` | Get geolocated weather (AMap Proxy) |

### Response Envelope

All API endpoints respond with this standard envelope:

```json
{
  "success": true,
  "data": {},
  "count": 1
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

### Todo Shape (BSON & JSON)

```go
type Todo struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title       string             `bson:"title" json:"title"`
    Description string             `bson:"description,omitempty" json:"description,omitempty"`
    Completed   bool               `bson:"completed" json:"completed"`
    TaskDate    string             `bson:"taskDate" json:"taskDate"` // YYYY-MM-DD format
    CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}
```

---

## Multi-AI Rules (Do Not Break)

These rules are enforced by convention and by `.aiconfig`/skill configs:

- **Codex owns backend:** changes under `backend/`.
- **Gemini owns frontend:** changes under `frontend/`.
- **Claude owns integration/docs:** cross-cutting reviews and docs.

Gemini model constraint (project policy):
- Allowed: `gemini-3-flash-preview` (default), `gemini-3-pro-preview` (fallback).
- Not allowed: any Gemini 2.x models.
