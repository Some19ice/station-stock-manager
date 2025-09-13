# Data Model: Director Role Implementation

**Date**: September 13, 2025  
**Feature**: Add Director Role  
**Phase**: 1 - Design & Contracts

## Entity Definitions

### 1. Director Role (Extension of User Role)

**Purpose**: Extends existing user role system to include Director with strategic oversight capabilities

**Attributes**:

- Inherits all user table attributes (id, stationId, clerkUserId, username, role, isActive, createdAt, updatedAt)
- `role` field extended to include "director" value in userRole enum

**Validation Rules**:

- Minimum one Director must exist per system (global constraint)
- Director can be assigned to any station (no station-specific restriction)
- Director cannot be deactivated if they are the last Director in the system
- Director role assignment requires existing Director or Manager approval

**State Transitions**:

```
Staff → Director (via Manager or Director)
Manager → Director (via Director)
Director → Manager (via another Director, if not last Director)
Director → Staff (via another Director, if not last Director)
```

**Relationships**:

- Belongs to Station (many-to-one)
- Has many Audit Log Entries (one-to-many)
- Can manage all Users (one-to-many as manager)

### 2. Role Permissions (Permission Matrix)

**Purpose**: Define explicit permissions for each role with hierarchical access control

**Permission Constants**:

```typescript
REPORTS_FULL = "reports:read,write,export"
REPORTS_READ = "reports:read"
INVENTORY_FULL = "inventory:read,write,adjust"
INVENTORY_READ = "inventory:read"
SALES_FULL = "sales:read,write,record"
SALES_READ = "sales:read"
SALES_NONE = "sales:none"
USERS_FULL = "users:read,write,create,deactivate,role_assign"
USERS_READ = "users:read"
SUPPLIERS_FULL = "suppliers:read,write,create,delete"
CUSTOMERS_FULL = "customers:read,write,create,delete"
AUDIT_READ = "audit:read"
```

**Role Permission Matrix**:

```typescript
staff: [SALES_FULL, REPORTS_READ, INVENTORY_READ, USERS_READ]
manager: [
  REPORTS_FULL,
  INVENTORY_FULL,
  SALES_FULL,
  USERS_FULL,
  SUPPLIERS_FULL,
  CUSTOMERS_FULL,
  AUDIT_READ
]
director: [
  REPORTS_FULL,
  INVENTORY_READ,
  SALES_NONE,
  USERS_FULL,
  SUPPLIERS_FULL,
  CUSTOMERS_FULL,
  AUDIT_READ
]
```

**Validation Rules**:

- Permissions are immutable constants (cannot be modified at runtime)
- Role-permission mapping is validated at application startup
- Permission checks must be explicit (no implicit inheritance)

### 3. Audit Log Entries

**Purpose**: Comprehensive logging of Director actions for compliance and security monitoring

**Attributes**:

- `id` (UUID, primary key)
- `userId` (UUID, foreign key to users.id)
- `actionType` (enum: user_create, user_update, user_deactivate, role_assign, report_generate, report_export, supplier_create, supplier_update, customer_create, customer_update, permission_check_fail)
- `resourceType` (enum: user, report, supplier, customer, permission)
- `resourceId` (UUID, nullable - ID of affected resource)
- `details` (JSONB - structured details of the action)
- `ipAddress` (string, nullable)
- `userAgent` (string, nullable)
- `stationId` (UUID, foreign key to stations.id)
- `createdAt` (timestamp with timezone)

**Validation Rules**:

- actionType and resourceType must be valid enum values
- details must be valid JSON structure
- userId must reference existing user
- stationId must reference existing station
- Audit logs are immutable (no updates or deletes)
- Retention period: 7 years for compliance

**Data Retention**:

- Active logs: Full access and searching
- Archived logs (>2 years): Read-only, compressed storage
- Purged logs (>7 years): Deleted with compliance documentation

**Relationships**:

- Belongs to User (many-to-one)
- Belongs to Station (many-to-one)

### 4. Minimum Admin Policy (System Constraint)

**Purpose**: Ensure system always has at least one Director for administrative access

**Implementation**: Database constraint and application-level validation

**Rules**:

- System must have at least 1 active Director at all times
- Cannot deactivate last Director
- Cannot change last Director's role to non-Director
- Constraint enforced at database level with triggers
- Application-level validation in user management actions

**Validation Logic**:

```sql
-- Database constraint
CREATE CONSTRAINT check_minimum_directors
CHECK (
  (SELECT COUNT(*) FROM users WHERE role = 'director' AND is_active = true) >= 1
);
```

## Database Schema Changes

### Required Migrations

**Migration 1: Extend userRole enum**

```sql
ALTER TYPE user_role ADD VALUE 'director';
```

**Migration 2: Create audit_logs table**

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action_type audit_action_type NOT NULL,
  resource_type audit_resource_type NOT NULL,
  resource_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  station_id UUID NOT NULL REFERENCES stations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enums for audit logging
CREATE TYPE audit_action_type AS ENUM (
  'user_create', 'user_update', 'user_deactivate', 'role_assign',
  'report_generate', 'report_export',
  'supplier_create', 'supplier_update',
  'customer_create', 'customer_update',
  'permission_check_fail'
);

CREATE TYPE audit_resource_type AS ENUM (
  'user', 'report', 'supplier', 'customer', 'permission'
);
```

**Migration 3: Add minimum Director constraint**

```sql
-- Function to check minimum directors
CREATE OR REPLACE FUNCTION check_minimum_directors()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM users WHERE role = 'director' AND is_active = true) < 1 THEN
    RAISE EXCEPTION 'Cannot proceed: System must have at least one active Director';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for constraint enforcement
CREATE TRIGGER enforce_minimum_directors_on_update
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.role = 'director' OR OLD.is_active = true)
  EXECUTE FUNCTION check_minimum_directors();

CREATE TRIGGER enforce_minimum_directors_on_delete
  AFTER DELETE ON users
  FOR EACH ROW
  WHEN (OLD.role = 'director' AND OLD.is_active = true)
  EXECUTE FUNCTION check_minimum_directors();
```

### Performance Indexes

```sql
-- Audit log performance indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_station_id ON audit_logs(station_id);

-- User role performance index
CREATE INDEX idx_users_role_active ON users(role, is_active);
```

## API Data Transfer Objects

### Director User DTO

```typescript
interface DirectorUserDTO {
  id: string
  stationId: string
  username: string
  role: "director"
  isActive: boolean
  createdAt: string
  updatedAt: string
  station: {
    id: string
    name: string
  }
  permissions: string[]
}
```

### Audit Log Entry DTO

```typescript
interface AuditLogEntryDTO {
  id: string
  userId: string
  actionType: AuditActionType
  resourceType: AuditResourceType
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  stationId: string
  createdAt: string
  user: {
    id: string
    username: string
    role: string
  }
}
```

### Permission Check DTO

```typescript
interface PermissionCheckDTO {
  userId: string
  role: "staff" | "manager" | "director"
  permissions: string[]
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
}
```

## Business Rules Summary

1. **Director Role Assignment**: Only existing Directors or Managers can assign Director role
2. **Minimum Director Policy**: System must maintain at least 1 active Director
3. **Permission Inheritance**: Director inherits reporting and user management from Manager but loses sales access
4. **Audit Trail**: All Director actions must be logged for compliance
5. **Station Association**: Directors can manage users across all stations in their network
6. **Self-Management**: Directors can modify their own account but cannot remove their Director role if they are the last Director

---

**Status**: ✅ Complete - Data model defined with validation rules and constraints  
**Next**: API Contracts (contracts/ directory)
