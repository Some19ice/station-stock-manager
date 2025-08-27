import { decimal, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { movementType } from "./enums"
import { products } from "./products"

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  movementType: movementType("movement_type").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  previousStock: decimal("previous_stock", { precision: 10, scale: 2 }).notNull(),
  newStock: decimal("new_stock", { precision: 10, scale: 2 }).notNull(),
  reference: text("reference"), // Transaction ID or adjustment reason
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertStockMovement = typeof stockMovements.$inferInsert
export type SelectStockMovement = typeof stockMovements.$inferSelect