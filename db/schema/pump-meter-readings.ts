import {
  boolean,
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
  index
} from "drizzle-orm/pg-core"
import { pumpConfigurations } from "./pump-configurations"
import { users } from "./users"

export const readingType = pgEnum("reading_type", ["opening", "closing"])
export const estimationMethod = pgEnum("estimation_method", [
  "transaction_based",
  "historical_average",
  "manual"
])

export const pumpMeterReadings = pgTable("pump_meter_readings", {
  id: uuid("id").defaultRandom().primaryKey(),
  pumpId: uuid("pump_id")
    .references(() => pumpConfigurations.id)
    .notNull(),
  readingDate: date("reading_date").notNull(),
  readingType: readingType("reading_type").notNull(),
  meterValue: decimal("meter_value", { precision: 10, scale: 1 }).notNull(),
  recordedBy: uuid("recorded_by")
    .references(() => users.id)
    .notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  isEstimated: boolean("is_estimated").default(false).notNull(),
  estimationMethod: estimationMethod("estimation_method"),
  notes: text("notes"),
  isModified: boolean("is_modified").default(false).notNull(),
  originalValue: decimal("original_value", { precision: 10, scale: 1 }),
  modifiedBy: uuid("modified_by").references(() => users.id),
  modifiedAt: timestamp("modified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueReadingPerPumpDateType: unique("unique_reading_per_pump_date_type").on(
    table.pumpId,
    table.readingDate,
    table.readingType
  ),
  pumpReadingsLookupIdx: index("pump_readings_lookup_idx").on(
    table.pumpId,
    table.readingDate,
    table.readingType
  )
}))

export type InsertPumpMeterReading = typeof pumpMeterReadings.$inferInsert
export type SelectPumpMeterReading = typeof pumpMeterReadings.$inferSelect
