import { pgEnum } from "drizzle-orm/pg-core"

// User role enum for station staff
export const userRole = pgEnum("user_role", ["staff", "manager"])

// Product type enum for different product categories
export const productType = pgEnum("product_type", ["pms", "lubricant"])

// Sync status enum for offline transaction management
export const syncStatus = pgEnum("sync_status", ["pending", "synced", "failed"])

// Stock movement type enum for tracking inventory changes
export const movementType = pgEnum("movement_type", ["sale", "adjustment", "delivery"])