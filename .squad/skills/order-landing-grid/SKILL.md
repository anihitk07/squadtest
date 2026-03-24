---
name: "order-landing-grid"
description: "Build a state-driven order landing page with sortable columns and detail drill-through"
domain: "frontend"
confidence: "high"
source: "observed"
---

## Context
Use when implementing list/detail flows for orders where users need to scan, sort, then drill into details with explicit UI states.

## Patterns
- Use an orchestrator page component (`OrderLandingPage`) for list and detail lifecycle state.
- Keep view states explicit (`loading`, `success`, `empty`, `error`) for list fetch outcomes.
- Keep detail loading and detail error state separate from list state.
- Render order list in a semantic table when sortable columns are required.
- Represent sorting as `{ key, direction }`, default to most useful business sort (`orderDate desc` here).
- Make order ID a button/link-like control that triggers detail fetch and selected-row highlighting.
- Reuse existing API clients instead of re-implementing fetch logic inside UI files.

## Examples
- Orchestration/state: `frontend/src/components/OrderLandingPage.jsx`
- App-level wiring: `frontend/src/App.jsx`
- Styling hooks: `frontend/src/App.css`
- Coverage: `frontend/src/components/OrderLandingPage.test.jsx`

## Anti-Patterns
- Mixing raw fetch logic directly into table row render functions.
- Implicit loading/error handling (e.g., hiding state transitions).
- Tying sort logic to DOM order rather than deterministic state.
