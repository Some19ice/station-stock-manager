import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { auditActionType, auditResourceType } from "./enums"
import { users } from "./users"
import { stations } from "./stations"

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  actionType: auditActionType("action_type").notNull(),
  resourceType: auditResourceType("resource_type").notNull(),
  resourceId: uuid("resource_id"),
  details: jsonb("details").default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  stationId: uuid("station_id")
    .references(() => stations.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertAuditLog = typeof auditLogs.$inferInsert
export type SelectAuditLog = typeof auditLogs.$inferSelect
