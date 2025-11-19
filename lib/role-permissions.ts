import { PERMISSIONS } from "./permissions"

export type UserRole = "staff" | "manager" | "director"

// Role permission matrix defining what each role can do
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  staff: [
    PERMISSIONS.SALES_FULL,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.USERS_READ
  ],
  
  manager: [
    PERMISSIONS.REPORTS_FULL,
    PERMISSIONS.INVENTORY_FULL,
    PERMISSIONS.SALES_FULL,
    PERMISSIONS.USERS_FULL,
    PERMISSIONS.SUPPLIERS_FULL,
    PERMISSIONS.CUSTOMERS_FULL,
    PERMISSIONS.AUDIT_READ
  ],
  
  director: [
    PERMISSIONS.REPORTS_FULL,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.SALES_NONE,
    PERMISSIONS.USERS_FULL,
    PERMISSIONS.SUPPLIERS_FULL,
    PERMISSIONS.CUSTOMERS_FULL,
    PERMISSIONS.AUDIT_READ
  ]
}

// Get permissions for a specific role
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || []
}

// Check if a role has a specific permission
export function roleHasPermission(role: UserRole, permission: string): boolean {
  const rolePermissions = getRolePermissions(role)
  return rolePermissions.includes(permission)
}
