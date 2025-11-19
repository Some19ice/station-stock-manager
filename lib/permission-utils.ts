import { UserRole, getRolePermissions, roleHasPermission } from "./role-permissions"
import { PERMISSIONS } from "./permissions"

export interface PermissionCheck {
  userId: string
  role: UserRole
  permissions: string[]
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
}

// Create permission checker for a user
export function createPermissionChecker(userId: string, role: UserRole): PermissionCheck {
  const permissions = getRolePermissions(role)
  
  return {
    userId,
    role,
    permissions,
    hasPermission: (permission: string) => roleHasPermission(role, permission),
    canAccess: (resource: string, action: string) => {
      // Check if any permission allows this resource:action combination
      return permissions.some(permission => {
        // Handle complex permission strings like "reports:read,write,export"
        if (permission.includes(':')) {
          const [permissionResource, actions] = permission.split(':')
          if (permissionResource === resource) {
            const allowedActions = actions.split(',')
            return allowedActions.includes(action)
          }
        }
        return false
      })
    }
  }
}

// Validate if user can perform action on resource
export function validatePermission(role: UserRole, resource: string, action: string): boolean {
  const checker = createPermissionChecker("", role)
  return checker.canAccess(resource, action)
}

// Check if role can access sales functionality
export function canAccessSales(role: UserRole): boolean {
  return roleHasPermission(role, PERMISSIONS.SALES_FULL) || 
         roleHasPermission(role, PERMISSIONS.SALES_READ)
}

// Check if role has read-only access to resource
export function hasReadOnlyAccess(role: UserRole, resource: string): boolean {
  const checker = createPermissionChecker("", role)
  const canRead = checker.canAccess(resource, "read")
  const canWrite = checker.canAccess(resource, "write")
  return canRead && !canWrite
}

// Check if role can manage users
export function canManageUsers(role: UserRole): boolean {
  return roleHasPermission(role, PERMISSIONS.USERS_FULL)
}

// Check if role can generate reports
export function canGenerateReports(role: UserRole): boolean {
  return roleHasPermission(role, PERMISSIONS.REPORTS_FULL)
}

// ============================================================================
// STATION-SCOPED PERMISSION CHECKING
// ============================================================================

import { db } from "@/db"
import { products, pumpConfigurations, stockMovements } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface StationScopedPermissionCheck extends PermissionCheck {
  stationId: string
  canAccessStation: (targetStationId: string) => boolean
  canAccessProduct: (productId: string) => Promise<boolean>
  canAccessPump: (pumpId: string) => Promise<boolean>
  canAccessStockMovement: (movementId: string) => Promise<boolean>
}

/**
 * Create a station-scoped permission checker
 * Extends base permission checker with station-level access validation
 * 
 * @param userId - User ID
 * @param role - User role
 * @param stationId - User's station ID
 * @returns Enhanced permission checker with station scope
 * 
 * @example
 * ```typescript
 * const checker = createStationScopedChecker("user_123", "manager", "station_abc")
 * 
 * // Check if user can access another station
 * if (!checker.canAccessStation(targetStationId)) {
 *   return { error: "Unauthorized" }
 * }
 * 
 * // Check if user can access a specific product
 * if (!(await checker.canAccessProduct(productId))) {
 *   return { error: "Cannot access product from another station" }
 * }
 * ```
 */
export function createStationScopedChecker(
  userId: string,
  role: UserRole,
  stationId: string
): StationScopedPermissionCheck {
  const baseChecker = createPermissionChecker(userId, role)
  
  return {
    ...baseChecker,
    stationId,
    
    /**
     * Check if user can access a specific station
     * Directors can access all stations, others only their own
     */
    canAccessStation: (targetStationId: string): boolean => {
      // Directors can access all stations
      if (role === "director") {
        return true
      }
      // Other roles can only access their own station
      return targetStationId === stationId
    },
    
    /**
     * Check if user can access a specific product
     * Validates that product belongs to user's station
     */
    canAccessProduct: async (productId: string): Promise<boolean> => {
      try {
        const product = await db.query.products.findFirst({
          where: eq(products.id, productId),
          columns: { stationId: true }
        })
        
        if (!product) {
          return false
        }
        
        // Directors can access all products
        if (role === "director") {
          return true
        }
        
        return product.stationId === stationId
      } catch (error) {
        console.error("Error checking product access:", error)
        return false
      }
    },
    
    /**
     * Check if user can access a specific pump configuration
     * Validates that pump belongs to user's station
     */
    canAccessPump: async (pumpId: string): Promise<boolean> => {
      try {
        const pump = await db.query.pumpConfigurations.findFirst({
          where: eq(pumpConfigurations.id, pumpId),
          columns: { stationId: true }
        })
        
        if (!pump) {
          return false
        }
        
        // Directors can access all pumps
        if (role === "director") {
          return true
        }
        
        return pump.stationId === stationId
      } catch (error) {
        console.error("Error checking pump access:", error)
        return false
      }
    },
    
    /**
     * Check if user can access a specific stock movement
     * Validates that the movement's product belongs to user's station
     */
    canAccessStockMovement: async (movementId: string): Promise<boolean> => {
      try {
        const movement = await db.query.stockMovements.findFirst({
          where: eq(stockMovements.id, movementId),
          with: {
            product: {
              columns: { stationId: true }
            }
          }
        })
        
        if (!movement || !movement.product) {
          return false
        }
        
        // Directors can access all movements
        if (role === "director") {
          return true
        }
        
        return (movement.product as unknown as { stationId: string }).stationId === stationId
      } catch (error) {
        console.error("Error checking stock movement access:", error)
        return false
      }
    }
  }
}

/**
 * Validate station access for a user
 * Utility function for quick station access checks
 * 
 * @param userStationId - User's station ID
 * @param targetStationId - Target station ID to access
 * @param userRole - User's role
 * @returns true if access is allowed
 */
export function validateStationAccess(
  userStationId: string,
  targetStationId: string,
  userRole: UserRole
): boolean {
  // Directors can access all stations
  if (userRole === "director") {
    return true
  }
  // Other roles can only access their own station
  return userStationId === targetStationId
}

/**
 * Validate product access for a user
 * Async utility for checking product access
 * 
 * @param userStationId - User's station ID
 * @param productId - Product ID to access
 * @param userRole - User's role
 * @returns true if access is allowed
 */
export async function validateProductAccess(
  userStationId: string,
  productId: string,
  userRole: UserRole
): Promise<boolean> {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { stationId: true }
    })
    
    if (!product) {
      return false
    }
    
    // Directors can access all products
    if (userRole === "director") {
      return true
    }
    
    return product.stationId === userStationId
  } catch (error) {
    console.error("Error validating product access:", error)
    return false
  }
}

