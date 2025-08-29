import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { stations } from "./stations"

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id").references(() => stations.id).notNull(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertSupplier = typeof suppliers.$inferInsert
export type SelectSupplier = typeof suppliers.$inferSelect