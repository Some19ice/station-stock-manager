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
  customersRelations,
  stationsRelations,
  usersRelations,
  suppliersRelations,
  productsRelations,
  transactionsRelations,
  transactionItemsRelations,
  stockMovementsRelations
} from "./schema"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
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
  // relations
  customersRelations,
  stationsRelations,
  usersRelations,
  suppliersRelations,
  productsRelations,
  transactionsRelations,
  transactionItemsRelations,
  stockMovementsRelations
}

function initializeDb(url: string) {
  const client = postgres(url, { prepare: false })
  return drizzlePostgres(client, { schema: dbSchema })
}

export const db = initializeDb(databaseUrl)
