---
name: "three-tier-order-app-bootstrap"
description: "Scaffold a runnable React + Node + SQLite app with explicit frontend/backend/shared boundaries"
domain: "architecture"
confidence: "high"
source: "observed"
---

## Context
Use this when starting a greenfield full-stack app that needs quick delivery without blurring boundaries. It is especially useful when UI/API contracts must stay explicit from day one.

## Patterns
- Create top-level folders: `frontend/`, `backend/`, `shared/`.
- Put boundary definitions in `shared/contracts` and environment naming conventions in `shared/config`.
- In backend, isolate SQLite concerns:
  - config in `src/config/env.js`
  - schema in `src/db/schema.sql`
  - init/seed logic in `src/db/init.js` plus `scripts/init-db.js`
- Keep API shape minimal and explicit (`GET /api/orders`, `GET /api/orders/:orderId`, health endpoint).
- In frontend, separate API calls from UI:
  - `src/api/ordersApi.js` for HTTP
  - `src/components/OrderHistoryList.jsx` and `OrderDetail.jsx` for presentation
  - `src/App.jsx` for orchestration/state

## Examples
- Backend contract path: `backend/src/routes/orders.js`
- Seed data path: `backend/data/seed/orders.json`
- Shared API contract: `shared/contracts/order-api.contract.json`
- Frontend data flow:
  - load list on mount
  - fetch detail on row click
  - render independent list/detail panels

## Anti-Patterns
- Mixing backend DB code into route handlers directly.
- Letting frontend component files own raw fetch logic and view logic together.
- Omitting shared contract artifacts, which leads to drift between UI and API payload assumptions.
