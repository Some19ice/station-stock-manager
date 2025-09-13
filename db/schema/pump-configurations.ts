import {
  boolean,
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { stations } from "./stations"
import { products } from "./products"

export const pumpStatus = pgEnum("pump_status", [
  "active",
  "maintenance",
  "calibration",
  "repair"
])

export const pumpConfigurations = pgTable("pump_configurations", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  pmsProductId: uuid("pms_product_id")
    .references(() => products.id)
    .notNull(),
  pumpNumber: text("pump_number").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  meterCapacity: decimal("meter_capacity", {
    precision: 10,
    scale: 1
  }).notNull(),
  installDate: date("install_date").notNull(),
  lastCalibrationDate: date("last_calibration_date"),
  status: pumpStatus("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertPumpConfiguration = typeof pumpConfigurations.$inferInsert
export type SelectPumpConfiguration = typeof pumpConfigurations.$inferSelect
