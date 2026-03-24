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

### 2026-03-24: User profile feature contract for parallel implementation

**By:** Ripley

**What:** Defined contract-first user profile feature with explicit API/UI boundaries:
- **Backend endpoint:** `GET /api/profile`
- **Success response:** `{ "data": { ...profile } }` with fields: id, fullName, email, avatarUrl (nullable), joinedDate, bio, stats (orderCount, lastOrderDate nullable, lifetimeValueCents)
- **Error responses:** 
  - `404` with `{ "error": "User profile not found." }` when profile missing
  - `500` with `{ "error": "Failed to retrieve profile." }` on repository/DB failure
- **Frontend:** Dedicated profile screen with state machine (loading/success/not-found/error), `UserProfilePage` orchestrator, `UserProfileCard` presenter, API client in `profileApi.js`
- **Testing:** API contract validation (200/404/500), UI state coverage, nullable fallback rendering, edge case formatting
- **Shared contract:** `shared/contracts/user-profile-api.contract.json` as canonical schema

**Why:** Enables parallel delivery across backend/frontend/testing teams without cross-tier blocking. Explicit boundaries preserve contract stability for future iterations.

**Impact:**
- Parallel team delivery unblocked
- Clear API/UI separation of concerns
- Contract-driven testing reduces integration surprises
- Foundation for profile extensibility (auth, profile editing, etc.)

### 2026-03-24: User profile route boundary and repository split

**By:** Bishop

**What:** For `GET /api/profile`, explicitly separate HTTP semantics (route) from SQL logic (repository):
- Route (`backend/src/routes/profile.js`): owns response wrapping, 404 not-found detection, 500 error wrapping with stable payloads
- Repository (`backend/src/db/profile-repository.js`): owns SQLite query logic only, throws on database errors
- Route catches repository exceptions and converts to stable 500 responses with logging

**Why:** Follows established backend hardening patterns (consistent with orders endpoints). Keeps contract stability for frontend callers. Prevents database implementation details from leaking into HTTP behavior. Improves observability via route-level failure logging.

**Impact:**
- Stable, predictable profile error responses for consumers
- Cleaner layering for future profile query changes (SQL optimization, caching, etc.)
- Consistent pattern across all API endpoints

### 2026-03-24: Explicit route-level DB failure handling for orders API

**By:** Bishop

**What:** Applied explicit HTTP boundary pattern to existing order endpoints (`/api/orders`, `/api/orders/:orderId`):
- Route handlers preserve explicit HTTP behavior: `404` for missing order IDs, `500` for repository/database failures
- Success responses wrapped as `{ data: ... }` (existing envelope convention)
- Repository access wrapped in `try/catch` with context logging
- Stable error payloads prevent DB exceptions from leaking to consumers

**Why:** Retroactive hardening decision to match profile route pattern. Order endpoints were already implemented with implicit error handling; this formalizes the boundary. Improves reliability for frontend consumers. Reduces coupling between DB exceptions and HTTP semantics.

**Impact:**
- More reliable API behavior across all endpoints
- Clear observability for backend failure triage
- Consistent error handling pattern team-wide

### 2026-03-24: User profile test harness and deterministic coverage

**By:** Hicks

**What:** Added contract-driven test coverage for profile feature:
- **Backend:** `backend/src/routes/profile.test.js` with 3 tests (200 success, 404 not-found, 500 DB failure)
- **Frontend API:** `frontend/src/api/profileApi.test.js` with 3 tests (success return, 404 error, 500 fallback)
- **Frontend UI:** `frontend/src/components/UserProfilePage.test.jsx` with 6 tests (loading, success, not-found, error, nullables, edge formatting)
- **Ecosystem setup:** 
  - Added dev dependencies: `vitest`, `@testing-library/react`, `jsdom`
  - Added `npm run test` script (`vitest run`)
  - Configured `vite.config.js` with `test.environment = "jsdom"`

**Why:** Contract-first testing ensures API and UI boundaries remain stable as implementation evolves. Deterministic test suite enables confident refactoring. Minimal setup follows Vite/React ecosystem norms.

**Impact:**
- 12 passing tests provide regression confidence
- UI/API contract compliance verifiable in CI
- Foundation for adding profile feature tests in future iterations
- No custom test harness overhead

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
