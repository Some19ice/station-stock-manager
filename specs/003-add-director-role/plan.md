# Implementation Plan: Add Director Role

**Branch**: `003-add-director-role` | **Date**: September 13, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-add-director-role/spec.md`

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

Add a new "Director" role to the Station Stock Manager system that provides strategic oversight capabilities with restricted operational access. Directors can view and generate all reports, manage user accounts and roles, view inventory data (read-only), and manage supplier/customer relationships, but cannot access sales transaction interfaces. The implementation extends the existing Clerk-based role system from "staff" and "manager" to include "director" with comprehensive audit logging and minimum admin policy enforcement.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15  
**Primary Dependencies**: @clerk/nextjs 6.20.2, drizzle-orm 0.44.1, next-themes, @radix-ui components, zod 4.1.3  
**Storage**: PostgreSQL with Drizzle ORM, Supabase for hosting  
**Testing**: Jest + React Testing Library (unit), Playwright (e2e)  
**Target Platform**: Web application (Next.js app router)
**Project Type**: web - single Next.js application with server actions  
**Performance Goals**: <200ms page loads, <100ms API responses for role checks  
**Constraints**: Must maintain existing Clerk authentication flow, role-based middleware compatibility, audit log compliance  
**Scale/Scope**: ~15 new UI components, 5-8 database schema changes, 10-12 server actions, comprehensive role permission system

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (web app - Next.js with integrated frontend/backend)
- Using framework directly? YES (Next.js app router, Clerk auth, Drizzle ORM)
- Single data model? YES (extending existing user/role schema)
- Avoiding patterns? YES (no unnecessary Repository/UoW - using Drizzle directly)

**Architecture**:

- EVERY feature as library? N/A (extending existing web app, not creating standalone libraries)
- Libraries listed: N/A (web app extension)
- CLI per library: N/A (web app features)
- Library docs: N/A (web app documentation in README/specs)

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? YES (tests written first, must fail before implementation)
- Git commits show tests before implementation? YES (will follow TDD strictly)
- Order: Contract→Integration→E2E→Unit strictly followed? YES (API contracts, role integration, UI e2e, component unit)
- Real dependencies used? YES (actual PostgreSQL, Clerk auth, no mocks for integration)
- Integration tests for: role system changes, new permission checks, audit logging, UI role guards? YES
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included? YES (audit trail for all Director actions)
- Frontend logs → backend? YES (role access attempts, permission denials)
- Error context sufficient? YES (detailed role/permission error messages)

**Versioning**:

- Version number assigned? 0.0.2 (MINOR increment for new role feature)
- BUILD increments on every change? YES (following semver)
- Breaking changes handled? N/A (additive feature, no breaking changes)

## Project Structure

### Documentation (this feature)

```
specs/003-add-director-role/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (Next.js app router)
app/
├── (authenticated)/
│   ├── dashboard/          # Manager interface (extend for Director)
│   ├── staff/              # Sales staff interface (restrict for Director)
│   └── director/           # NEW: Director-specific interface
└── api/                    # Server-side API routes (extend role checks)

actions/
├── auth.ts                 # EXTEND: Add Director role support
├── reports.ts              # EXTEND: Director access controls
├── inventory.ts            # EXTEND: Read-only for Director
└── users.ts                # EXTEND: Director user management

db/schema/
├── users.ts                # EXTEND: Add director role enum
└── audit-logs.ts           # NEW: Director action logging

middleware.ts               # EXTEND: Director route protection

components/
├── auth/                   # EXTEND: Director role guards
├── dashboard/              # EXTEND: Director-specific components
└── ui/                     # Existing Shadcn components
```

**Structure Decision**: Option 2 (Web application) - extending existing Next.js app structure

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - Research Clerk role extension patterns for custom roles beyond built-in types
   - Best practices for role-based middleware in Next.js 15 app router
   - Audit logging implementation patterns in Next.js with PostgreSQL
   - Permission system design for hierarchical role access (Director > Manager > Staff)

2. **Generate and dispatch research agents**:

   ```
   For Clerk custom roles:
     Task: "Research Clerk custom role implementation for Director role in Next.js app router"
   For role-based middleware:
     Task: "Find best practices for extending Next.js middleware for custom role protection"
   For audit logging:
     Task: "Research audit trail implementation patterns for compliance in Next.js with PostgreSQL"
   For permission hierarchy:
     Task: "Find permission system design patterns for role inheritance and restriction modeling"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Director Role entity (extends user role enum)
   - Role Permissions entity (permission matrix for Director vs Manager vs Staff)
   - Audit Log Entries entity (action logging for compliance)
   - Minimum Admin Policy entity (system constraint for Director count)

2. **Generate API contracts** from functional requirements:

   - Role management endpoints: GET/POST/PATCH /api/users/{id}/role
   - Director permission checks: GET /api/auth/permissions
   - Audit log endpoints: GET /api/audit-logs, POST /api/audit-logs
   - User management for Directors: GET/POST/PATCH/DELETE /api/admin/users
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - Role assignment validation tests
   - Permission matrix verification tests
   - Audit logging functionality tests
   - Director access control tests
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Director dashboard access scenario
   - Director user management scenario
   - Director inventory read-only scenario
   - Director sales restriction scenario
   - Minimum Director policy scenario

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh claude` for Claude assistant
   - Add Director role implementation context
   - Preserve existing patterns between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API contract → contract test task [P]
- Each data entity → schema migration task [P]
- Each user story → integration test task
- Each UI component → component test + implementation task
- Role system tasks → extend auth actions, middleware, components

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Schema → Auth → API → UI
- Mark [P] for parallel execution (independent files)
- Critical path: Role enum → Permission checks → UI components

**Estimated Output**: 28-35 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations identified_

The implementation extends existing patterns (Clerk roles, Next.js middleware, Drizzle schema) without introducing new architectural complexity. The Director role follows the same patterns as existing Manager/Staff roles with different permission sets.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (2 remaining minor clarifications can be resolved during implementation)
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
