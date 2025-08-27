import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { customers } from "./customers"

export const stations = pgTable("stations", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertStation = typeof stations.$inferInsert
export type SelectStation = typeof stations.$inferSelect