import { decimal, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { shiftStatus } from "./enums"
import { stations } from "./stations"
import { users } from "./users"

export const shifts = pgTable("shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  status: shiftStatus("status").default("active").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  openingCash: decimal("opening_cash", { precision: 10, scale: 2 }),
  closingCash: decimal("closing_cash", { precision: 10, scale: 2 }),
  expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  transactionCount: decimal("transaction_count", { precision: 10, scale: 0 })
    .default("0")
    .notNull(),
  notes: text("notes"),
  handoverNotes: text("handover_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertShift = typeof shifts.$inferInsert
export type SelectShift = typeof shifts.$inferSelect
