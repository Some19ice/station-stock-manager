# Quickstart Guide: Director Role Implementation

**Date**: September 13, 2025  
**Feature**: Add Director Role  
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide provides step-by-step instructions to test and validate the Director role implementation. It covers the complete user journey from role assignment to daily Director tasks.

## Prerequisites

- Station Stock Manager application running in development mode
- Database with migrated schema (including Director role and audit logging)
- At least one active Manager account for initial setup
- Test data with stations, products, users, and transactions

## Quick Start Scenarios

### 1. Director Role Assignment

**Objective**: Assign Director role to an existing Manager
**Duration**: 2-3 minutes

```bash
# 1. Start development server
npm run dev

# 2. Login as existing Manager
# Navigate to: http://localhost:3000/login
# Use manager credentials

# 3. Navigate to User Management
# Go to: /dashboard/users

# 4. Select a Manager user to promote
# Click on user profile

# 5. Change role to Director
# Select "Director" from role dropdown
# Confirm the change

# 6. Verify audit log entry created
# Check audit logs for role_assign action
```

**Expected Result**: User successfully assigned Director role, audit log entry created

### 2. Director Dashboard Access

**Objective**: Verify Director can access appropriate dashboard sections
**Duration**: 3-5 minutes

```bash
# 1. Logout and login as newly created Director
# Navigate to: http://localhost:3000/login

# 2. Verify Director dashboard access
# Should see Director-specific navigation menu
# Reports section: ✅ Full access
# Inventory section: ✅ Read-only access
# User Management: ✅ Full access
# Sales interface: ❌ No access (should not be visible)

# 3. Test report generation
# Navigate to: /director/reports
# Generate a sample report
# Verify export functionality works

# 4. Test inventory viewing
# Navigate to: /director/inventory
# View current stock levels
# Verify cannot modify stock (no edit buttons)

# 5. Test user management
# Navigate to: /director/users
# Create a new staff user
# Modify existing user role
# Verify all actions are logged
```

**Expected Result**: Director has appropriate access levels, no sales interface visible

### 3. Sales Access Restriction

**Objective**: Verify Director cannot access sales functions
**Duration**: 2 minutes

```bash
# 1. As Director, attempt to access sales URLs directly
# Navigate to: /staff/sales (should redirect or show error)
# Navigate to: /api/sales/* (should return 403)

# 2. Verify sales interface not in navigation
# Check main navigation menu
# Sales/Transaction options should not be visible

# 3. Test API endpoint protection
# Use browser dev tools or Postman
# POST to /api/sales/record-sale
# Should return 403 Forbidden with audit log entry
```

**Expected Result**: All sales access blocked, audit log entries for failed attempts

### 4. User Management Operations

**Objective**: Test Director's user management capabilities
**Duration**: 5-7 minutes

```bash
# 1. Create new user
# Navigate to: /director/users/create
# Fill form with staff role
# Send invitation
# Verify user created and audit logged

# 2. Modify existing user
# Select existing staff user
# Change role to manager
# Verify update successful and logged

# 3. Transfer user between stations
# Select user from Station A
# Change station to Station B
# Verify transfer and audit trail

# 4. Test minimum Director policy
# Attempt to deactivate your own Director account
# If you're the only Director, should fail with error
# If multiple Directors exist, should succeed

# 5. Bulk user operations
# Select multiple users
# Perform bulk role assignment
# Verify all changes logged individually
```

**Expected Result**: All user management functions work, comprehensive audit logging

### 5. Audit Log Verification

**Objective**: Verify comprehensive audit logging for Director actions
**Duration**: 3-4 minutes

```bash
# 1. Access audit logs
# Navigate to: /director/audit-logs

# 2. Filter audit logs
# Filter by your user ID
# Filter by action type (role_assign, user_create, etc.)
# Filter by date range

# 3. Export audit logs
# Generate CSV export
# Generate PDF report
# Verify file downloads correctly

# 4. Verify log details
# Click on specific audit entry
# Verify all required fields present:
#   - User ID, Action Type, Resource Type
#   - IP Address, User Agent, Timestamp
#   - Detailed action information

# 5. Test permission failure logging
# Attempt unauthorized action (if possible)
# Verify permission_check_fail logged
```

