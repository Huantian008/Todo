# Nocturne - Todo App with Weather UI

Nocturne is a full-stack Todo web application featuring smooth FLIP list animations and a dynamic user interface that changes background gradients and CSS theme accents depending on your local weather conditions (powered by Gaode/AMap Web Service APIs).

This project was built as a multi-AI collaboration exercise.

## Tech Stack

- **Backend:** Go + Gin
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Database:** MongoDB
- **Proxy Services:** Gaode Geocoding & Weather APIs (proxied via Go to protect keys)
- **Containerization:** Docker Compose (for MongoDB)

## Quick Start

### 1. Database Setup
Ensure you have MongoDB running locally on port `27017`, or spin up the database container:
```bash
docker compose up -d mongodb
```

### 2. Backend Setup
1. Configure your environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open `backend/.env` and configure your AMap API key:
   ```env
   AMAP_KEY=your_real_amap_key_here
   ```
3. Start the Go server:
   ```bash
   go run ./cmd/server
   ```
   The backend server runs on `http://localhost:3001`.

### 3. Frontend Setup
1. In a separate terminal session:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Verification & Testing

Run Go backend unit and integration test suite:
```bash
cd backend
go test ./...
```

Run frontend typecheck & production build:
```bash
cd frontend
npm run typecheck
npm run build
```

## Documentation
- Refer to [CLAUDE.md](CLAUDE.md) for full developer commands, project specifications, and API contracts.
- Refer to [ARCHITECTURE.md](ARCHITECTURE.md) for structural diagrams and details of the weather mapping theme system.
