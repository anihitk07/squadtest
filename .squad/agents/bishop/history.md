# Project Context

- **Owner:** UNKNOWN_USER
- **Project:** React + Node.js + SQLite order history app
- **Stack:** React UI, Node.js API, SQLite relational storage
- **Created:** 2026-03-23T20:47:55.220Z

## Core Context

📌 **Architectural Decision (2026-03-23T23:41:38Z):** Three-tier baseline structure with frontend/backend/shared separation. Backend owns `/api/orders`, `/api/orders/:orderId`, `/api/health` endpoints. Schema and seed scripts in `backend/src/db/`. — Ripley

📌 **Team update (2026-03-24T10:19:20Z):** User profile feature contract finalized. Backend route boundary pattern: routes own HTTP semantics, repositories own SQL logic. Explicit 404/500 error handling with stable payloads. Profile endpoint: `GET /api/profile` with `{ data: {...} }` success envelope. — Ripley

## Learnings

- Initial assignment: Backend owner for order history and detail endpoints.
- Data requirement: API layer must retrieve persisted order records from SQLite and expose them to React UI.
- Tier ownership: Backend layer includes SQLite lifecycle, schema initialization, and API routes under `backend/src/`.
- 2026-03-24: Keep SQLite query logic in `backend/src/db/orders-repository.js` and keep `backend/src/routes/orders.js` focused on HTTP behavior.
- 2026-03-24: Preserve response contract envelope `{ data: ... }` exactly as defined in `shared/contracts/order-api.contract.json` for both list and detail endpoints.
- 2026-03-24: Route handlers should explicitly catch repository/database exceptions, log operation context, and return stable 500 errors while retaining 404 for missing order IDs.
- 2026-03-24: Key backend paths for this feature are `backend/src/routes/orders.js`, `backend/src/db/orders-repository.js`, `backend/src/db/init.js`, and `backend/data/seed/orders.json`.
- 2026-03-24: Implemented `GET /api/profile` with route-level 404/500 boundaries and repository-only SQL in `backend/src/db/profile-repository.js`.
- 2026-03-24: Extended SQLite schema/init seeding with `user_profile` table and `backend/data/seed/profile.json`, ensuring idempotent profile retrieval initialization.
- 2026-03-24: Verified backend baseline (`npm test`, `npm run db:init`) and profile API smoke scenarios for 200, 404, and 500 contracts.