**Expected Result**: Complete audit trail with detailed action information

### 6. Supplier and Customer Management

**Objective**: Verify Director's full access to supplier and customer data
**Duration**: 4-5 minutes

```bash
# 1. Test supplier management
# Navigate to: /director/suppliers
# Create new supplier
# Modify existing supplier
# Verify full read/write access

# 2. Test customer management
# Navigate to: /director/customers
# View customer list
# Access customer details and purchase history
# Update customer information

# 3. Verify data access
# Check that Director can see:
#   - All customer transaction history
#   - Full supplier contact information
#   - Pricing and contract details
#   - Historical relationship data

# 4. Test across stations
# Verify Director can manage suppliers/customers
# across all stations in their network
```

**Expected Result**: Full access to supplier and customer management across all stations

## Validation Checklist

### Security Validation

- [ ] Director cannot access sales interfaces
- [ ] Director cannot record transactions
- [ ] Sales API endpoints return 403 for Director
- [ ] Permission failures are logged
- [ ] Role changes require appropriate permissions

### Functionality Validation

- [ ] Director can view all reports
- [ ] Director can generate and export reports
- [ ] Director has read-only inventory access
- [ ] Director can manage all user accounts
- [ ] Director can manage suppliers/customers
- [ ] Minimum Director policy enforced

### Audit Trail Validation

- [ ] All Director actions are logged
- [ ] Audit logs include required fields
- [ ] Audit logs are searchable and filterable
- [ ] Audit export functions work
- [ ] Permission failures are logged
- [ ] Log entries are immutable

### Data Integrity Validation

- [ ] Role assignments update correctly
- [ ] Database constraints prevent last Director removal
- [ ] User transfers between stations work
- [ ] Bulk operations maintain data consistency
- [ ] Audit logs maintain referential integrity

## Performance Testing

### Basic Performance Checks

```bash
# 1. Role permission checking performance
# Login as Director and measure dashboard load time
# Target: < 200ms for permission validation

# 2. Audit log query performance
# Load audit logs page with 1000+ entries
# Target: < 500ms page load time

# 3. User management operations
# Create user and measure response time
# Target: < 300ms for user creation

# 4. Bulk operations performance
# Test bulk role assignment for 20+ users
# Target: < 2 seconds completion time
```

## Troubleshooting

### Common Issues

**Issue**: Director can still see sales interface

- **Cause**: Role-based navigation not updated
- **Fix**: Check role permission constants and navigation component

**Issue**: Minimum Director policy not enforced

- **Cause**: Database constraint not applied
- **Fix**: Run migration to add constraint and trigger functions

**Issue**: Audit logs not creating

- **Cause**: Audit logging service not integrated
- **Fix**: Verify audit log service called in server actions

**Issue**: Permission checks failing

- **Cause**: Role enum not updated or permission matrix incorrect
- **Fix**: Verify database schema and permission constants

### Debug Commands

```bash
# Check current user role
npm run db:console
# SELECT role FROM users WHERE clerk_user_id = 'user_id';

# Verify audit log creation
# SELECT * FROM audit_logs WHERE user_id = 'user_id' ORDER BY created_at DESC LIMIT 10;

# Check Director count
# SELECT COUNT(*) FROM users WHERE role = 'director' AND is_active = true;

# Verify permission matrix
# Check role-permission mapping in code constants
```

## Success Criteria

The Director role implementation is successful when:

1. **Role Assignment**: Manager can assign Director role, minimum policy enforced
2. **Access Control**: Director has correct permissions (full reports/users, read-only inventory, no sales)
3. **Audit Logging**: All Director actions comprehensively logged with required details
4. **User Management**: Director can manage users across all stations with proper validation
5. **Data Management**: Director has full access to suppliers/customers with proper logging
6. **Security**: Sales access completely blocked with failed attempts logged
7. **Performance**: All operations complete within acceptable time limits
8. **Data Integrity**: All business rules enforced at database and application levels

---

**Next Phase**: Task Generation (tasks.md) - This quickstart guide serves as acceptance criteria for task validation
