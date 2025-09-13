# Implementation Plan: Refactor PMS Sales Capture System

**Branch**: `002-refactor-pms-sales` | **Date**: Tuesday, September 9, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/yakky/Dev/station-stock-manager/specs/002-refactor-pms-sales/spec.md`

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

Replace current transaction-based PMS sales recording with pump meter reading calculations. Instead of tracking individual PMS transactions, staff will record daily opening and closing meter readings for each pump, and the system will calculate total PMS sales volume and revenue from the meter differences. This provides more accurate fuel dispensing tracking and better inventory reconciliation while preserving transaction-based recording for lubricants and other products.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 15.3.3, React 19.0.0  
**Primary Dependencies**: Drizzle ORM 0.44.1, Clerk Auth 6.20.2, Zod 4.1.3, Tailwind CSS, Shadcn UI  
**Storage**: PostgreSQL via Supabase, Drizzle ORM with existing schema (products, transactions, transaction_items tables)  
**Testing**: Jest 29.7.0 (unit), Playwright 1.52.0 (e2e), real database integration tests  
**Target Platform**: Web application (Chrome, Firefox, Safari, Mobile browsers)
**Project Type**: web - determines source structure (frontend + backend in Next.js app)  
**Performance Goals**: <200ms page loads, real-time dashboard updates, 60fps animations  
**Constraints**: Must preserve existing transaction data, maintain current lubricant sales workflow, backward compatibility  
**Scale/Scope**: Multi-station support, daily meter readings per pump, integration with existing dashboard/reports

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (Next.js web app with integrated frontend/backend)
- Using framework directly? Yes (Next.js App Router, Drizzle ORM directly)
- Single data model? Yes (shared types, no DTOs - direct DB schema types)
- Avoiding patterns? Yes (Server Actions instead of Repository pattern)

**Architecture**:

- EVERY feature as library? Partial (actions/, components/, hooks/ as reusable modules)
- Libraries listed: [meter-readings (data capture), pms-calculations (business logic), dashboard-integration (reporting)]
- CLI per library: N/A (web application, not CLI-based)
- Library docs: N/A (web app documentation in README/specs)

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? YES (existing Jest/Playwright setup enforces TDD)
- Git commits show tests before implementation? YES (will enforce in development)
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (PostgreSQL, not mocks for integration tests)
- Integration tests for: new libraries, contract changes, shared schemas? YES
- FORBIDDEN: Implementation before test, skipping RED phase? ENFORCED

**Observability**:

- Structured logging included? YES (console.error with context in actions)
- Frontend logs → backend? YES (error boundaries, server actions)
- Error context sufficient? YES (Zod validation, error handling)

**Versioning**:

- Version number assigned? YES (0.0.1 → 0.1.0 for this feature)
- BUILD increments on every change? YES (will follow semver)
- Breaking changes handled? YES (backward compatibility preserved, migration plan)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Next.js app with integrated frontend/backend structure

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)

**Contract-Based Tasks**:

- Pump Configuration API → contract test task [P]
- Meter Readings API → contract test task [P]
- PMS Calculations API → contract test task [P]

**Data Model Tasks**:

- Create pump_configurations schema + migration [P]
- Create pump_meter_readings schema + migration [P]
- Create daily_pms_calculations schema + migration [P]
- Create pms_sales_records schema + migration [P]

**Business Logic Tasks** (TDD sequence):

- Test: Meter reading validation (rollover, time windows)
- Test: PMS calculation engine (including rollovers)
- Test: Deviation detection algorithm
- Test: Estimation fallback mechanisms
- Implementation tasks to make all tests pass

**Integration Tasks**:

- Meter reading workflow integration test
- Daily calculation workflow integration test
- Report integration test (preserving lubricant sales)
- Dashboard integration test (real-time updates)

**UI Component Tasks**:

- Meter reading entry form component [P]
- Daily calculation dashboard component [P]
- Pump status management component [P]
- Deviation alerts component [P]

**Ordering Strategy**:

- TDD order: Tests before implementation strictly enforced
- Database migrations → Business logic → API endpoints → UI components
- Dependency order: Core entities → calculations → integrations → UI
- Mark [P] for parallel execution (independent files/components)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**Critical Path**:

1. Database schema creation (4 tasks)
2. Contract tests (3 tasks)
3. Core business logic tests + implementation (8 tasks)
4. API endpoint implementation (6 tasks)
5. UI components (8 tasks)
6. Integration tests (6 tasks)
7. Migration and deployment (4 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
