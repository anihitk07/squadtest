# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Core Context

📌 **Architectural Decision (2026-03-23T23:41:38Z):** Three-tier baseline structure with frontend/backend/shared separation. Backend owns `/api/orders`, `/api/orders/:orderId`, `/api/health` endpoints. Schema and seed scripts in `backend/src/db/`. — Ripley

## Learnings

- Initial assignment: Backend owner for order history and detail endpoints.
- Data requirement: API layer must retrieve persisted order records from SQLite and expose them to React UI.
- Tier ownership: Backend layer includes SQLite lifecycle, schema initialization, and API routes under `backend/src/`.
