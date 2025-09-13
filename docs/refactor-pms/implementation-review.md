## PMS Sales Refactor — Implementation Review

**Branch**: `002-refactor-pms-sales`  
**Date**: 2025-09-13  
**Scope**: Aligns feature with `specs/002-refactor-pms-sales/*` (spec, plan, data model, contracts, tasks)

### Executive Summary

- **Overall**: Core PMS refactor (meter-based sales from pump readings) is largely implemented across schema, actions, APIs, UI, and dashboard/reports integration. Contract and integration tests exist.
- **Quality**: Solid architecture, good validation, and clear UX patterns. A few correctness bugs and missing DB constraints/indexes should be addressed before production.
- **Priority fixes**: (1) Variable shadowing bug in `actions/reports.ts`, (2) Missing `selectedDate` prop in manager calculations page, (3) Add DB unique constraints + indexes promised in data-model, (4) Revisit rollover heuristic and threshold hardcoding, (5) Minor N+1s and robustness improvements.

---

### Implementation Status vs Spec

- **Database (Drizzle + migrations)**

  - Added entities per spec: `pump_configurations`, `pump_meter_readings`, `daily_pms_calculations`, `pms_sales_records` in `db/schema/*` and migration `db/migrations/0008_broken_venus.sql`.
  - Good field coverage (audit, rollover, estimation, deviation, approval).
  - ❗ Missing DB-level guarantees promised in `data-model.md`:
    - Unique constraints:
      - One reading per pump/date/type (`pump_id`, `reading_date`, `reading_type`).
      - One calculation per pump/date (`pump_id`, `calculation_date`).
      - One station record per date (`station_id`, `record_date`).
    - Indexes for query performance:
      - `pump_meter_readings (pump_id, reading_date, reading_type)`
      - `daily_pms_calculations (pump_id, calculation_date)`
      - `pms_sales_records (station_id, record_date)`

- **Server Actions**

  - `actions/pump-configurations.ts`: CRUD + status updates with Zod validation and auth.
  - `actions/meter-readings.ts`: create/update/bulk, duplicate checks, capacity checks, time-window rule, triggers auto calculation; good structure.
  - `actions/pms-calculations.ts`: per-pump calculation, rollover detection, deviation calc, estimation fallback, approve + rollover confirmation, station rollup; well organized.

- **API Routes**

  - Implemented for pump configurations, meter readings (incl. bulk, daily status), PMS calculations (GET/POST, deviations, approve, rollover). Input validation is thorough.

- **UI**

  - Manager pages at `app/(authenticated)/dashboard/meter-readings/page.tsx` providing tabs: readings, calculations, pump management, alerts.
  - Staff page at `app/(authenticated)/staff/meter-readings/page.tsx` with simplified flow.
  - Components under `components/pms/*`: forms, dashboard, alerts, pump status, rollover dialog (present).

- **Dashboard & Reports**

  - `actions/dashboard.ts` integrates PMS metrics, deviation counts, and meter reading status; exposes a dedicated `getPmsDashboardMetrics` aggregation.
  - `actions/reports.ts` includes meter-based PMS sections in daily + range reports and preserves backward-compatible transaction fallback when needed.

- **Testing**
  - Contract tests present: `__tests__/contracts/*.test.ts` for pump configurations, meter readings, PMS calculations.
  - Integration tests present: `__tests__/integration/*.test.ts` for workflow, rollover, estimated approvals, deviations, modification window, report integration.
  - E2E spec present: `e2e/pms-sales-workflow.spec.ts`.
  - Note: Did not execute tests; ensure they run green after fixes below.

---

### Notable Issues & Bugs

- **1) Variable shadowing breaks PMS report range API logic**
  - In `actions/reports.ts`, the local constant name collides with the imported table identifier, causing a TDZ/shadowing error and broken logic in the PMS range report:

```actions/reports.ts
// Get PMS sales records for the date range
const pmsSalesRecords = await db
  .select()
  .from(pmsSalesRecords)
  .where(
    and(
      eq(pmsSalesRecords.stationId, stationId),
      gte(pmsSalesRecords.recordDate, startDateStr),
      lte(pmsSalesRecords.recordDate, endDateStr)
    )
  )
```

- Fix: Rename the local collection (e.g., `records`) and reference the imported table alias consistently.

- **2) Manager calculations page omits required `selectedDate`**
  - `DailyCalculationDashboard` expects `selectedDate`, but the manager page passes only `stationId`, causing API date validation failures:

```app/(authenticated)/dashboard/meter-readings/page.tsx
<TabsContent value="calculations" className="space-y-6">
  <DailyCalculationDashboard key={refreshKey} stationId={station.id} />
</TabsContent>
```

- Fix: Pass the same `selectedDate` state used for readings to the calculations tab.

- **3) Upsert without supporting unique constraint**
  - The station-level rollup uses `onConflictDoUpdate` on `(station_id, record_date)` but the table lacks a unique constraint on those columns:

```actions/pms-calculations.ts
await db
  .insert(pmsSalesRecords)
  .values({...})
  .onConflictDoUpdate({
    target: [pmsSalesRecords.stationId, pmsSalesRecords.recordDate],
    set: { ... }
  })
```

- And schema shows no unique index:

```db/schema/pms-sales-records.ts
export const pmsSalesRecords = pgTable("pms_sales_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")...,   // no unique (stationId, recordDate)
  recordDate: date("record_date").notNull(),
  ...
})
```

- Fix: Add unique index/constraint in schema + migration for `(station_id, record_date)`.

- **4) Missing unique constraints on daily calculations and readings**

  - Spec requires one reading per pump/date/type and one calculation per pump/date. Application checks duplicates, but DB does not enforce it. Add unique constraints and supporting indexes.

