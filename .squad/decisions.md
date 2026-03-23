# Squad Decisions

## Active Decisions

### 2026-03-23: Three-tier baseline structure

**By:** Ripley

**What:** Established repository structure with three isolated tiers:
- `frontend/` for React UI components and API client
- `backend/` for Node.js API server and SQLite database lifecycle
- `shared/` for cross-tier contracts (`shared/contracts/`) and config conventions (`shared/config/`)

Backend exposes minimal initial API surface: `/api/orders` (list), `/api/orders/:orderId` (detail), `/api/health` (status).

**Why:** Clear responsibility separation reduces coupling during feature expansion, makes API/UI boundaries explicit, and enables predictable local setup for team onboarding. Minimal runnable architecture scales without refactoring folder ownership.

**Impact:**
- Faster onboarding with explicit tier responsibilities
- Clear extension points for future contract evolution
- Reduced cross-layer coupling
- Foundation for parallel feature work across frontend/backend teams

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
