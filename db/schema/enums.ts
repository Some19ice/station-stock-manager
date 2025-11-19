import { pgEnum } from "drizzle-orm/pg-core"

// User role enum for station staff
export const userRole = pgEnum("user_role", ["staff", "manager", "director"])

// Product type enum for different product categories
export const productType = pgEnum("product_type", ["pms", "lubricant"])

// Sync status enum for offline transaction management
export const syncStatus = pgEnum("sync_status", ["pending", "synced", "failed"])

// Stock movement type enum for tracking inventory changes
export const movementType = pgEnum("movement_type", [
  "sale",
  "adjustment",
  "delivery"
])

// Audit action type enum for Director action tracking
export const auditActionType = pgEnum("audit_action_type", [
  "user_create",
  "user_update", 
  "user_deactivate",
  "role_assign",
  "report_generate",
  "report_export",
  "supplier_create",
  "supplier_update",
  "customer_create",
  "customer_update",
  "permission_check_fail"
])

// Audit resource type enum for Director action tracking
export const auditResourceType = pgEnum("audit_resource_type", [
  "user",
  "report", 
  "supplier",
  "customer",
  "permission"
])
