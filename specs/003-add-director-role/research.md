# Research Findings: Director Role Implementation

**Date**: September 13, 2025  
**Feature**: Add Director Role  
**Phase**: 0 - Technical Research

## 1. Clerk Role Extension Patterns

**Decision**: Extend existing userRole enum in PostgreSQL schema, maintain role validation in server actions

**Rationale**:

- Current implementation uses custom role management with Clerk for authentication but stores roles in PostgreSQL
- The existing pattern in `db/schema/enums.ts` defines `userRole = pgEnum("user_role", ["staff", "manager"])`
- Auth validation in `actions/auth.ts` uses custom role checking against database, not Clerk's built-in roles
- This pattern allows for flexible role management while maintaining Clerk's authentication security

**Alternatives considered**:

- Use Clerk's built-in custom metadata for roles: Rejected because current system uses database-driven roles with better performance and flexibility
- Separate role service: Rejected due to increased complexity without significant benefits
- JWT claims for roles: Rejected because current middleware avoids edge runtime database calls

**Implementation approach**:

```typescript
// Extend enum: userRole = pgEnum("user_role", ["staff", "manager", "director"])
// Update validation schemas to include "director"
// Extend getUserRole() and validateUserRole() functions
```

## 2. Role-Based Middleware in Next.js 15 App Router

**Decision**: Continue page-level role validation, extend middleware for Director routes

**Rationale**:

- Current `middleware.ts` uses Clerk middleware with route matching but delegates role checks to page level
- This avoids Edge Runtime compatibility issues with database calls
- Pattern works well for current "staff" and "manager" roles
- Director role will follow same pattern: authentication in middleware, authorization in pages

**Alternatives considered**:

- Database role checking in middleware: Rejected due to Edge Runtime limitations with database connections
- Route-based role mapping in middleware: Rejected because current pattern successfully separates concerns
- API route protection only: Rejected because UI needs role-aware rendering

**Implementation approach**:

```typescript
// Add /director(.*)  to isProtectedRoute matcher
// Continue using server actions for role validation in pages
// Add Director-specific route guards in page components
```

## 3. Audit Logging Implementation Patterns

**Decision**: Create dedicated audit_logs table with structured logging for Director actions

**Rationale**:

- Current system has basic activity tracking in `actions/user-activities.ts` but limited to sales transactions
- Director role requires comprehensive audit trail for compliance (FR-007, FR-013)
- PostgreSQL with structured columns provides better querying and compliance reporting than JSON logs
- Follows existing Drizzle ORM patterns and fits current database architecture

**Alternatives considered**:

- JSON logging to files: Rejected due to poor queryability and lack of transactional consistency
- Extend existing user activities: Rejected because current system is transaction-focused, not action-focused
- Third-party audit service: Rejected due to cost and complexity for current scale

**Implementation approach**:

```sql
-- audit_logs table with: id, user_id, action_type, resource_type, resource_id, details, ip_address, user_agent, created_at
-- Trigger functions for automatic logging of sensitive operations
-- Server action wrapper for consistent audit logging
```

## 4. Permission System Design for Hierarchical Role Access

**Decision**: Permission matrix with explicit inheritance and restriction modeling

**Rationale**:

- Current system uses implicit role checking (staff vs manager) in individual server actions
- Director role has complex permissions: full access to some areas, read-only to others, restricted from sales
- Explicit permission matrix provides clearer security boundaries and easier testing
- Allows for granular control needed for Director's mixed access patterns

**Alternatives considered**:

- Simple role hierarchy (Director > Manager > Staff): Rejected because Director has restrictions that Manager doesn't
- Dynamic permission system: Rejected due to complexity and current system's simplicity
- Boolean flags per feature: Rejected because it doesn't scale and lacks clarity

**Implementation approach**:

```typescript
// Permission constants: REPORTS_FULL, INVENTORY_READ, SALES_NONE, USERS_FULL
// Role-to-permission mapping: director: [REPORTS_FULL, INVENTORY_READ, USERS_FULL, SUPPLIERS_FULL, CUSTOMERS_FULL]
// Permission check helper functions in server actions
// UI component permission guards based on permission matrix
```

## 5. Database Schema Design Decisions

**Decision**: Minimal schema changes, extend existing patterns

**Rationale**:

- Current schema is well-designed with proper foreign keys and UUID primary keys
- Adding "director" to existing userRole enum requires single migration
- Audit logging follows existing table patterns with proper relationships
- No changes needed to core entities (stations, products, transactions)

**Implementation**:

- Add "director" to userRole enum
- Create audit_logs table with foreign key to users table
- Add audit logging triggers for user management operations
- Create audit_logs indexes for efficient querying by user, action_type, and date

## 6. UI/UX Patterns for Director Role

**Decision**: Extend existing dashboard pattern with Director-specific navigation

**Rationale**:

- Current system has clean separation between `/dashboard` (manager) and `/staff` interfaces
- Director needs similar access to manager but with restrictions
- Reuse existing dashboard components with role-based conditional rendering
- Maintain consistent UX patterns for easier training and adoption

**Implementation**:

- Create `/director` route group parallel to `/dashboard` and `/staff`
- Reuse dashboard components with permission-based prop injection
- Add Director-specific navigation menu excluding sales interfaces
- Implement audit log viewing components for Director oversight

## Implementation Priority

1. **High Priority**: Database schema changes (role enum, audit table)
2. **High Priority**: Server action role validation updates
3. **Medium Priority**: UI components and navigation
4. **Medium Priority**: Audit logging implementation
5. **Low Priority**: Performance optimizations and advanced audit features

## Risk Mitigation

- **Database migration**: Use reversible migrations with proper rollback procedures
- **Role validation**: Implement comprehensive tests before deployment
- **Audit logging**: Start with basic logging, enhance incrementally
- **Performance**: Monitor database query performance with new role checks

---

**Status**: ✅ Complete - All technical unknowns resolved  
**Next Phase**: Design & Contracts (data-model.md, contracts/, quickstart.md)
