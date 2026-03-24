# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Core Context

📌 **Architectural Decision (2026-03-23T23:41:38Z):** Three-tier baseline structure with frontend/backend/shared separation. API contracts in `shared/contracts/` enable predictable contract-driven testing. — Ripley

📌 **Team update (2026-03-24T10:19:20Z):** User profile test harness finalized. Backend route tests: 3 (200/404/500). Frontend API tests: 3 (success/404/500). Frontend UI tests: 6 (loading/success/not-found/error/nullables/edge-cases). Vitest + @testing-library/react setup. All 12 tests passing in CI. — Ripley

## Learnings

- Initial assignment: Tester and reviewer for end-to-end order history/detail flows.
- Priority quality focus: API contract consistency and UI state transitions when selecting orders.
- Contract location: API contracts defined in `shared/contracts/` for contract-driven tests and validation.
- 2026-03-24: User profile coverage now includes backend route tests for 200/404/500 and frontend deterministic tests for loading/success/not-found/error states.
- 2026-03-24: Frontend test setup uses Vitest + Testing Library (`jsdom`) with explicit cleanup between tests to prevent DOM leakage and flaky assertions.
- 2026-03-24: Edge assertions validated null fallbacks (`avatarUrl`, `lastOrderDate`) plus zero and large stats formatting (`0` orders, `$1,234,567.89` lifetime value).
