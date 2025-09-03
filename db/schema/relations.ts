import { relations } from "drizzle-orm"
import { customers } from "./customers"
import { stations } from "./stations"
import { users } from "./users"
import { suppliers } from "./suppliers"
import { products } from "./products"
import { transactions } from "./transactions"
import { transactionItems } from "./transaction-items"
import { stockMovements } from "./stock-movements"

// Customer relations
export const customersRelations = relations(customers, ({ many }) => ({
  stations: many(stations)
}))

// Station relations
export const stationsRelations = relations(stations, ({ one, many }) => ({
  customer: one(customers, {
    fields: [stations.customerId],
    references: [customers.id]
  }),
  users: many(users),
  suppliers: many(suppliers),
  products: many(products),
  transactions: many(transactions)
}))

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  station: one(stations, {
    fields: [users.stationId],
    references: [stations.id]
  }),
  transactions: many(transactions)
}))

// Supplier relations
export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  station: one(stations, {
    fields: [suppliers.stationId],
    references: [stations.id]
  }),
  products: many(products)
}))

// Product relations
export const productsRelations = relations(products, ({ one, many }) => ({
  station: one(stations, {
    fields: [products.stationId],
    references: [stations.id]
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id]
  }),
  transactionItems: many(transactionItems),
  stockMovements: many(stockMovements)
}))

// Transaction relations
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    station: one(stations, {
      fields: [transactions.stationId],
      references: [stations.id]
    }),
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id]
    }),
    items: many(transactionItems)
  })
)

// Transaction Item relations
export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id]
    }),
    product: one(products, {
      fields: [transactionItems.productId],
      references: [products.id]
    })
  })
)

// Stock Movement relations
export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id]
  })
}))
