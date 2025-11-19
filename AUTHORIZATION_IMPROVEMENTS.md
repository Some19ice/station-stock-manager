# Authorization & Authentication Improvements

## Date: 2025-11-20

## Summary

This document outlines the authorization improvements implemented in response to the security review findings in `COMPREHENSIVE_REVIEW.md`.

---

## 1. Standardized Authorization Patterns ✅

### 1.1 Dashboard Layout Authorization

**File**: `app/(authenticated)/dashboard/layout.tsx`

**Changes**:
- Replaced manual role checking (`if (profileUser.role !== "manager" && profileUser.role !== "director")`) with standardized `validateUserRole("manager")` function
- Ensures consistency with other layouts (staff, director)
- Leverages central `ROLE_HIERARCHY` logic for permission checks

**Impact**: 
- Consistency across all protected layouts
- Easier to maintain and audit
- Properly enforces hierarchical role permissions (Director can access Manager areas)

---

## 2. Granular Authorization in Server Actions ✅

### 2.1 Pump Configurations (`actions/pump-configurations.ts`)

**Problem**: Actions only checked authentication but not station-level authorization.

**Changes Implemented**:
All functions now:
1. Use `getCurrentUserProfile()` instead of `currentUser()`
2. Verify `userProfile.data.user.stationId === targetStationId`
3. Return proper error messages for unauthorized access

**Functions Secured**:
- ✅ `getPumpConfigurations(stationId)` - Verifies user belongs to station
- ✅ `getPumpConfiguration(pumpId)` - Fetches pump first, then validates station
- ✅ `createPumpConfiguration(data)` - Validates user can create for target station
- ✅ `updatePumpConfiguration(pumpId, data)` - Validates ownership before update
- ✅ `updatePumpStatus(pumpId, data)` - Validates ownership before status change
- ✅ `getActivePumpConfigurations(stationId)` - Verifies user belongs to station
- ✅ `deletePumpConfiguration(pumpId)` - Validates ownership before soft delete

**Example Pattern**:
```typescript
export async function getPumpConfigurations(stationId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/login")
  }

  // Cross-station authorization check
  if (userProfile.data.user.stationId !== stationId) {
    return {
      isSuccess: false,
      error: "Unauthorized access to station data"
    }
  }
  
  // ... rest of function
}
```

**Security Impact**:
- **CRITICAL**: Prevents cross-station data access
- Manager at Station A cannot view/modify pumps at Station B
- All pump operations now enforce station boundaries

---

## 3. API Route Authorization ✅ (Already Implemented)

### 3.1 Admin Routes

**File**: `app/api/admin/users/route.ts`

**Existing Security**:
- ✅ Validates director role with `validateUserRole("director")`
- ✅ Logs permission failures via `logPermissionFailure()`
- ✅ Returns proper HTTP status codes (401, 403, 400, 500)

**File**: `app/api/pump-configurations/route.ts`

**Current Implementation**:
- ✅ Validates authentication with `currentUser()`
- ✅ Validates UUID format for stationId
- ⚠️ **Note**: API routes call server actions that now have station-level checks

---

## 4. Remaining Recommendations

### 4.1 HIGH PRIORITY: Complete Inventory Actions

**File**: `actions/inventory.ts`

**Status**: ⚠️ PARTIALLY STARTED

**Functions Needing Station-level Authorization**:
1. `getInventoryStatus(stationId)` - Started but needs completion
2. `getInventoryAnalytics(stationId, days)` - Needs station validation
3. `generateReorderRecommendations(stationId)` - Needs station validation
4. `getStockMovementHistory(input)` - Already has stationId in input, ensure validation

**Functions with Manager-only Access** (Need product → station validation):
1. `recordStockAdjustment(input)` - Validate product belongs to user's station
2. `recordDelivery(input)` - Validate product belongs to user's station
3. `updateStockAlertThreshold(input)` - Validate product belongs to user's station
4. `bulkStockUpdate(input)` - Validate all products belong to user's station

**Recommended Pattern**:
```typescript
export async function recordStockAdjustment(input) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile.isSuccess || !userProfile.data) {
    return createErrorResponse("Authentication required", ErrorCodes.UNAUTHORIZED)
  }

  // Validate manager role
  if (userProfile.data.user.role !== "manager" && userProfile.data.user.role !== "director") {
    return createErrorResponse("Manager access required", ErrorCodes.FORBIDDEN)
  }

  // In transaction: fetch product and validate station ownership
  const product = await tx.query.products.findFirst({
    where: eq(products.id, validatedInput.productId)
  })

  if (product.stationId !== userProfile.data.user.stationId) {
    return createErrorResponse("Cannot modify products from other stations", ErrorCodes.FORBIDDEN)
  }
}
```

### 4.2 MEDIUM PRIORITY: Automated Testing

**Recommendation**: Create E2E authorization tests

**Test File**: Create `e2e/authorization.spec.ts`

**Test Scenarios**:
1. **Cross-Station Data Access**
   - Staff from Station A attempts to access `/api/pump-configurations?stationId=stationB`
   - Expected: 403 Forbidden or Unauthorized error

2. **Role Hierarchy**
   - Staff attempts to access `/director` routes
   - Expected: Redirect to `/unauthorized`

3. **Manager Route Access**
   - Staff attempts to access `/dashboard` (manager-only)
   - Expected: Redirect to `/staff`

