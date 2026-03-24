---
name: "backend-order-route-hardening"
description: "Harden Node.js order routes with explicit contract responses, 404 semantics, and DB failure handling"
domain: "api-design"
confidence: "high"
source: "observed"
---

## Context
Use when implementing or finalizing backend order endpoints backed by SQLite. This applies to APIs that must keep strict response contracts while distinguishing missing-resource behavior from internal data-access failures.

## Patterns
- Keep route handlers focused on HTTP semantics; keep SQL/query logic in repository modules.
- For successful responses, always return the shared contract envelope (`{ data: ... }`).
- For `GET /orders/:orderId`, return `404` when repository returns no row.
- Wrap repository calls in `try/catch` at route boundary and return stable `500` errors for DB failures.
- Log operation context with DB failures for backend observability.

## Examples
- Route boundary: `backend/src/routes/orders.js`
- Repository boundary: `backend/src/db/orders-repository.js`
- Contract reference: `shared/contracts/order-api.contract.json`

## Anti-Patterns
- Running SQL directly in route handlers.
- Returning inconsistent error shapes across list and detail endpoints.
- Collapsing missing-resource and DB-failure scenarios into the same status code.
