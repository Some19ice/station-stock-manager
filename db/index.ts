import { config } from "dotenv"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
  customers,
  stations,
  users,
  suppliers,
  products,
  transactions,
  transactionItems,
  stockMovements,
  themeSettings,
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations,
  pmsSalesRecords,
  customersRelations,
  stationsRelations,
  usersRelations,
  suppliersRelations,
  productsRelations,
  transactionsRelations,
  transactionItemsRelations,
  stockMovementsRelations,
  pumpConfigurationsRelations,
  pumpMeterReadingsRelations,
  dailyPmsCalculationsRelations,
  pmsSalesRecordsRelations
} from "./schema"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.warn("DATABASE_URL is not set, using fallback")
}

const dbSchema = {
  // tables
  customers,
  stations,
  users,
  suppliers,
  products,
  transactions,
  transactionItems,
  stockMovements,
  themeSettings,
  pumpConfigurations,
  pumpMeterReadings,
  dailyPmsCalculations,
  pmsSalesRecords,
  // relations
  customersRelations,
  stationsRelations,
  usersRelations,
  suppliersRelations,
  productsRelations,
  transactionsRelations,
  transactionItemsRelations,
  stockMovementsRelations,
  pumpConfigurationsRelations,
  pumpMeterReadingsRelations,
  dailyPmsCalculationsRelations,
  pmsSalesRecordsRelations
}

function initializeDb(url: string) {
  try {
    const client = postgres(url, { 
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    })
    return drizzlePostgres(client, { schema: dbSchema })
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

function getDb() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set - check your environment variables")
  }
  return initializeDb(databaseUrl)
}

export const db = getDb()
