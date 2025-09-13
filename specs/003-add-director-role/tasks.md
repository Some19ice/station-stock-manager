# Tasks: Add Director Role

**Input**: Design documents from `/specs/003-add-director-role/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js app router structure at repository root
- Database schema in `db/schema/`
- Server actions in `actions/`
- UI components in `components/`
- App routes in `app/`

## Phase 3.1: Setup

- [ ] T001 Update package.json version to 0.0.2 for Director role feature
- [ ] T002 [P] Configure TypeScript strict mode for new Director role files
- [ ] T003 [P] Update ESLint config to include Director role validation rules

## Phase 3.2: Database Schema (Foundation) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: Database migrations MUST be created and tested before ANY implementation**

- [ ] T004 [P] Create migration to extend userRole enum in `db/migrations/0010_add_director_role.sql`
- [ ] T005 [P] Create audit_logs table migration in `db/migrations/0011_create_audit_logs.sql`
- [ ] T006 [P] Create minimum Director constraint migration in `db/migrations/0012_add_director_constraints.sql`
- [ ] T007 [P] Update `db/schema/enums.ts` to include "director" in userRole enum
- [ ] T008 [P] Create audit logs schema in `db/schema/audit-logs.ts`
- [ ] T009 Update schema index in `db/schema/index.ts` to export audit logs

## Phase 3.3: Permission System & Constants

- [ ] T010 [P] Create permission constants in `lib/permissions.ts`
- [ ] T011 [P] Create role permission matrix in `lib/role-permissions.ts`
- [ ] T012 [P] Create permission validation utilities in `lib/permission-utils.ts`

## Phase 3.4: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.5

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T013 [P] Contract test role management API in `__tests__/contracts/role-management-api.test.ts`
- [ ] T014 [P] Contract test audit logs API in `__tests__/contracts/audit-logs-api.test.ts`
- [ ] T015 [P] Contract test director user management API in `__tests__/contracts/director-user-management-api.test.ts`

## Phase 3.5: Integration Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.6

- [ ] T016 [P] Integration test Director role assignment in `__tests__/integration/director-role-assignment.test.ts`
- [ ] T017 [P] Integration test Director dashboard access in `__tests__/integration/director-dashboard-access.test.ts`
- [ ] T018 [P] Integration test Director sales restriction in `__tests__/integration/director-sales-restriction.test.ts`
- [ ] T019 [P] Integration test Director user management in `__tests__/integration/director-user-management.test.ts`
- [ ] T020 [P] Integration test audit logging flow in `__tests__/integration/audit-logging.test.ts`
- [ ] T021 [P] Integration test minimum Director policy in `__tests__/integration/minimum-director-policy.test.ts`

## Phase 3.6: Server Actions (ONLY after tests are failing)

- [ ] T022 Extend `actions/auth.ts` to support Director role validation
- [ ] T023 [P] Create audit logging service in `actions/audit-logs.ts`
- [ ] T024 Extend `actions/reports.ts` to include Director permissions
- [ ] T025 Extend `actions/inventory.ts` to enforce Director read-only access
- [ ] T026 Extend `actions/sales.ts` to block Director access
- [ ] T027 Extend user management in `actions/auth.ts` for Director capabilities
- [ ] T028 [P] Create supplier management extensions in `actions/suppliers.ts`
- [ ] T029 [P] Create customer management extensions in `actions/customers.ts`

## Phase 3.7: API Routes

- [ ] T030 [P] Create role management API in `app/api/users/[userId]/role/route.ts`
- [ ] T031 [P] Create permissions check API in `app/api/auth/permissions/route.ts`
- [ ] T032 [P] Create audit logs API in `app/api/audit-logs/route.ts`
- [ ] T033 [P] Create audit log detail API in `app/api/audit-logs/[logId]/route.ts`
- [ ] T034 [P] Create audit logs export API in `app/api/audit-logs/export/route.ts`
- [ ] T035 [P] Create admin users API in `app/api/admin/users/route.ts`
- [ ] T036 [P] Create admin user detail API in `app/api/admin/users/[userId]/route.ts`
- [ ] T037 [P] Create bulk user actions API in `app/api/admin/users/bulk-actions/route.ts`
- [ ] T038 [P] Create minimum Directors check API in `app/api/admin/minimum-directors/check/route.ts`

## Phase 3.8: Middleware & Route Protection

- [ ] T039 Update `middleware.ts` to include Director route patterns
- [ ] T040 [P] Create Director route guards in `components/auth/director-guard.tsx`
- [ ] T041 [P] Create permission-based component wrapper in `components/auth/permission-guard.tsx`

## Phase 3.9: Director UI Components

- [ ] T042 [P] Create Director navigation component in `components/dashboard/director-navigation.tsx`
- [ ] T043 [P] Create Director dashboard layout in `app/(authenticated)/director/layout.tsx`
- [ ] T044 [P] Create Director dashboard page in `app/(authenticated)/director/page.tsx`
- [ ] T045 [P] Create Director reports interface in `app/(authenticated)/director/reports/page.tsx`
- [ ] T046 [P] Create Director inventory view in `app/(authenticated)/director/inventory/page.tsx`
- [ ] T047 [P] Create Director user management in `app/(authenticated)/director/users/page.tsx`
- [ ] T048 [P] Create user creation form in `app/(authenticated)/director/users/create/page.tsx`
- [ ] T049 [P] Create user edit form in `app/(authenticated)/director/users/[userId]/page.tsx`
- [ ] T050 [P] Create audit logs viewer in `app/(authenticated)/director/audit-logs/page.tsx`
- [ ] T051 [P] Create supplier management for Director in `app/(authenticated)/director/suppliers/page.tsx`
- [ ] T052 [P] Create customer management for Director in `app/(authenticated)/director/customers/page.tsx`

## Phase 3.10: Supporting UI Components

- [ ] T053 [P] Create role selection dropdown in `components/ui/role-selector.tsx`
- [ ] T054 [P] Create audit log entry component in `components/dashboard/audit-log-entry.tsx`
- [ ] T055 [P] Create permission status indicator in `components/ui/permission-indicator.tsx`
- [ ] T056 [P] Create bulk user action modal in `components/users/bulk-action-modal.tsx`
- [ ] T057 [P] Create Director metrics cards in `components/dashboard/director-metrics.tsx`

## Phase 3.11: Role-Based Component Updates

- [ ] T058 Update `app/(authenticated)/dashboard/_components/app-sidebar.tsx` to hide sales for Director
- [ ] T059 Update user management components to support Director role assignment
- [ ] T060 Update inventory components to be read-only for Director role
- [ ] T061 Update reports components to allow Director access
- [ ] T062 Update supplier/customer components for Director permissions

## Phase 3.12: E2E Tests

- [ ] T063 [P] Create Director role workflow E2E test in `e2e/director-role-workflow.spec.ts`
- [ ] T064 [P] Create Director permissions E2E test in `e2e/director-permissions.spec.ts`
- [ ] T065 [P] Create audit logging E2E test in `e2e/director-audit-logging.spec.ts`

## Phase 3.13: Polish & Documentation

- [ ] T066 [P] Create unit tests for permission utilities in `__tests__/utils/permission-utils.test.ts`
- [ ] T067 [P] Create unit tests for role validation in `__tests__/utils/role-validation.test.ts`
- [ ] T068 [P] Performance test Director dashboard load (<200ms) in `__tests__/performance/director-dashboard.test.ts`
- [ ] T069 [P] Performance test audit log queries (<500ms) in `__tests__/performance/audit-logs.test.ts`
- [ ] T070 Update README.md to document Director role
- [ ] T071 [P] Create Director role documentation in `docs/director-role.md`
- [ ] T072 Run quickstart validation scenarios from `specs/003-add-director-role/quickstart.md`
- [ ] T073 Remove temporary development files and clean up code

## Dependencies

**Critical Path Dependencies:**

- Database Schema (T004-T009) must complete before all other phases
- Permission System (T010-T012) blocks Server Actions (T022-T029)
- Contract Tests (T013-T015) must fail before Server Actions implementation
- Integration Tests (T016-T021) must fail before Server Actions implementation
- Server Actions (T022-T029) block API Routes (T030-T038)
- API Routes (T030-T038) block UI Components (T042-T062)

**Sequential Dependencies:**

- T007 (enum update) blocks T022 (auth.ts extension)
- T008 (audit schema) blocks T023 (audit service)
- T022 (auth extension) blocks T027 (user management)
- T039 (middleware) blocks T040-T041 (route guards)
- T043 (layout) blocks T044-T052 (Director pages)

**Parallel Execution Blocks:**

- Database migrations (T004-T006) can run in parallel
- Contract tests (T013-T015) can run in parallel
- Integration tests (T016-T021) can run in parallel
- API routes (T030-T038) can run in parallel
- UI components (T042-T057) can run in parallel

## Parallel Example

```bash
# Phase 3.2: Database Schema (run together)
Task: "Create migration to extend userRole enum in db/migrations/0010_add_director_role.sql"
Task: "Create audit_logs table migration in db/migrations/0011_create_audit_logs.sql"
Task: "Create minimum Director constraint migration in db/migrations/0012_add_director_constraints.sql"