4. **Director Route Access**
   - Manager attempts to access `/director` routes
   - Expected: Redirect to `/unauthorized`

### 4.3 MEDIUM PRIORITY: Middleware Enhancement

**Current State**: 
```typescript
// middleware.ts - Line 14-15
// Role-based access control is now handled at the page level
// to avoid Edge Runtime compatibility issues with database calls
```

**Recommendation**: Create a HOC (Higher-Order Component) pattern

**File**: Create `lib/with-authorization.tsx`

```typescript
import { getCurrentUserProfile, validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"
import type { Role } from "@/lib/constants"

export function withAuthorization(
  Component: React.ComponentType<any>,
  requiredRole: Role,
  redirectTo: string = "/unauthorized"
) {
  return async function AuthorizedComponent(props: any) {
    const roleCheck = await validateUserRole(requiredRole)
    
    if (!roleCheck.isSuccess) {
      redirect(redirectTo)
    }

    return <Component {...props} />
  }
}
```

**Usage Example**:
```typescript
// app/(authenticated)/director/page.tsx
import { withAuthorization } from "@/lib/with-authorization"

function DirectorDashboard() {
  // Component code
}

export default withAuthorization(DirectorDashboard, "director")
```

### 4.4 LOW PRIORITY: Permission Utilities Enhancement

**File**: `lib/permission-utils.ts`

**Current State**: ✅ Already has granular permission checking
- `createPermissionChecker()`
- `canManageUsers()`
- `canGenerateReports()`
- `validatePermission()`

**Recommendation**: Add station-scoped permissions

```typescript
export function createStationScopedChecker(
  userId: string,
  role: UserRole,
  stationId: string
) {
  const baseChecker = createPermissionChecker(userId, role)
  
  return {
    ...baseChecker,
    canAccessStation: (targetStationId: string) => targetStationId === stationId,
    canAccessProduct: async (productId: string) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId)
      })
      return product?.stationId === stationId
    }
  }
}
```

---

## 5. Implementation Status Summary

### ✅ Completed
1. Standardized dashboard layout authorization
2. Secured all pump configuration server actions
3. Verified API routes have proper auth (admin routes)

### ⚠️ In Progress
1. Inventory actions - partially started, needs completion

### 📋 Pending
1. Complete inventory action authorization
2. Create E2E authorization tests
3. Implement HOC pattern for route protection
4. Enhance permission utilities with station-scoped checks

---

## 6. Security Principles Applied

### Defense in Depth
- ✅ Layout-level authorization (first barrier)
- ✅ Server action authorization (second barrier)
- ✅ API route authorization (third barrier)

### Principle of Least Privilege
- ✅ Staff can only access staff routes
- ✅ Managers can access staff + manager routes (hierarchy)
- ✅ Directors can access all routes (top of hierarchy)
- ✅ Users can only access data for their own station

### Secure by Default
- ✅ All new server actions should use `getCurrentUserProfile()`
- ✅ All station-scoped operations must validate `stationId`
- ✅ All errors return clear, non-leaking error messages

---

## 7. Code Review Checklist

When adding new server actions or routes, verify:

- [ ] Uses `getCurrentUserProfile()` instead of `auth()` or `currentUser()`
- [ ] Validates role if operation is role-restricted (manager/director-only)
- [ ] Validates station ownership for station-scoped operations
- [ ] Returns proper error responses with appropriate HTTP codes
- [ ] Logs security-relevant actions (via audit logs)
- [ ] Does not leak sensitive information in error messages
- [ ] Uses transactions for multi-step operations
- [ ] Validates all user inputs with Zod schemas

---

## 8. Migration Guide

### For Existing Server Actions

**Before**:
```typescript
export async function myAction(stationId: string) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "Not authenticated" }
  }
  
  // Direct data access
  const data = await db.query.something.findMany({
    where: eq(something.stationId, stationId)
  })
}
```

**After**:
```typescript
export async function myAction(stationId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile.isSuccess || !userProfile.data) {
    return { isSuccess: false, error: "Not authenticated" }
  }
  
  // Validate station access
  if (userProfile.data.user.stationId !== stationId) {
    return { isSuccess: false, error: "Unauthorized access to station data" }
  }
  
  // Validated data access
  const data = await db.query.something.findMany({
    where: eq(something.stationId, stationId)
  })
  
  return { isSuccess: true, data }
}
```

---

## 9. Next Steps

1. **Immediate** (This Sprint):
   - Complete `inventory.ts` station-level authorization
   - Add HOC pattern for consistent route protection
   - Run existing auth tests to ensure nothing broke

2. **Short-term** (Next Sprint):
   - Create comprehensive E2E authorization test suite
   - Audit all remaining server actions for station-level checks
   - Document authorization patterns in contributing guide

3. **Long-term** (Future):
   - Consider migrating to Clerk Organizations for native multi-tenant support
   - Evaluate edge-compatible authorization solutions for middleware
   - Implement row-level security in PostgreSQL as additional safeguard

---

## 10. References

- **Review Document**: `COMPREHENSIVE_REVIEW.md`
- **Auth Actions**: `actions/auth.ts`
- **Permission Utils**: `lib/permission-utils.ts`
- **Role Constants**: `lib/constants.ts`
- **Middleware**: `middleware.ts`
