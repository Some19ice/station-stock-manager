# Station Stock Manager - Amazon Q Project Rules

This file provides guidance for Amazon Q when working with the Station Stock Manager codebase - a comprehensive fuel inventory management system designed for gas stations.

## Project Overview

**Station Stock Manager** is a Next.js 15 application that provides real-time fuel inventory management for gas stations with role-based dashboards for sales staff and managers.

### Key Features
- Real-time inventory tracking for fuel and products
- Role-based dashboards for sales staff and managers
- Sales transaction recording and management
- Stock movement monitoring and low stock alerts
- Multi-station support with comprehensive reporting
- Staff management and user access control

## Commands & Scripts

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

### Route Structure
- `/app/(unauthenticated)` - Public routes
  - `(marketing)` - Landing pages and marketing content
  - `setup-profile` - Initial user profile setup
  - `confirmation` - Account confirmation flows
  - `unauthorized` - Access denied pages
- `/app/(authenticated)` - Protected routes requiring Clerk auth
  - `dashboard` - Manager dashboard with analytics, inventory, reports, user management
  - `staff` - Sales staff interface for transactions and daily summaries
- `/app/api` - API routes for server-side operations

### Key Patterns & Features
- **Role-Based Access**: Separate interfaces for sales staff and managers
- **Server Actions** in `/actions` for data mutations (sales, inventory, reports, user management)
- **Database Schema** in `/db/schema` using Drizzle ORM with PostgreSQL
  - Stations, products (fuel types, accessories), users, transactions
  - Stock movements, suppliers, customers, transaction items
- **UI Components** from Shadcn UI library with custom animations (Framer Motion, GSAP)
- **Authentication** handled by Clerk middleware with role-based route protection
- **Real-time Features** for inventory tracking and sales monitoring

### Data Flow
1. Authentication and role-based access managed by Clerk (`@clerk/nextjs`)
2. Station and inventory data stored in PostgreSQL via Drizzle ORM
3. Sales transactions recorded with real-time stock updates
4. Server actions handle all data mutations with proper auth and role checks
5. Dashboard analytics computed from transaction and inventory data

## User Roles

### Sales Staff
- Record sales transactions
- View daily sales summaries
- Access frequently sold products for quick sales
- View recent transaction history

### Manager
- Access comprehensive dashboard with key metrics
- Monitor low stock alerts and inventory levels
- Manage staff and user roles
- View detailed analytics and reports
- Perform end-of-day summaries
- Manage suppliers and product catalog

## Database Schema

### Core Entities
- **Stations**: Multi-location support with station-specific settings
- **Products**: Fuel types (gasoline, diesel), lubricants, accessories
- **Users**: Staff and manager roles with authentication via Clerk
- **Transactions**: Sales records with line items and payment details
- **Stock Movements**: Inventory tracking (deliveries, sales, adjustments)
- **Suppliers**: Vendor management for product sourcing
- **Customers**: Customer information for transactions (optional)

### Key Relationships
- Transactions → Transaction Items (one-to-many)
- Products → Stock Movements (one-to-many)
- Stations → Users (one-to-many)
- Suppliers → Products (one-to-many)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with Shadcn UI components
- **Animations**: Framer Motion, GSAP
- **State Management**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization

### Backend
- **Database**: PostgreSQL with Supabase
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Clerk with role-based access control
- **API**: Next.js Server Actions and API routes

### Development Tools
- **TypeScript**: Full type safety across the application
- **Testing**: Jest + React Testing Library (unit), Playwright (e2e)
- **Code Quality**: ESLint, Prettier, strict TypeScript config
- **Build Tools**: Turbopack for fast development builds

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=<postgresql_connection_string>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_public_key>
CLERK_SECRET_KEY=<clerk_secret_key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure in `/components`
- Use Server Actions for data mutations in `/actions`
- Implement proper error handling and validation with Zod schemas
- Use Shadcn UI components for consistent design

### Database Operations
- Use Drizzle ORM for all database operations
- Generate migrations for schema changes
- Include proper indexes for performance-critical queries
- Use transactions for multi-table operations

### Authentication & Authorization
- All authenticated routes must check user roles
- Use Clerk middleware for route protection
- Implement role-based UI rendering (staff vs manager views)
- Secure all server actions with proper auth checks

### Testing Strategy
- Write unit tests for utilities and complex business logic
- Test React components with React Testing Library
- Create e2e tests for critical user workflows (sales, inventory)
- Maintain good test coverage for server actions

### Performance Considerations
- Use Next.js Image component for optimized images
- Implement proper loading states and error boundaries
- Optimize database queries with proper indexing
- Use React.memo and useMemo for expensive computations

## Common Patterns

### Server Actions Structure
```typescript
// Typical server action pattern
export async function createTransaction(data: TransactionFormData) {
  // 1. Authentication check
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  
  // 2. Validation
  const validatedData = transactionSchema.parse(data)
  
  // 3. Database operation with transaction
  return await db.transaction(async (tx) => {
    // Multiple related operations
  })
}
```

### Component Structure
- Use functional components with TypeScript
- Implement proper prop types with interfaces
- Use custom hooks for reusable logic
- Follow the compound component pattern for complex UI

### Error Handling
- Use error boundaries for React component errors
- Implement proper error responses in server actions
- Show user-friendly error messages with toast notifications
- Log errors appropriately for debugging