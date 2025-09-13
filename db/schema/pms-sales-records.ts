import {
  date,
  decimal,
  integer,
  json,
  pgTable,
  timestamp,
  uuid,
  unique,
  index
} from "drizzle-orm/pg-core"
import { stations } from "./stations"

export const pmsSalesRecords = pgTable("pms_sales_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  recordDate: date("record_date").notNull(),
  totalVolumeDispensed: decimal("total_volume_dispensed", {
    precision: 10,
    scale: 1
  }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  averageUnitPrice: decimal("average_unit_price", {
    precision: 10,
    scale: 2
  }).notNull(),
  pumpCount: integer("pump_count").notNull(),
  estimatedVolumeCount: decimal("estimated_volume_count", {
    precision: 10,
    scale: 1
  })
    .default("0")
    .notNull(),
  calculationDetails: json("calculation_details")
    .$type<{
      pumpCalculations: Array<{
        pumpId: string
        pumpNumber: string
        volume: number
        revenue: number
        isEstimated: boolean
      }>
    }>()
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  uniqueRecordPerStationDate: unique("unique_record_per_station_date").on(
    table.stationId,
    table.recordDate
  ),
  pmsRecordsLookupIdx: index("pms_records_lookup_idx").on(
    table.stationId,
    table.recordDate
  )
}))

export type InsertPmsSalesRecord = typeof pmsSalesRecords.$inferInsert
export type SelectPmsSalesRecord = typeof pmsSalesRecords.$inferSelect
