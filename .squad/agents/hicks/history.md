# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Core Context

📌 **Architectural Decision (2026-03-23T23:41:38Z):** Three-tier baseline structure with frontend/backend/shared separation. API contracts in `shared/contracts/` enable predictable contract-driven testing. — Ripley

## Learnings

- Initial assignment: Tester and reviewer for end-to-end order history/detail flows.
- Priority quality focus: API contract consistency and UI state transitions when selecting orders.
- Contract location: API contracts defined in `shared/contracts/` for contract-driven tests and validation.
