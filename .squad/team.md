# Squad Team

> React + Node.js + SQLite order history task management app

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs and reviewer gates. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Ripley | Lead | `.squad/agents/ripley/charter.md` | ✅ Active |
| Vasquez | Frontend Dev | `.squad/agents/vasquez/charter.md` | ✅ Active |
| Bishop | Backend Dev | `.squad/agents/bishop/charter.md` | ✅ Active |
| Hicks | Tester | `.squad/agents/hicks/charter.md` | ✅ Active |
| Scribe | Session Logger | `.squad/agents/scribe/charter.md` | 📋 Silent |
| Ralph | Work Monitor | — | 🔄 Monitor |

## Coding Agent

<!-- copilot-auto-assign: false -->

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

### Capabilities

**🟢 Good fit — auto-route when enabled:**
- Bug fixes with clear reproduction steps
- Test coverage additions
- Lint/format and style fixes
- Small isolated features with clear acceptance criteria
- Documentation updates

**🟡 Needs review — route to @copilot with squad PR review:**
- Medium complexity features with explicit specs
- Refactors with strong existing test coverage
- API additions following existing patterns

**🔴 Not suitable — route to squad members:**
- Architecture decisions and system design
- Ambiguous requirements needing user clarification
- Security-critical authentication/authorization changes
- Cross-cutting changes across multiple systems

## Project Context

- **Owner:** UNKNOWN_USER
- **Project:** squad_workshop
- **Stack:** React, Node.js (API), SQLite
- **Description:** UI lists order history and shows full order details on click, with Node.js API over SQLite storage.
- **Created:** 2026-03-23
