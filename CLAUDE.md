# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting with Prettier
- `npm run clean` - Run both lint:fix and format:write
- `npm run analyze` - Build with bundle analysis

### Database
- `npm run db:local` - Start local Supabase instance
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations
- `npx drizzle-kit push` - Push schema changes directly to database
- `npm run db:seed` - Seed database with initial data

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright e2e tests

### Shadcn UI Components
- `npx shadcn@latest add [component-name]` - Install new Shadcn UI components

## Architecture

This is a **Station Stock Manager** - a comprehensive fuel inventory management system designed for gas stations. Built with Next.js 15 using the App Router with role-based authentication and dashboards.

### Project Purpose
A fuel inventory management application that provides:
- Real-time inventory tracking for fuel and products
- Role-based dashboards for sales staff and managers
- Sales transaction recording and management
- Stock movement monitoring and low stock alerts
- Multi-station support with comprehensive reporting
- Staff management and user access control

### Route Structure
- `/app/(unauthenticated)` - Public routes
  - `(marketing)` - Landing pages and marketing content
  - `setup-profile` - Initial user profile setup
  - `confirmation` - Account confirmation flows
  - `unauthorized` - Access denied pages
- `/app/(authenticated)` - Protected routes requiring Clerk auth
  - `dashboard` - Manager dashboard with analytics, inventory, reports, user management
  - `staff` - Sales staff interface for transactions and daily summaries
  - `director` - Director interface with strategic oversight and audit access
- `/app/api` - API routes for server-side operations

### Key Features & Patterns
- **Role-Based Access**: Separate interfaces for staff, managers, and directors with granular permissions
- **Server Actions** in `/actions` for data mutations (sales, inventory, reports, user management, PMS calculations)
- **Database Schema** in `/db/schema` using Drizzle ORM with PostgreSQL
  - Core: Stations, products (fuel types, accessories), users, transactions
  - Inventory: Stock movements, suppliers, customers, transaction items
  - PMS: Pump configurations, meter readings, daily calculations, sales records
  - Compliance: Audit logs for director actions and permission tracking
- **UI Components** from Shadcn UI library with custom animations (Framer Motion, GSAP)
- **Authentication** handled by Clerk middleware with role-based route protection
- **Permission System** in `/lib/permissions.ts` and `/lib/role-permissions.ts` defining granular access control
- **Real-time Features** for inventory tracking, sales monitoring, and PMS calculations

### Data Flow
1. Authentication and role-based access managed by Clerk (`@clerk/nextjs`)
2. Page-level permission checks using `useStationAuth()` hook and server-side validation
3. Station and inventory data stored in PostgreSQL via Drizzle ORM
4. Sales transactions recorded with real-time stock updates
5. Server actions handle all data mutations with proper auth and role checks
6. Dashboard analytics computed from transaction and inventory data
7. PMS calculations track daily fuel dispensing with opening/closing meter readings
8. Audit logs automatically record all Director actions for compliance

### User Roles & Permissions

The application uses a granular permission system defined in `/lib/permissions.ts` and `/lib/role-permissions.ts`:

- **Sales Staff**:
  - Full sales access (record, read, write)
  - Read-only reports and inventory
  - Read-only user information
  - Can submit daily PMS meter readings

- **Manager**:
  - Full access to all features
  - Reports, inventory, sales, users, suppliers, customers
  - Can approve PMS calculations
  - Audit log read access
  - Manage pump configurations and status

- **Director**:
  - Strategic oversight role
  - Full reports and user management access
  - Read-only inventory access
  - NO sales recording capability (compliance requirement)
  - Full supplier and customer management
  - Audit log read access
  - All actions automatically logged for compliance

**Important**: Permission checks happen at both page level (`useStationAuth()` hook) and server action level. Director actions are automatically logged to the audit_logs table.

### Petrol Management System (PMS)

The PMS module tracks daily fuel dispensing with high accuracy:

**Key Components**:
- **Pump Configurations** (`/db/schema/pump-configurations.ts`): Define pumps with nozzle configurations and status
- **Meter Readings** (`/db/schema/pump-meter-readings.ts`): Staff submit opening/closing readings daily
- **Daily Calculations** (`/db/schema/daily-pms-calculations.ts`): Automated calculation of volume dispensed and revenue
- **Sales Records** (`/db/schema/pms-sales-records.ts`): Link PMS data with actual sales transactions

**Workflow**:
1. Staff submit meter readings via `staff-meter-reading-form.tsx`
2. System calculates volume dispensed (closing - opening readings)
3. Handles meter rollover automatically when readings reset to zero
4. Calculates revenue (volume × unit price)
5. Flags deviations from average for manager review
6. Manager approves calculations via `daily-calculation-dashboard.tsx`
7. System tracks calculation methods: `meter_readings`, `estimated`, or `manual_override`

**Actions**: See `/actions/meter-readings.ts` and `/actions/pms-calculations.ts`

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login` - Clerk sign in URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup` - Clerk sign up URL

### Testing Setup
- **Unit Tests**: Jest with React Testing Library for components and utilities
- **E2E Tests**: Playwright for full application workflow testing
- **Coverage**: Configured for app/, lib/, db/, actions/, components/, hooks/ directories
- **Test Organization**: Contract tests in `__tests__/contracts/`, integration tests in `__tests__/integration/`

## Important Development Notes

### Role-Based Access Control
- Middleware (`middleware.ts`) handles basic authentication only
- Fine-grained permission checks occur at page/component level using `useStationAuth()` hook
- Server actions validate permissions before data mutations
- Use `ROLE_PERMISSIONS` from `/lib/role-permissions.ts` to check capabilities

### Database Migrations
- Always generate migrations with `npx drizzle-kit generate` after schema changes
- Test migrations locally before pushing to production
- Migration files stored in `/db/migrations/`
- Schema organized by entity in `/db/schema/` with main exports in `index.ts`

### Working with PMS Features
- PMS calculations require pump configurations to be set up first
- Meter readings must be submitted in chronological order
- System automatically detects and handles meter rollovers (9999.9 → 0.0)
- Deviation alerts trigger when volume differs significantly from historical average

## Current Implementation Status

### Recent Changes (Branch: 003-add-director-role)
- **Director Role Implementation**: Extended role system to include Director role with strategic oversight capabilities
- **Audit Logging**: Added comprehensive audit trail for Director actions and compliance
- **Permission Matrix**: Implemented granular permission system for role-based access control
- **PMS Sales Refactor**: Improved petrol management system with better calculation workflows
- **Theme Management**: Added customizable theme settings for station branding

### Tech Stack
- **Language/Version**: TypeScript 5 with Next.js 15
- **Primary Dependencies**: @clerk/nextjs 6.20.2, drizzle-orm 0.44.1, zod 4.1.3
- **Storage**: PostgreSQL with Drizzle ORM, Supabase hosting
- **Testing**: Jest + React Testing Library (unit), Playwright (e2e)
- **Project Type**: Web application (Next.js app router)
- **UI Libraries**: Shadcn UI, Framer Motion, GSAP, Recharts

*Last updated: 2025-10-17*