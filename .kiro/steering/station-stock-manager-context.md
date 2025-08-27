---
inclusion: fileMatch
fileMatchPattern: '**/station-stock-manager/**'
---

# Station Stock Manager - Agent Context

## Project Overview

You are working on the Station Stock Manager, a Progressive Web App (PWA) that transforms the existing Next.js SaaS template into a specialized inventory management system for filling stations. The app manages PMS (Premium Motor Spirit) and lubricant inventory with offline capabilities and role-based access.

## Key Project Files

The complete specification is available in these files:
- #[[file:.kiro/specs/station-stock-manager/requirements.md]] - Complete requirements with user stories and acceptance criteria
- #[[file:.kiro/specs/station-stock-manager/design.md]] - Technical architecture and component design
- #[[file:.kiro/specs/station-stock-manager/tasks.md]] - Implementation plan with 16 incremental tasks

## Architecture Context

**Foundation**: Built on existing Next.js 15 SaaS template with:
- Authentication: Clerk (existing)
- Database: PostgreSQL + Drizzle ORM (existing)
- UI: Tailwind CSS + Shadcn UI (existing)
- Payments: Stripe (existing, may be repurposed)

**New Additions**:
- PWA capabilities with Service Worker
- Offline-first architecture with IndexedDB
- Role-based access (Staff vs Manager)
- Real-time inventory tracking
- Background sync for offline transactions

## User Roles & Key Workflows

**Sales Staff**:
- Simple sales recording interface
- Personal daily sales summary
- Offline capability with sync
- Restricted access (no analytics/management)

**Manager**:
- Full dashboard with business metrics
- Complete inventory management
- User account management
- Comprehensive reporting system
- All staff capabilities plus management tools

## Critical Business Logic

**Inventory Management**:
- Real-time stock level tracking
- Automatic stock deduction on sales
- Low stock threshold alerts
- Stock movement history
- Support for PMS (litres) and lubricants (units)

**Sales Recording**:
- Multi-item transactions
- Automatic price calculations
- Offline transaction queuing
- Conflict resolution for simultaneous sales
- Manager-only sale corrections/voids

**Data Integrity**:
- Prevent negative stock levels
- Ensure transaction consistency
- Handle offline/online sync conflicts
- Maintain audit trail for all operations

## Nigerian Context

**Currency**: All monetary values use Nigerian Naira (₦)
**Products**: Focus on PMS and lubricants common in Nigerian filling stations
**Business Practices**: Designed to replace paper-based tracking systems
**Mobile-First**: Optimized for smartphone usage in field conditions