# Implementation Plan: Theme Management

**Branch**: `001-add-theme-management` | **Date**: 2025-09-09 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-theme-management/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
This plan outlines the implementation of a theme management feature. Station managers will be able to customize the visual theme of their station's interface, including setting a primary color and choosing between light and dark modes. The technical approach involves extending the database schema, creating new API endpoints for managing theme settings, and updating the frontend to apply the custom themes dynamically.

## Technical Context
**Language/Version**: TypeScript
**Primary Dependencies**: Next.js, React, Drizzle ORM, Clerk
**Storage**: PostgreSQL (via Supabase)
**Testing**: Jest, Playwright
**Target Platform**: Web
**Project Type**: Web Application (Frontend + Backend)
**Performance Goals**: Theme changes should be applied instantly without a full page reload.
**Constraints**: The feature must be restricted to "Station Manager" roles.
**Scale/Scope**: The theme settings are per-station.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (The existing Next.js app)
- Using framework directly? Yes
- Single data model? Yes
- Avoiding patterns? Yes

**Architecture**:
- EVERY feature as library? No, this is a full-stack Next.js app.
- Libraries listed: N/A
- CLI per library: N/A
- Library docs: N/A

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes
- Integration tests for: new libraries, contract changes, shared schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase. Yes

**Observability**:
- Structured logging included? Yes
- Frontend logs → backend? Yes
- Error context sufficient? Yes

**Versioning**:
- Version number assigned? N/A for this feature branch.
- BUILD increments on every change? N/A
- Breaking changes handled? N/A

## Project Structure

### Documentation (this feature)
```
specs/001-add-theme-management/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (when "frontend" + "backend" detected)
# This project follows a Next.js structure which is a variation of this.
# We will add files to the existing structure.
```

**Structure Decision**: Web Application (Next.js)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Research best practices for implementing theme management in Next.js with Tailwind CSS.
   - Investigate how to best store and retrieve theme settings with Drizzle ORM.
   - Clarify the default theme settings (colors, mode).

2. **Generate and dispatch research agents**:
   - Task: "Research theme management in Next.js and Tailwind CSS"
   - Task: "Find best practices for Drizzle ORM with JSON data"
   - Task: "Propose a default theme (light and dark mode color palettes)"

3. **Consolidate findings** in `research.md`.

**Output**: `research.md` with all NEEDS CLARIFICATION resolved.

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Create a new table `themeSettings` with columns `station_id`, `primary_color`, and `mode`.
   - Define the Drizzle schema for the `themeSettings` table.

2. **Generate API contracts** from functional requirements:
   - `POST /api/theme`: Create or update theme settings for a station.
   - `GET /api/theme`: Get theme settings for a station.
   - Output OpenAPI schema to `/contracts/`.

3. **Generate contract tests** from contracts:
   - Create tests for the `POST` and `GET` endpoints.
   - Tests must fail initially.

4. **Extract test scenarios** from user stories:
   - Create Playwright E2E tests for the theme management UI.

5. **Update agent file incrementally**:
   - Run `/scripts/update-agent-context.sh gemini`

**Output**: `data-model.md`, `/contracts/theme.yaml`, failing tests, `quickstart.md`, updated `GEMINI.md`.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Generate tasks from Phase 1 design documents.
- Create tasks for database migration, backend API implementation, and frontend UI development.

**Ordering Strategy**:
- 1. Database schema and migration.
- 2. Backend API endpoints and tests.
- 3. Frontend UI components and tests.
- 4. E2E tests.

**Estimated Output**: ~15-20 tasks in `tasks.md`.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md)
**Phase 5**: Validation (run tests, execute quickstart.md)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [X] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PENDING
- [ ] All NEEDS CLARIFICATION resolved: PENDING
- [ ] Complexity deviations documented: PASS

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*