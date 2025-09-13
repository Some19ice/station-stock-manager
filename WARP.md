# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (Next.js 15)
- `npm run dev:turbo` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run analyze` - Build with bundle analysis

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Run lint:fix and format:write together

### Database Operations
- `npm run db:local` - Start local Supabase instance
- `npx drizzle-kit generate` - Generate migration files from schema changes
- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit push` - Push schema changes directly to database
- `npm run db:seed` - Seed database with sample data

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests only
- `npm run test:e2e` - Run Playwright e2e tests only

### Single Test Execution
- `npm run test:unit -- --testNamePattern="Sales"` - Run specific unit test pattern
- `npm run test:e2e -- --grep="inventory"` - Run specific e2e test pattern

### UI Components
- `npx shadcn@latest add [component-name]` - Add new Shadcn UI components

## Architecture

### Project Overview
Station Stock Manager is a comprehensive fuel inventory management system for gas stations, built with Next.js 15, TypeScript, and PostgreSQL. It provides role-based dashboards for sales staff and managers with real-time inventory tracking, sales management, and analytics.

### Key Technologies
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: PostgreSQL, Drizzle ORM, Server Actions
- **Authentication**: Clerk with role-based access control
- **Animation**: GSAP, Framer Motion
- **Testing**: Jest + React Testing Library (unit), Playwright (e2e)

### Route Structure
```
/app
├── (unauthenticated)/          # Public routes
│   ├── (marketing)/            # Landing pages
│   ├── setup-profile/          # User onboarding
│   ├── confirmation/           # Account verification
│   └── unauthorized/           # Access denied
├── (authenticated)/            # Protected routes
│   ├── dashboard/              # Manager interface
│   └── staff/                  # Sales staff interface
└── api/                        # Server-side API routes
```

### Core Patterns

#### Role-Based Access Control
- **Sales Staff**: Transaction recording, daily summaries, quick sales interface
- **Manager**: Full dashboard access, inventory management, analytics, staff management
- Authentication handled by Clerk middleware with route protection based on user roles

#### Database Architecture
- **Core Tables**: stations, users, products, transactions, transaction_items, stock_movements
- **PMS-Specific**: pump_configurations, pump_meter_readings, daily_pms_calculations, pms_sales_records
- **Supporting**: customers, suppliers, theme_settings
- All tables use UUID primary keys and include proper foreign key relationships

#### Data Flow
1. **Authentication**: Clerk manages user sessions and role-based access
2. **Server Actions** (`/actions/`): Handle all data mutations with proper auth checks
3. **Real-time Updates**: Live inventory tracking and sales monitoring
4. **Database Operations**: Drizzle ORM with type-safe queries and migrations

#### Component Organization
- `/components/auth/` - Authentication and role guards
- `/components/dashboard/` - Manager dashboard components
- `/components/inventory/` - Stock management interfaces
- `/components/sales/` - Transaction recording components
- `/components/reports/` - Analytics and reporting
- `/components/pms/` - Petrol Management System specific components

#### Testing Strategy
- **Unit Tests**: Component rendering, business logic, form validation, server actions
- **E2E Tests**: Complete user workflows, authentication flows, role-based access
- Playwright configured for multiple browsers and mobile viewports

### Environment Variables
Required for development:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `CLERK_SECRET_KEY` - Clerk server-side operations
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`

### Development Workflow

#### Database Schema Changes
1. Modify schema files in `/db/schema/`
2. Generate migrations: `npx drizzle-kit generate`
3. Apply migrations: `npx drizzle-kit migrate`
4. Update type definitions are automatically inferred

#### Adding New Features
1. Create server actions in `/actions/` with proper authentication
2. Build UI components using Shadcn UI patterns
3. Add proper TypeScript types and Zod validation
4. Write unit and e2e tests for new functionality
5. Ensure role-based access controls are properly implemented

#### Code Quality Standards
- Use TypeScript for all new code with strict type checking
- Follow existing component patterns and file organization
- Include proper error handling and loading states
- Use Zod schemas for form validation and API input validation
- Implement proper authentication checks in all server actions
