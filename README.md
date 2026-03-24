# Order History App Scaffold

Three-tier baseline for a React + Node.js + SQLite application.

## Structure

- `frontend/` — React app (order history list + order detail view)
- `backend/` — Node.js API and SQLite initialization/seed logic
- `shared/` — API contract and shared environment config notes

## Run locally

### 1) Backend API

```bash
cd backend
npm install
npm run db:init
npm run dev
```

API defaults to `http://localhost:3001`.

### 2) Frontend UI

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite (default `http://localhost:5173`) and proxies `/api` to backend.

## API endpoints

- `GET /api/orders` — order history list
- `GET /api/orders/:orderId` — single order details
- `GET /api/health` — API health check
