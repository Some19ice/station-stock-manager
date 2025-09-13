# Tasks: Refactor PMS Sales Capture System

**Input**: Design documents from `/Users/yakky/Dev/station-stock-manager/specs/002-refactor-pms-sales/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```text
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript 5.x, Next.js 15.3.3, React 19.0.0, Drizzle ORM
   → Structure: Next.js web app (app/, actions/, components/, db/)
2. Load design documents ✅:
   → data-model.md: 4 entities extracted → 4 model tasks
   → contracts/: 3 files extracted → 3 contract test tasks
   → research.md: Rollover handling, time windows, deviations extracted
   → quickstart.md: 6 scenarios extracted → 6 integration test tasks
3. Generate tasks by category ✅:
   → Setup: DB migrations, dependencies, linting
   → Tests: 3 contract tests, 6 integration tests, unit tests
   → Core: 4 models, 3 server actions, business logic
   → Integration: Dashboard, reports, real-time updates
   → Polish: E2E tests, performance validation, documentation
4. Apply task rules ✅:
   → Different files marked [P] for parallel
   → Same file sequential (no [P])
   → Tests before implementation (TDD enforced)
5. Number tasks sequentially (T001-T045) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness ✅:
   → All 3 contracts have tests ✅
   → All 4 entities have models ✅
   → All 11 endpoints implemented ✅
9. Return: SUCCESS (tasks ready for execution) ✅
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Paths assume Next.js structure: `app/`, `actions/`, `components/`, `db/`, `__tests__/`

## Phase 3.1: Setup & Dependencies

- [ ] T001 Create database schema migrations for 4 new tables (pump_configurations, pump_meter_readings, daily_pms_calculations, pms_sales_records)
- [ ] T002 [P] Add Zod validation schemas in `lib/utils.ts` for pump configuration, meter readings, and calculations
- [ ] T003 [P] Configure ESLint rules for new PMS modules in `eslint.config.mjs`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel)

- [ ] T004 [P] Contract test Pump Configuration API in `__tests__/contracts/pump-configuration-api.test.ts`
- [ ] T005 [P] Contract test Meter Readings API in `__tests__/contracts/meter-readings-api.test.ts`
- [ ] T006 [P] Contract test PMS Calculations API in `__tests__/contracts/pms-calculations-api.test.ts`

### Integration Tests (Parallel - different scenarios)

- [ ] T007 [P] Integration test daily meter reading workflow in `__tests__/integration/meter-reading-workflow.test.ts`
- [ ] T008 [P] Integration test meter rollover handling in `__tests__/integration/meter-rollover.test.ts`
- [ ] T009 [P] Integration test estimated reading approval in `__tests__/integration/estimated-reading-approval.test.ts`
- [ ] T010 [P] Integration test deviation detection in `__tests__/integration/deviation-detection.test.ts`
- [ ] T011 [P] Integration test report integration (preserving lubricant sales) in `__tests__/integration/report-integration.test.ts`
- [ ] T012 [P] Integration test modification window enforcement in `__tests__/integration/modification-window.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Schema & Models (Parallel)

- [ ] T013 [P] Pump Configuration schema in `db/schema/pump-configurations.ts`
- [ ] T014 [P] Pump Meter Reading schema in `db/schema/pump-meter-readings.ts`
- [ ] T015 [P] Daily PMS Calculation schema in `db/schema/daily-pms-calculations.ts`
- [ ] T016 [P] PMS Sales Record schema in `db/schema/pms-sales-records.ts`
- [ ] T017 Apply database migrations with `npx drizzle-kit generate && npx drizzle-kit migrate`

### Server Actions & Business Logic (Sequential - shared files)

- [ ] T018 Pump configuration server actions in `actions/pump-configurations.ts`
- [ ] T019 Meter reading server actions in `actions/meter-readings.ts`
- [ ] T020 PMS calculation engine in `actions/pms-calculations.ts`
- [ ] T021 Meter reading validation logic (rollover detection, time windows) in `actions/meter-readings.ts`
- [ ] T022 PMS calculation algorithms (volume calculation, deviation detection) in `actions/pms-calculations.ts`
- [ ] T023 Estimation fallback mechanisms in `actions/pms-calculations.ts`

### API Endpoints (Sequential - same route files)

- [ ] T024 GET /api/pump-configurations endpoint in `app/api/pump-configurations/route.ts`
- [ ] T025 POST /api/pump-configurations endpoint in `app/api/pump-configurations/route.ts`
- [ ] T026 PUT /api/pump-configurations/[pumpId] endpoint in `app/api/pump-configurations/[pumpId]/route.ts`
- [ ] T027 PATCH /api/pump-configurations/[pumpId]/status endpoint in `app/api/pump-configurations/[pumpId]/status/route.ts`
- [ ] T028 GET /api/meter-readings endpoint in `app/api/meter-readings/route.ts`
- [ ] T029 POST /api/meter-readings endpoint in `app/api/meter-readings/route.ts`
- [ ] T030 PUT /api/meter-readings/[readingId] endpoint in `app/api/meter-readings/[readingId]/route.ts`
- [ ] T031 POST /api/meter-readings/bulk endpoint in `app/api/meter-readings/bulk/route.ts`
- [ ] T032 GET /api/meter-readings/daily-status endpoint in `app/api/meter-readings/daily-status/route.ts`
- [ ] T033 GET /api/pms-calculations endpoint in `app/api/pms-calculations/route.ts`
- [ ] T034 POST /api/pms-calculations endpoint in `app/api/pms-calculations/route.ts`
- [ ] T035 POST /api/pms-calculations/[calculationId]/approve endpoint in `app/api/pms-calculations/[calculationId]/approve/route.ts`
- [ ] T036 POST /api/pms-calculations/rollover endpoint in `app/api/pms-calculations/rollover/route.ts`
- [ ] T037 GET /api/pms-calculations/deviations endpoint in `app/api/pms-calculations/deviations/route.ts`

## Phase 3.4: UI Components (Parallel - different components)

- [ ] T038 [P] Meter reading entry form component in `components/pms/meter-reading-form.tsx`
- [ ] T039 [P] Daily calculation dashboard component in `components/pms/daily-calculation-dashboard.tsx`
- [ ] T040 [P] Pump status management component in `components/pms/pump-status-management.tsx`
- [ ] T041 [P] Deviation alerts component in `components/pms/deviation-alerts.tsx`
- [ ] T042 [P] Rollover handling dialog component in `components/pms/rollover-dialog.tsx`

## Phase 3.5: Integration & Polish

- [ ] T043 Update existing reports to use meter-based PMS calculations in `actions/reports.ts`
- [ ] T044 Update dashboard metrics to include meter-based data in `actions/dashboard.ts`
- [ ] T045 E2E test complete quickstart workflow in `e2e/pms-sales-workflow.spec.ts`

## Dependencies

```text
Setup (T001-T003) → Tests (T004-T012) → Models (T013-T017) → Actions (T018-T023) → APIs (T024-T037) → UI (T038-T042) → Integration (T043-T045)

