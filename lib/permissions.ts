// Permission constants for role-based access control
export const PERMISSIONS = {
  // Reports permissions
  REPORTS_FULL: "reports:read,write,export",
  REPORTS_READ: "reports:read",
  
  // Inventory permissions
  INVENTORY_FULL: "inventory:read,write,adjust",
  INVENTORY_READ: "inventory:read",
  
  // Sales permissions
  SALES_FULL: "sales:read,write,record",
  SALES_READ: "sales:read", 
  SALES_NONE: "sales:none",
  
  // User management permissions
  USERS_FULL: "users:read,write,create,deactivate,role_assign",
  USERS_READ: "users:read",
  
  // Supplier permissions
  SUPPLIERS_FULL: "suppliers:read,write,create,delete",
  
  // Customer permissions
  CUSTOMERS_FULL: "customers:read,write,create,delete",
  
  // Audit permissions
  AUDIT_READ: "audit:read"
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
