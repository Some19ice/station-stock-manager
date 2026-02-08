import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const membership = pgEnum("membership", ["free", "pro"])

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").unique().notNull(),
  membership: membership("membership").default("free").notNull(),
  paystackCustomerCode: text("paystack_customer_code").unique(),
  paystackSubscriptionCode: text("paystack_subscription_code").unique(),
  paystackAuthorizationCode: text("paystack_authorization_code"),
  paystackLastPayment: timestamp("paystack_last_payment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertCustomer = typeof customers.$inferInsert
export type SelectCustomer = typeof customers.$inferSelect
