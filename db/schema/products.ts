import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { productType } from "./enums"
import { stations } from "./stations"
import { suppliers } from "./suppliers"

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  name: text("name").notNull(),
  brand: text("brand"),
  type: productType("type").notNull(),
  viscosity: text("viscosity"), // For lubricants (e.g., "10W-40")
  containerSize: text("container_size"), // For lubricants (e.g., "1L", "4L")
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  minThreshold: decimal("min_threshold", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // "litres" for PMS, "units" for lubricants
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertProduct = typeof products.$inferInsert
export type SelectProduct = typeof products.$inferSelect
