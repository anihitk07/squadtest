# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Core Context

📌 **Architectural Decision (2026-03-23T23:41:38Z):** Three-tier baseline structure with frontend/backend/shared separation. Frontend layer in `frontend/src/` with components for order history and detail. API contracts in `shared/contracts/`. — Ripley

## Learnings

- Initial assignment: Frontend owner for order list and order detail interactions.
- UI requirement: selecting an order from history list should display full order details.
- Tier ownership: Frontend includes React components in `frontend/src/components/` and API client in `frontend/src/api/`.
