# Frontend Design Guide - Station Stock Manager

## Overview

This guide provides comprehensive instructions for developing the Station Stock Manager SaaS application using Next.js 15, TypeScript, and modern React patterns. As an AI expert on frontend design, follow these guidelines for all development tasks within this project.

## Architecture Context

This is a **Next.js 15 SaaS template** using the App Router with clear separation between authenticated and unauthenticated routes:

- **Route Structure:**
  - `/app/(unauthenticated)` - Public routes (marketing, auth)
  - `/app/(authenticated)` - Protected routes requiring Clerk authentication
  - `/app/api` - API routes including Stripe webhook handlers

- **Key Technologies:**
  - Next.js 15 with App Router and React 19
  - TypeScript for type safety
  - TailwindCSS v4 with CSS variables
  - Shadcn UI components (New York style)
  - Clerk authentication
  - Drizzle ORM with PostgreSQL
  - Stripe payments integration

## Implementation Framework Guidelines

### Next.js App Router Patterns
- **Use Server Components by default** for better performance
- **Use Client Components** only when needed:
  ```tsx
  "use client"
  // Only for interactivity, state, or browser APIs
  ```
- **Leverage Server Actions** for data mutations in `/actions`
- **Follow route group conventions** for authenticated vs unauthenticated routes

### TypeScript Requirements
- **Always use TypeScript** for all new files
- **Define proper interfaces** for props and data structures
- **Leverage type inference** from Drizzle schema
- **Use generic types** for reusable components
- **Import types properly**:
  ```tsx
  import type { NextPage } from 'next'
  import type { User } from '@clerk/nextjs/server'
  ```

## Component Architecture

### Component Organization
Follow the established project structure:

```
/components
├── ui/              # Shadcn UI components
├── auth/            # Authentication components  
├── dashboard/       # Dashboard-specific components
├── inventory/       # Inventory management components
├── products/        # Product-related components
├── sales/           # Sales components
├── reports/         # Reporting components
├── payments/        # Stripe payment components
└── utility/         # Utility components
```

### Shadcn UI Integration
- **Use existing Shadcn components** from `/components/ui`
- **Install new components** with: `npx shadcn@latest add [component-name]`
- **Customize via CSS variables** in `globals.css`
- **Follow New York style** conventions

### Component Best Practices
```tsx
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
  }
  onEdit?: (id: string) => void
}

export const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  onEdit 
}) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-muted-foreground">Stock: {product.stock}</p>
      <p className="font-medium">${product.price}</p>
      {onEdit && (
        <Button onClick={() => onEdit(product.id)} className="mt-4">
          Edit Product
        </Button>
      )}
    </Card>
  )
}
```

## Available Libraries & Integrations

### UI & Design System
- **@radix-ui/react-*** - Headless UI primitives (pre-installed)
- **lucide-react** - Icon library with 1000+ icons
  ```tsx
  import { Package, DollarSign, TrendingUp } from 'lucide-react'
  ```
- **class-variance-authority** - Type-safe component variants
- **tailwind-merge & clsx** - Conditional className utilities

### Animations & Interactions  
- **framer-motion** - Production-ready animations
  ```tsx
  import { motion } from 'framer-motion'
  
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="dashboard-card"
  >
    {/* Content */}
  </motion.div>
  ```

### Data & Forms
- **react-hook-form** - Form handling with validation
- **@hookform/resolvers** - Validation resolvers
- **zod** - Schema validation (matches backend)
- **drizzle-orm** - Type-safe database queries

### Business Integrations
- **@clerk/nextjs** - Authentication and user management
- **stripe** - Payment processing
- **next-themes** - Theme switching support

## Styling Guidelines

### TailwindCSS v4 Best Practices
- **Use CSS variables** defined in `globals.css` for consistent theming
- **Leverage brand colors**:
  ```tsx
  className="bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-foreground"
  ```
- **Follow component-specific patterns**:
  ```tsx
  // Dashboard cards
  className="bg-card text-card-foreground border border-border rounded-lg shadow-sm"
  
  // Interactive elements
  className="hover:bg-accent hover:text-accent-foreground transition-colors"
  ```

### Responsive Design Patterns
- **Mobile-first approach** for inventory management
- **Desktop-optimized** dashboard layouts
- **Tablet considerations** for data entry forms

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Stock item cards */}
</div>
```

### Dark Mode Support
- **Use CSS variables** for automatic dark mode
- **Test both themes** for all components
- **Leverage `next-themes`** for theme switching

## Domain-Specific Patterns

### Inventory Management UI
```tsx
// Stock level indicators
const getStockStatus = (current: number, minimum: number) => {
  if (current === 0) return { color: 'destructive', label: 'Out of Stock' }
  if (current <= minimum) return { color: 'amber', label: 'Low Stock' }
  return { color: 'green', label: 'In Stock' }
}