Critical Dependencies:
- T017 (migrations) blocks T018-T023 (server actions need DB tables)
- T018-T023 (server actions) block T024-T037 (API endpoints use actions)
- T024-T037 (API endpoints) block T038-T042 (UI components call APIs)
- T038-T042 (UI components) block T045 (E2E tests need UI)
```

## Parallel Execution Examples

### Phase 3.2: Contract Tests (Run Together)

```bash
# Launch T004-T006 simultaneously:
Task: "Contract test Pump Configuration API in __tests__/contracts/pump-configuration-api.test.ts"
Task: "Contract test Meter Readings API in __tests__/contracts/meter-readings-api.test.ts"
Task: "Contract test PMS Calculations API in __tests__/contracts/pms-calculations-api.test.ts"
```

### Phase 3.2: Integration Tests (Run Together)

```bash
# Launch T007-T012 simultaneously:
Task: "Integration test daily meter reading workflow in __tests__/integration/meter-reading-workflow.test.ts"
Task: "Integration test meter rollover handling in __tests__/integration/meter-rollover.test.ts"
Task: "Integration test estimated reading approval in __tests__/integration/estimated-reading-approval.test.ts"
Task: "Integration test deviation detection in __tests__/integration/deviation-detection.test.ts"
Task: "Integration test report integration in __tests__/integration/report-integration.test.ts"
Task: "Integration test modification window enforcement in __tests__/integration/modification-window.test.ts"
```

### Phase 3.3: Database Models (Run Together)

```bash
# Launch T013-T016 simultaneously:
Task: "Pump Configuration schema in db/schema/pump-configurations.ts"
Task: "Pump Meter Reading schema in db/schema/pump-meter-readings.ts"
Task: "Daily PMS Calculation schema in db/schema/daily-pms-calculations.ts"
Task: "PMS Sales Record schema in db/schema/pms-sales-records.ts"
```

### Phase 3.4: UI Components (Run Together)

```bash
# Launch T038-T042 simultaneously:
Task: "Meter reading entry form component in components/pms/meter-reading-form.tsx"
Task: "Daily calculation dashboard component in components/pms/daily-calculation-dashboard.tsx"
Task: "Pump status management component in components/pms/pump-status-management.tsx"
Task: "Deviation alerts component in components/pms/deviation-alerts.tsx"
Task: "Rollover handling dialog component in components/pms/rollover-dialog.tsx"
```

## Validation Checklist

_GATE: Checked before marking feature complete_

### Contract Coverage

- [x] All 3 contract files have corresponding test tasks (T004-T006)
- [x] All 11 API endpoints have implementation tasks (T024-T037)

### Data Model Coverage

- [x] All 4 entities have schema creation tasks (T013-T016)
- [x] All business logic scenarios have validation tasks (T021-T023)

### TDD Compliance

- [x] All tests come before implementation (T004-T012 before T013+)
- [x] Contract tests validate all API schemas and responses
- [x] Integration tests cover all quickstart scenarios

### Parallel Task Independence

- [x] All [P] tasks modify different files or independent modules
- [x] No [P] task depends on another [P] task's output
- [x] Sequential tasks clearly specify file-level dependencies

### Performance & Quality Gates

- [x] Performance validation included (meter reading <200ms, calculation <1s)
- [x] E2E validation covers complete user workflows
- [x] Integration with existing systems preserved (lubricant sales)

## Notes

- **TDD Enforcement**: Tests T004-T012 must fail before starting T013
- **Real Database**: All integration tests use actual PostgreSQL, not mocks
- **Backwards Compatibility**: Existing transaction-based lubricant workflow preserved
- **Audit Trail**: All meter reading modifications tracked with timestamps
- **Error Handling**: Zod validation with structured error responses
- **Performance**: <200ms API responses, <500ms dashboard updates

## Critical Success Factors

1. **Rollover Detection**: Automatic detection when closing < opening reading
2. **Time Window Validation**: Modifications blocked after 6 AM next day
3. **Deviation Alerts**: 20% variance from 7-day average triggers investigation
4. **Manager Approval**: Required for estimated calculations and manual overrides
5. **Real-time Integration**: Dashboard updates immediately after calculations
6. **Data Integrity**: Pump readings → calculations → aggregated reports pipeline
