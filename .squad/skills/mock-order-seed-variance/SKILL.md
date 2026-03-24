---
name: "mock-order-seed-variance"
description: "Create dashboard-friendly order seed data with high sorting variance while preserving API contract shape"
domain: "backend-seeding"
confidence: "high"
source: "observed"
---

## Context
Use when preparing SQLite order seed fixtures consumed by list/detail endpoints and sortable dashboard tables.

## Patterns
- Preserve existing order contract keys exactly (`id`, `orderNumber`, `orderDate`, `status`, `totalCents`, and detail `items`).
- Add enough records (10+) to make sorting interactions meaningful across date, status, and monetary columns.
- Ensure value variance across statuses, totals, identifiers, and time range to avoid degenerate sort demos.
- Keep data realistic and internally consistent: `totalCents` should equal the sum of line item extended prices.
- Validate with backend test suite plus seed/init run on an isolated DB file.

## Examples
- Seed file: `backend/data/seed/orders.json`
- Validation flow: `npm test`, `npm run db:init`, and repository-level sanity checks on totals/order count.

## Anti-Patterns
- Changing response keys or adding undocumented fields in seed records.
- Using repeated or near-identical order rows that hide sorting defects.
- Shipping seed data where totals don't match line items.
