import {
  boolean,
  date,
  decimal,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  unique,
  index
} from "drizzle-orm/pg-core"
import { pumpConfigurations } from "./pump-configurations"
import { users } from "./users"

export const calculationMethod = pgEnum("calculation_method", [
  "meter_readings",
  "estimated",
  "manual_override"
])

export const dailyPmsCalculations = pgTable("daily_pms_calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  pumpId: uuid("pump_id")
    .references(() => pumpConfigurations.id)
    .notNull(),
  calculationDate: date("calculation_date").notNull(),
  openingReading: decimal("opening_reading", {
    precision: 10,
    scale: 1
  }).notNull(),
  closingReading: decimal("closing_reading", {
    precision: 10,
    scale: 1
  }).notNull(),
  volumeDispensed: decimal("volume_dispensed", {
    precision: 10,
    scale: 1
  }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  hasRollover: boolean("has_rollover").default(false).notNull(),
  rolloverValue: decimal("rollover_value", { precision: 10, scale: 1 }),
  deviationFromAverage: decimal("deviation_from_average", {
    precision: 5,
    scale: 2
  }).notNull(),
  isEstimated: boolean("is_estimated").default(false).notNull(),
  calculationMethod: calculationMethod("calculation_method")
    .default("meter_readings")
    .notNull(),
  calculatedBy: uuid("calculated_by")
    .references(() => users.id)
    .notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  uniqueCalculationPerPumpDate: unique("unique_calculation_per_pump_date").on(
    table.pumpId,
    table.calculationDate
  ),
  calculationsLookupIdx: index("calculations_lookup_idx").on(
    table.pumpId,
    table.calculationDate
  )
}))

export type InsertDailyPmsCalculation = typeof dailyPmsCalculations.$inferInsert
export type SelectDailyPmsCalculation = typeof dailyPmsCalculations.$inferSelect
