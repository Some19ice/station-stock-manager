import { decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { syncStatus } from "./enums"
import { stations } from "./stations"
import { users } from "./users"

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  syncStatus: syncStatus("sync_status").default("synced").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertTransaction = typeof transactions.$inferInsert
export type SelectTransaction = typeof transactions.$inferSelect