# Phase 3.4: Contract Tests (run together after schema)
Task: "Contract test role management API in __tests__/contracts/role-management-api.test.ts"
Task: "Contract test audit logs API in __tests__/contracts/audit-logs-api.test.ts"
Task: "Contract test director user management API in __tests__/contracts/director-user-management-api.test.ts"

# Phase 3.9: UI Components (run together after API routes)
Task: "Create Director navigation component in components/dashboard/director-navigation.tsx"
Task: "Create Director dashboard page in app/(authenticated)/director/page.tsx"
Task: "Create Director reports interface in app/(authenticated)/director/reports/page.tsx"
```

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- Database migrations MUST be tested locally before implementation
- All tests MUST fail before writing implementation code
- Commit after each task completion
- Run `npm run lint` and `npm run types` after each phase
- Test migrations with rollback procedures
- Verify Director role constraints work as expected

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:

   - role-management-api.yaml → T013, T030-T031, T038
   - audit-logs-api.yaml → T014, T032-T034
   - director-user-management-api.yaml → T015, T035-T037

2. **From Data Model**:

   - Director Role entity → T004, T007, T022
   - Audit Log Entries → T005, T008, T023
   - Minimum Admin Policy → T006, T021, T038
   - Permission Matrix → T010-T012

3. **From User Stories (Quickstart)**:

   - Director Role Assignment → T016, T027, T048-T049
   - Dashboard Access → T017, T042-T046
   - Sales Restriction → T018, T026, T058
   - User Management → T019, T047-T049
   - Audit Logging → T020, T050, T063-T065
   - Supplier/Customer Management → T051-T052

4. **Ordering**:
   - Setup → Database → Permissions → Tests → Server Actions → API → UI → E2E → Polish
   - TDD strictly enforced with failing tests before implementation

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests (T013-T015)
- [x] All entities have model tasks (T004-T009)
- [x] All tests come before implementation (T013-T021 before T022+)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Database migrations come first (T004-T009)
- [x] Permission system established before server actions (T010-T012 before T022+)
- [x] TDD approach enforced (failing tests before implementation)
