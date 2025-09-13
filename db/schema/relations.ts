import { relations } from "drizzle-orm"
import { customers } from "./customers"
import { stations } from "./stations"
import { users } from "./users"
import { suppliers } from "./suppliers"
import { products } from "./products"
import { transactions } from "./transactions"
import { transactionItems } from "./transaction-items"
import { stockMovements } from "./stock-movements"
import { pumpConfigurations } from "./pump-configurations"
import { pumpMeterReadings } from "./pump-meter-readings"
import { dailyPmsCalculations } from "./daily-pms-calculations"
import { pmsSalesRecords } from "./pms-sales-records"

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
  transactions: many(transactions),
  pumpConfigurations: many(pumpConfigurations),
  pmsSalesRecords: many(pmsSalesRecords)
}))

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  station: one(stations, {
    fields: [users.stationId],
    references: [stations.id]
  }),
  transactions: many(transactions),
  pumpMeterReadingsRecorded: many(pumpMeterReadings, {
    relationName: "recordedBy"
  }),
  pumpMeterReadingsModified: many(pumpMeterReadings, {
    relationName: "modifiedBy"
  }),
  calculationsCreated: many(dailyPmsCalculations, {
    relationName: "calculatedBy"
  }),
  calculationsApproved: many(dailyPmsCalculations, {
    relationName: "approvedBy"
  })
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
  stockMovements: many(stockMovements),
  pumpConfigurations: many(pumpConfigurations)
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

// Pump Configuration relations
export const pumpConfigurationsRelations = relations(
  pumpConfigurations,
  ({ one, many }) => ({
    station: one(stations, {
      fields: [pumpConfigurations.stationId],
      references: [stations.id]
    }),
    pmsProduct: one(products, {
      fields: [pumpConfigurations.pmsProductId],
      references: [products.id]
    }),
    meterReadings: many(pumpMeterReadings),
    calculations: many(dailyPmsCalculations)
  })
)

// Pump Meter Reading relations
export const pumpMeterReadingsRelations = relations(
  pumpMeterReadings,
  ({ one }) => ({
    pump: one(pumpConfigurations, {
      fields: [pumpMeterReadings.pumpId],
      references: [pumpConfigurations.id]
    }),
    recordedByUser: one(users, {
      fields: [pumpMeterReadings.recordedBy],
      references: [users.id],
      relationName: "recordedBy"
    }),
    modifiedByUser: one(users, {
      fields: [pumpMeterReadings.modifiedBy],
      references: [users.id],
      relationName: "modifiedBy"
    })
  })
)

// Daily PMS Calculation relations
export const dailyPmsCalculationsRelations = relations(
  dailyPmsCalculations,
  ({ one }) => ({
    pump: one(pumpConfigurations, {
      fields: [dailyPmsCalculations.pumpId],
      references: [pumpConfigurations.id]
    }),
    calculatedByUser: one(users, {
      fields: [dailyPmsCalculations.calculatedBy],
      references: [users.id],
      relationName: "calculatedBy"
    }),
    approvedByUser: one(users, {
      fields: [dailyPmsCalculations.approvedBy],
      references: [users.id],
      relationName: "approvedBy"
    })
  })
)

// PMS Sales Record relations
export const pmsSalesRecordsRelations = relations(
  pmsSalesRecords,
  ({ one }) => ({
    station: one(stations, {
      fields: [pmsSalesRecords.stationId],
      references: [stations.id]
    })
  })
)
