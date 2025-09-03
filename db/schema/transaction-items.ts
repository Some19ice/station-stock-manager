import { decimal, pgTable, uuid } from "drizzle-orm/pg-core"
import { products } from "./products"
import { transactions } from "./transactions"

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull()
})

export type InsertTransactionItem = typeof transactionItems.$inferInsert
export type SelectTransactionItem = typeof transactionItems.$inferSelect