// Product listings with actions
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Product</TableHead>
      <TableHead>Current Stock</TableHead>
      <TableHead>Minimum Level</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  {/* Table body */}
</Table>
```

### Dashboard Metrics
```tsx
// Key performance indicators
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="p-6">
    <div className="flex items-center gap-2">
      <Package className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">Total Products</span>
    </div>
    <p className="text-2xl font-bold">{totalProducts}</p>
    <p className="text-xs text-muted-foreground">+12% from last month</p>
  </Card>
</div>
```

### Forms & Data Entry
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '@/lib/schemas'

const ProductForm = () => {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
      minimumLevel: 5
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional fields */}
      </form>
    </Form>
  )
}
```

## Authentication & Authorization

### Clerk Integration Patterns
```tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import { SignInButton, UserButton } from '@clerk/nextjs'

// Server component authentication
export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  
  const user = await currentUser()
  // Component logic
}

// Client component authentication
"use client"
import { useUser } from '@clerk/nextjs'

export const UserProfile = () => {
  const { user, isLoaded } = useUser()
  if (!isLoaded) return <Skeleton />
  return <div>Welcome, {user?.firstName}!</div>
}
```

## Server Actions & Data Flow

### Server Action Patterns
```tsx
// /actions/products.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { products } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')
  
  const productData = {
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    userId
  }
  
  await db.insert(products).values(productData)
  revalidatePath('/dashboard/products')
}
```

### Data Fetching Patterns
```tsx
// Server component data fetching
import { db } from '@/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function ProductsPage() {
  const { userId } = auth()
  const userProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId!))
  
  return <ProductList products={userProducts} />
}
```

## Performance & Best Practices

### Optimization Patterns
- **Use Server Components** for data-heavy pages
- **Implement proper loading states** with Suspense
- **Optimize images** with Next.js Image component
- **Use dynamic imports** for large client components

```tsx
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Suspense fallback={<DashboardSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}
```

### Error Handling
```tsx
// Error boundaries and error pages
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-lg font-semibold">Something went wrong!</h2>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  )
}
```

## Testing Considerations

### Component Testing
- **Jest + Testing Library** for unit tests
- **Mock Clerk** authentication in tests
- **Test server actions** with proper setup
- **Playwright** for E2E testing

```tsx
// Example component test
import { render, screen } from '@testing-library/react'
import { ProductCard } from '../ProductCard'

test('displays product information correctly', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    stock: 10
  }
  
  render(<ProductCard product={mockProduct} />)
  expect(screen.getByText('Test Product')).toBeInTheDocument()
  expect(screen.getByText('Stock: 10')).toBeInTheDocument()
})
```

## Accessibility Guidelines

### Stock Management Accessibility
- **Screen reader friendly** inventory tables
- **Keyboard navigation** for data entry forms  
- **Color contrast** for stock status indicators
- **Focus management** in modal dialogs
- **ARIA labels** for complex interactions

```tsx
<div
  role="alert"
  aria-live="polite"
  className={cn(
    "p-3 rounded-md",
    stockLevel === 0 && "bg-destructive/10 text-destructive"
  )}
>
  <span className="sr-only">
    {stockLevel === 0 ? 'Critical: ' : ''}
  </span>
  Product is {stockLevel === 0 ? 'out of stock' : `low on stock (${stockLevel} remaining)`}
</div>
```

## Development Workflow

### Code Quality Commands
```bash
npm run dev          # Start development with Turbopack
npm run build        # Production build
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix linting issues
npm run types        # TypeScript checking
npm run format:write # Prettier formatting
npm run clean        # Lint + format together
```

### Database Operations
```bash
npx drizzle-kit push      # Push schema to database
npx drizzle-kit generate  # Generate migrations
npx bun db/seed          # Seed database
```

## Final Checklist

Before delivering any feature:
- [ ] TypeScript types are properly defined
- [ ] Server/Client components used appropriately  
- [ ] Authentication checks implemented
- [ ] Shadcn UI components used consistently
- [ ] Responsive design implemented
- [ ] Error handling included
- [ ] Loading states provided
- [ ] Accessibility features included
- [ ] Server actions follow security patterns
- [ ] Database queries are optimized

## Business Context Reminders

Remember this is a **Station Stock Manager** system, so:
- **Focus on inventory workflows** (stock levels, reordering, tracking)
- **Prioritize data accuracy** in stock management
- **Consider real-world usage** (mobile scanning, quick updates)
- **Include relevant business metrics** (turnover rates, profit margins)
- **Design for efficiency** in daily operations

The goal is to create a professional, efficient stock management system that station owners would rely on for their daily operations.