- **5) Rollover detection heuristic can undercount**
  - Current heuristic only treats as rollover when `totalVolume <= 50% of capacity`. High-volume days crossing rollover by >50% capacity will be misclassified:

```actions/pms-calculations.ts
if (totalVolume <= meterCapacity * 0.5) {
  return { volumeDispensed: totalVolume, hasRollover: true, rolloverValue: meterCapacity }
}
return { volumeDispensed: Math.abs(closingValue - openingValue), hasRollover: false }
```

- Fix: Prefer explicit rollover confirmation path when `closing < opening`; or compute both paths and flag for review; or model-of-pump-odometer style logic with capacity-aware wrap.

- **6) Hardcoded thresholds sprinkled across code**
  - Deviation threshold (20%) appears in queries and UI logic; should be configurable per station or global setting:

```actions/dashboard.ts
sql`ABS(CAST(${dailyPmsCalculations.deviationFromAverage} AS DECIMAL)) >= 20`
```

- Fix: Centralize in config (DB or env) and thread through queries and UI.

- **7) Minor N+1 patterns**
  - In station rollup, pump numbers are fetched per calculation in a loop:

```actions/pms-calculations.ts
for (const pumpCalc of pumpCalculations) {
  const [pump] = await db
    .select({ pumpNumber: pumpConfigurations.pumpNumber })
    .from(pumpConfigurations)
    .where(eq(pumpConfigurations.id, pumpCalc.pumpId))
  if (pump) pumpCalc.pumpNumber = pump.pumpNumber
}
```

- Fix: Join once to enrich calculations or prefetch pump map.

- **8) Time-window helper ignores `recordedAt` parameter**
  - `canModifyReading(recordedAt, readingDate)` never uses `recordedAt`:

```actions/meter-readings.ts
export async function canModifyReading(recordedAt: Date, readingDate: string): Promise<boolean> {
  const now = new Date()
  const reading = new Date(readingDate)
  // ...
  return now < nextBusinessDay
}
```

- Fix: Remove unused param or enforce more precise cutoff using actual `recordedAt`.

- **9) Indexes absent in migration**
  - `data-model.md` lists index requirements but `0008_broken_venus.sql` does not create them. Add in a follow-up migration for performance and to match contract.

---

### Performance & Data Integrity

- **Add composite indexes** per data-model for reads that filter by station/date/pump.
- **Batch operations**: Prefer batch selects/joins for per-pump loops (calculations, rollups) to reduce round-trips.
- **Upserts**: Ensure unique constraints exist wherever upsert is used.
- **Numeric precision**: Continue storing `decimal` as strings; parse only at boundaries; centralize numeric parsing/formatting helpers.

---

### Security & Validation

- **Auth**: API routes consistently guard with Clerk; server actions redirect to sign-in if needed — consistent.
- **Zod**: Strong input validation coverage. Consider:
  - Reasonable delta checks between opening/closing (reject absurd jumps unless flagged estimated/rollover).
  - Enforce reading ordering (opening before closing for the same date).
  - Deny readings when pump `status != active`.
- **Audit**: Reading modifications tracked; consider structured audit logging for approvals/rejections and rollovers.

---

### UI/UX Enhancements

- **Manager Meter Readings**

  - Pass `selectedDate` to calculations tab so the manager can calculate/inspect the same day without reselecting.
  - Add inline hints/skeletons for bulk load/submit states and daily status overview (how many pumps left, which ones).

- **Forms**

  - Keyboard flows (Enter to submit per pump, Tab to advance), numeric keypad on mobile, optional stepper for 0.1.
  - Smart validation: highlight outliers vs 7-day average with contextual help and quick actions (mark estimated, request approval).

- **Alerts & Dashboards**

  - Make deviation threshold configurable from UI; show why a deviation is flagged (baseline and percent).
  - Add quick links from dashboard alerts to the exact calculation row.

- **Staff Experience**

  - Show per-pump checklist for which closing readings remain; small-screen optimizations, sticky actions.

- **Accessibility**
  - Ensure inputs have `aria-*` labels, focus outlines, and live regions for async feedback.

---

### Recommendations & Next Steps (Prioritized)

1. Fix `actions/reports.ts` variable shadowing to restore PMS range reporting.
2. Pass `selectedDate` prop in manager calculations tab; validate flow end-to-end.
3. Add migrations for missing unique constraints and indexes:
   - Unique: readings (pump_id, reading_date, reading_type), calculations (pump_id, calculation_date), records (station_id, record_date).
   - Indexes: as listed under Status.
4. Revisit rollover logic: treat any `closing < opening` as rollover by default (capacity-aware) with an override path; or gate via confirmation dialog.
5. Externalize thresholds (deviation %, modification window hours, historical days) into configuration per station.
6. Remove minor N+1s and standardize error codes/messages via shared utilities.
7. Add targeted unit tests for rollover edge cases and the modified constraints; run contract/integration tests and update as needed.

---

### Appendix — References

- Spec Docs: `specs/002-refactor-pms-sales/spec.md`, `plan.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `tasks.md`
- Actions: `actions/pump-configurations.ts`, `actions/meter-readings.ts`, `actions/pms-calculations.ts`, `actions/dashboard.ts`, `actions/reports.ts`
- API: `app/api/pump-configurations/*`, `app/api/meter-readings/*`, `app/api/pms-calculations/*`
- UI: `app/(authenticated)/dashboard/meter-readings/page.tsx`, `app/(authenticated)/staff/meter-readings/page.tsx`, `components/pms/*`
- Schema: `db/schema/*`, Migration: `db/migrations/0008_broken_venus.sql`
- Tests: `__tests__/contracts/*`, `__tests__/integration/*`, `e2e/pms-sales-workflow.spec.ts`
