/**
 * Unit Tests: Permission Utilities
 * Tests the permission validation and role checking utilities
 */

import { describe, it, expect } from '@jest/globals'
import { 
  createPermissionChecker, 
  validatePermission, 
  canAccessSales, 
  hasReadOnlyAccess,
  canManageUsers,
  canGenerateReports
} from '@/lib/permission-utils'
import { getRolePermissions, roleHasPermission } from '@/lib/role-permissions'
import { PERMISSIONS } from '@/lib/permissions'

describe('Permission Utilities', () => {
  describe('createPermissionChecker', () => {
    it('should create permission checker for staff role', () => {
      const checker = createPermissionChecker('user-id', 'staff')
      
      expect(checker.userId).toBe('user-id')
      expect(checker.role).toBe('staff')
      expect(checker.permissions).toContain(PERMISSIONS.SALES_FULL)
      expect(checker.permissions).toContain(PERMISSIONS.REPORTS_READ)
      expect(checker.permissions).not.toContain(PERMISSIONS.USERS_FULL)
    })

    it('should create permission checker for manager role', () => {
      const checker = createPermissionChecker('user-id', 'manager')
      
      expect(checker.userId).toBe('user-id')
      expect(checker.role).toBe('manager')
      expect(checker.permissions).toContain(PERMISSIONS.SALES_FULL)
      expect(checker.permissions).toContain(PERMISSIONS.REPORTS_FULL)
      expect(checker.permissions).toContain(PERMISSIONS.USERS_FULL)
    })

    it('should create permission checker for director role', () => {
      const checker = createPermissionChecker('user-id', 'director')
      
      expect(checker.userId).toBe('user-id')
      expect(checker.role).toBe('director')
      expect(checker.permissions).toContain(PERMISSIONS.REPORTS_FULL)
      expect(checker.permissions).toContain(PERMISSIONS.USERS_FULL)
      expect(checker.permissions).toContain(PERMISSIONS.SALES_NONE)
      expect(checker.permissions).not.toContain(PERMISSIONS.SALES_FULL)
    })
  })

  describe('validatePermission', () => {
    it('should validate staff can access sales', () => {
      const canAccess = validatePermission('staff', 'sales', 'read')
      expect(canAccess).toBe(true)
    })

    it('should validate manager can access users', () => {
      const canAccess = validatePermission('manager', 'users', 'write')
      expect(canAccess).toBe(true)
    })

    it('should validate director cannot access sales write', () => {
      const canAccess = validatePermission('director', 'sales', 'write')
      expect(canAccess).toBe(false)
    })

    it('should validate director can access reports', () => {
      const canAccess = validatePermission('director', 'reports', 'write')
      expect(canAccess).toBe(true)
    })
  })

  describe('canAccessSales', () => {
    it('should allow staff to access sales', () => {
      expect(canAccessSales('staff')).toBe(true)
    })

    it('should allow manager to access sales', () => {
      expect(canAccessSales('manager')).toBe(true)
    })

    it('should deny director access to sales', () => {
      expect(canAccessSales('director')).toBe(false)
    })
  })

  describe('hasReadOnlyAccess', () => {
    it('should return true for director inventory access', () => {
      expect(hasReadOnlyAccess('director', 'inventory')).toBe(true)
    })

    it('should return false for manager inventory access (has write)', () => {
      expect(hasReadOnlyAccess('manager', 'inventory')).toBe(false)
    })

    it('should return false for staff inventory access (has write)', () => {
      expect(hasReadOnlyAccess('staff', 'inventory')).toBe(false)
    })
  })

  describe('canManageUsers', () => {
    it('should allow manager to manage users', () => {
      expect(canManageUsers('manager')).toBe(true)
    })

    it('should allow director to manage users', () => {
      expect(canManageUsers('director')).toBe(true)
    })

    it('should deny staff user management', () => {
      expect(canManageUsers('staff')).toBe(false)
    })
  })

  describe('canGenerateReports', () => {
    it('should allow manager to generate reports', () => {
      expect(canGenerateReports('manager')).toBe(true)
    })

    it('should allow director to generate reports', () => {
      expect(canGenerateReports('director')).toBe(true)
    })

    it('should deny staff report generation', () => {
      expect(canGenerateReports('staff')).toBe(false)
    })
  })

  describe('Role Permissions', () => {
    it('should return correct permissions for each role', () => {
      const staffPermissions = getRolePermissions('staff')
      const managerPermissions = getRolePermissions('manager')
      const directorPermissions = getRolePermissions('director')

      expect(staffPermissions).toHaveLength(4)
      expect(managerPermissions).toHaveLength(7)
      expect(directorPermissions).toHaveLength(7)

      // Staff should have sales access
      expect(roleHasPermission('staff', PERMISSIONS.SALES_FULL)).toBe(true)
      expect(roleHasPermission('staff', PERMISSIONS.USERS_FULL)).toBe(false)

      // Manager should have all permissions except SALES_NONE
      expect(roleHasPermission('manager', PERMISSIONS.SALES_FULL)).toBe(true)
      expect(roleHasPermission('manager', PERMISSIONS.USERS_FULL)).toBe(true)
      expect(roleHasPermission('manager', PERMISSIONS.REPORTS_FULL)).toBe(true)

      // Director should not have sales access
      expect(roleHasPermission('director', PERMISSIONS.SALES_NONE)).toBe(true)
      expect(roleHasPermission('director', PERMISSIONS.SALES_FULL)).toBe(false)
      expect(roleHasPermission('director', PERMISSIONS.USERS_FULL)).toBe(true)
      expect(roleHasPermission('director', PERMISSIONS.REPORTS_FULL)).toBe(true)
    })
  })

  describe('Permission Checker Methods', () => {
    it('should correctly check permissions using hasPermission method', () => {
      const staffChecker = createPermissionChecker('staff-id', 'staff')
      const directorChecker = createPermissionChecker('director-id', 'director')

      expect(staffChecker.hasPermission(PERMISSIONS.SALES_FULL)).toBe(true)
      expect(staffChecker.hasPermission(PERMISSIONS.USERS_FULL)).toBe(false)

      expect(directorChecker.hasPermission(PERMISSIONS.SALES_FULL)).toBe(false)
      expect(directorChecker.hasPermission(PERMISSIONS.USERS_FULL)).toBe(true)
    })

    it('should correctly check access using canAccess method', () => {
      const staffChecker = createPermissionChecker('staff-id', 'staff')
      const directorChecker = createPermissionChecker('director-id', 'director')

      expect(staffChecker.canAccess('sales', 'write')).toBe(true)
      expect(staffChecker.canAccess('users', 'write')).toBe(false)

      expect(directorChecker.canAccess('sales', 'write')).toBe(false)
      expect(directorChecker.canAccess('users', 'write')).toBe(true)
      expect(directorChecker.canAccess('reports', 'export')).toBe(true)
    })
  })
})
