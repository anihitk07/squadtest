# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Learnings

- Issue #23: Created `hello.txt` at repo root with "Hello from Squad on ACA!" content. Simple validation task confirming Squad agent workflow on Azure Container Apps environment.


- Initial assignment: Lead for architecture, scope, and review decisions.
- Core flow: order history list in React; click reveals order details via Node.js API backed by SQLite.
- Established 3-tier layout: `frontend/`, `backend/`, `shared/` with explicit boundary artifacts in `shared/contracts` and `shared/config`.
- Backend baseline uses `node:sqlite` with schema at `backend/src/db/schema.sql`, seeding via `backend/scripts/init-db.js`, and db path config in `backend/src/config/env.js`.
- Frontend baseline split into `src/components/OrderHistoryList.jsx`, `src/components/OrderDetail.jsx`, and `src/api/ordersApi.js` to keep UI/API contracts explicit.
- Root README now defines startup flow and endpoint contracts for predictable local bring-up.
