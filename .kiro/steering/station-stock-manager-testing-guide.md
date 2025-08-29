# Station Stock Manager - Testing Guide

## Overview

This guide provides proven testing patterns and practices for the Station Stock Manager project, based on comprehensive test fixes and optimizations. All patterns in this guide have been validated and are confirmed working.

**Key Principles:**
- Simple, direct mocking over complex realistic mocking
- Test behavior, not implementation details
- Mock early, import late
- Environment-appropriate test setup

## Testing Architecture

### Test Structure
```
__tests__/
├── actions/           # Server actions (node environment)
│   ├── setup-profile.test.ts
│   ├── sales.test.ts
│   ├── suppliers.test.ts
│   └── products.test.ts
├── components/        # React components (jsdom environment)
│   ├── dashboard/
│   │   └── recent-activity.test.tsx
│   └── forms/
├── hooks/            # Custom hooks (jsdom environment)
├── utils/            # Utility functions (node environment)
│   ├── test-helpers.ts
│   └── mock-factories.ts
└── setup.ts          # Global test setup
```

### Test File Naming
- **Server Actions**: `*.test.ts`
- **Components**: `*.test.tsx`
- **Hooks**: `*.test.ts` or `*.test.tsx`
- **Utilities**: `*.test.ts`

**Environment Directives:**
```typescript
// For React components and hooks
/**
 * @jest-environment jsdom
 */

// For server actions (default - no directive needed)
// Uses node environment by default
```

## Critical Mock Setup Patterns

### ✅ Working Authentication Pattern

```typescript
// ✅ ALWAYS mock BEFORE importing
const mockAuth = jest.fn()
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

// ✅ THEN import the action
import { setupUserProfile } from "@/actions/setup-profile"

describe("Authentication Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default to authenticated user
    mockAuth.mockResolvedValue({ userId: "test-user-123" })
  })

  it("should reject unauthenticated users", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    
    const result = await actionToTest(validInput)
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Unauthorized")
  })

  it("should reject mismatched user IDs", async () => {
    mockAuth.mockResolvedValue({ userId: "different-user" })
    
    const result = await actionToTest({
      clerkUserId: "expected-user",
      // ... other data
    })
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Authentication failed")
  })
})
```

### ✅ Working Database Pattern

```typescript
// ✅ Simple, direct database mocking
const mockDb = {
  transaction: jest.fn(),
  query: {
    users: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    },
    products: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  },
  insert: jest.fn(),
  update: jest.fn(),
  select: jest.fn()
}

jest.mock("@/db", () => ({
  db: mockDb
}))

// ✅ Mock Drizzle operators
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition"),
  and: jest.fn(() => "and-condition"),
  desc: jest.fn(() => "desc-order"),
  sql: jest.fn(() => ({ raw: "sql-query" }))
}))

describe("Database Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default database behavior
    mockDb.query.users.findFirst.mockResolvedValue(null)
    
    // Simple transaction mock
    mockDb.transaction.mockImplementation(async callback => {
      return {
        user: { id: "test-user", username: "testuser" },
        station: { id: "test-station", name: "Test Station" }
      }
    })
  })

  it("should handle successful database operations", async () => {
    const result = await databaseAction(validInput)
    
    expect(result.isSuccess).toBe(true)
    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
  })

  it("should handle database errors", async () => {
    mockDb.transaction.mockRejectedValue(new Error("Database error"))
    
    const result = await databaseAction(validInput)
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Failed to process request")
  })
})
```

### ✅ Working Component Pattern

```typescript
/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ComponentToTest } from "@/components/component-to-test"

// ✅ Mock Next.js components
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

describe("ComponentToTest", () => {
  const mockProps = {
    data: [{ id: "1", name: "Test Item" }],
    onAction: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render with data", () => {
    render(<ComponentToTest {...mockProps} />)
    
    expect(screen.getByText("Test Item")).toBeInTheDocument()
  })

  it("should handle user interactions", async () => {
    const user = userEvent.setup()
    render(<ComponentToTest {...mockProps} />)
    
    await user.click(screen.getByText("Action Button"))
    
    expect(mockProps.onAction).toHaveBeenCalledTimes(1)
  })

  it("should handle empty state", () => {
    render(<ComponentToTest {...mockProps} data={[]} />)
    
    expect(screen.getByText("No items found")).toBeInTheDocument()
  })
})
```

## Server Action Testing Patterns

### 1. Complete Server Action Test Structure

```typescript
// ✅ Mock setup BEFORE imports
const mockAuth = jest.fn()
const mockDb = {
  transaction: jest.fn(),
  query: {
    users: { findFirst: jest.fn() },
    products: { findFirst: jest.fn() }
  }
}

jest.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
jest.mock("@/db", () => ({ db: mockDb }))
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition")
}))

import { actionToTest } from "@/actions/action-to-test"

describe("ActionToTest", () => {
  const validInput = {
    stationId: "station-123",
    name: "Test Item",
    value: 100
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: "user-123" })
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "user-123",
      stationId: "station-123",
      role: "manager"
    })
  })

  describe("Authentication", () => {
    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })
      
      const result = await actionToTest(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })
  })

  describe("Authorization", () => {
    it("should reject non-managers for manager actions", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        id: "user-123",
        role: "staff"
      })
      
      const result = await actionToTest(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can perform this action")
    })

    it("should reject users from different stations", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        id: "user-123",
        stationId: "different-station",
        role: "manager"
      })
      
      const result = await actionToTest(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Access denied for this station")
    })
  })

  describe("Input Validation", () => {
    it("should validate required fields", async () => {
      const result = await actionToTest({
        ...validInput,
        name: "" // Invalid
      })
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("required")
    })

    it("should validate data constraints", async () => {
      const result = await actionToTest({
        ...validInput,
        value: -100 // Invalid negative value
      })
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("must be positive")
    })
  })

  describe("Business Logic", () => {
    it("should handle successful operations", async () => {
      mockDb.transaction.mockResolvedValue({
        id: "new-item-123",
        name: "Test Item"
      })
      
      const result = await actionToTest(validInput)
      
      expect(result.isSuccess).toBe(true)
      expect(result.data.name).toBe("Test Item")
      expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    })

    it("should handle business rule violations", async () => {
      mockDb.query.products.findFirst.mockResolvedValue({
        currentStock: 5 // Insufficient stock
      })
      
      const result = await actionToTest({
        ...validInput,
        requestedQuantity: 10
      })
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("Insufficient stock")
    })
  })

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockDb.transaction.mockRejectedValue(new Error("Connection failed"))
      
      const result = await actionToTest(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to process request")
    })
  })
})
```

### 2. Stock Management Testing Pattern

```typescript
describe("Stock Operations", () => {
  beforeEach(() => {
    mockDb.query.products.findFirst.mockResolvedValue({
      id: "product-123",
      currentStock: 100,
      minStockLevel: 20
    })
  })

  it("should prevent negative stock", async () => {
    const result = await recordStockAdjustment({
      productId: "product-123",
      adjustment: -150, // Would result in negative stock
      reason: "damage"
    })
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toContain("negative stock")
  })

  it("should update stock levels correctly", async () => {
    mockDb.transaction.mockImplementation(async callback => ({
      product: {
        id: "product-123",
        currentStock: 110, // 100 + 10
        previousStock: 100
      }
    }))
    
    const result = await recordStockAdjustment({
      productId: "product-123",
      adjustment: 10,
      reason: "restock"
    })
    
    expect(result.isSuccess).toBe(true)
    expect(result.data.product.currentStock).toBe(110)
  })

  it("should trigger low stock alerts", async () => {
    const result = await recordStockAdjustment({
      productId: "product-123",
      adjustment: -85, // Results in 15, below minimum of 20
      reason: "sale"
    })
    
    expect(result.isSuccess).toBe(true)
    expect(result.data.lowStockAlert).toBe(true)
  })
})
```

## Component Testing Patterns

### 1. Form Component Testing

```typescript
/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProductForm } from "@/components/forms/product-form"

describe("ProductForm", () => {
  const mockProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    initialData: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("User Interactions", () => {
    it("should handle form submission", async () => {
      const user = userEvent.setup()
      render(<ProductForm {...mockProps} />)
      
      await user.type(screen.getByLabelText("Product Name"), "Test Product")
      await user.type(screen.getByLabelText("Price"), "100")
      await user.click(screen.getByRole("button", { name: "Save" }))
      
      expect(mockProps.onSubmit).toHaveBeenCalledWith({
        name: "Test Product",
        price: 100
      })
    })

    it("should display validation errors", async () => {
      const user = userEvent.setup()
      render(<ProductForm {...mockProps} />)
      
      await user.click(screen.getByRole("button", { name: "Save" }))
      
      expect(screen.getByText("Product name is required")).toBeInTheDocument()
    })

    it("should handle cancellation", async () => {
      const user = userEvent.setup()
      render(<ProductForm {...mockProps} />)
      
      await user.click(screen.getByRole("button", { name: "Cancel" }))
      
      expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe("Data Display", () => {
    it("should populate form with initial data", () => {
      const initialData = {
        id: "product-123",
        name: "Existing Product",
        price: 150
      }
      
      render(<ProductForm {...mockProps} initialData={initialData} />)
      
      expect(screen.getByDisplayValue("Existing Product")).toBeInTheDocument()
      expect(screen.getByDisplayValue("150")).toBeInTheDocument()
    })
  })
})
```

### 2. Role-Based Component Testing

```typescript
describe("Role-Based Access", () => {
  it("should show manager actions for managers", () => {
    render(<Dashboard userRole="manager" />)
    
    expect(screen.getByText("Delete Product")).toBeInTheDocument()
    expect(screen.getByText("Manage Users")).toBeInTheDocument()
  })

  it("should hide manager actions for staff", () => {
    render(<Dashboard userRole="staff" />)
    
    expect(screen.queryByText("Delete Product")).not.toBeInTheDocument()
    expect(screen.queryByText("Manage Users")).not.toBeInTheDocument()
  })

  it("should show appropriate navigation for role", () => {
    render(<Navigation userRole="staff" />)
    
    expect(screen.getByText("Sales")).toBeInTheDocument()
    expect(screen.getByText("Inventory")).toBeInTheDocument()
    expect(screen.queryByText("Reports")).not.toBeInTheDocument()
  })
})
```

## Business Logic Testing

### 1. Currency and Calculations

```typescript
describe("Business Calculations", () => {
  it("should calculate prices correctly", () => {
    const result = calculateTotalPrice([
      { quantity: 10, unitPrice: 150 },
      { quantity: 5, unitPrice: 200 }
    ])
    
    expect(result.subtotal).toBe(2500) // (10*150) + (5*200)
    expect(result.tax).toBe(250) // 10% tax
    expect(result.total).toBe(2750)
  })

  it("should format Nigerian currency correctly", () => {
    expect(formatCurrency(1500.50)).toBe("₦1,501") // Rounded
    expect(formatCurrency(0)).toBe("₦0")
    expect(formatCurrency(1000000)).toBe("₦1,000,000")
  })

  it("should calculate stock levels accurately", () => {
    const movements = [
      { type: "in", quantity: 100 },
      { type: "out", quantity: 25 },
      { type: "out", quantity: 10 }
    ]
    
    const currentStock = calculateCurrentStock(0, movements)
    expect(currentStock).toBe(65) // 0 + 100 - 25 - 10
  })
})
```

### 2. Data Validation Testing

```typescript
describe("Data Validation", () => {
  it("should validate product types", () => {
    expect(isValidProductType("fuel")).toBe(true)
    expect(isValidProductType("lubricant")).toBe(true)
    expect(isValidProductType("invalid")).toBe(false)
  })

  it("should validate user roles", () => {
    expect(isValidUserRole("manager")).toBe(true)
    expect(isValidUserRole("staff")).toBe(true)
    expect(isValidUserRole("admin")).toBe(false)
  })

  it("should validate stock movement types", () => {
    const validTypes = ["sale", "restock", "adjustment", "damage"]
    validTypes.forEach(type => {
      expect(isValidMovementType(type)).toBe(true)
    })
    expect(isValidMovementType("invalid")).toBe(false)
  })
})
```

## Hook Testing Patterns

### 1. Custom Hook Testing

```typescript
/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react"
import { useInventoryManager } from "@/hooks/use-inventory-manager"

describe("useInventoryManager", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useInventoryManager())
    
    expect(result.current.products).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it("should handle loading state", async () => {
    const { result } = renderHook(() => useInventoryManager())
    
    act(() => {
      result.current.fetchProducts()
    })
    
    expect(result.current.loading).toBe(true)
    
    // Wait for async operation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.loading).toBe(false)
  })

  it("should handle errors", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))
    
    const { result } = renderHook(() => useInventoryManager())
    
    await act(async () => {
      await result.current.fetchProducts()
    })
    
    expect(result.current.error).toBe("Failed to fetch products")
    expect(result.current.products).toEqual([])
  })
})
```

## Test Data Patterns

### 1. Mock Data Factories

```typescript
// __tests__/utils/mock-factories.ts

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "product-123",
  name: "Test Product",
  type: "fuel",
  currentStock: 100,
  minStockLevel: 20,
  unitPrice: 150,
  stationId: "station-123",
  supplierId: "supplier-123",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides
})

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  clerkUserId: "clerk-user-123",
  username: "testuser",
  role: "manager",
  stationId: "station-123",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides
})

export const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "transaction-123",
  stationId: "station-123",
  userId: "user-123",
  totalAmount: "1500",
  paymentMethod: "cash",
  createdAt: new Date("2024-01-01"),
  ...overrides
})

export const createMockSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: "supplier-123",
  name: "Test Supplier",
  contactInfo: "test@supplier.com",
  stationId: "station-123",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides
})
```

### 2. Using Mock Data

```typescript
import { createMockProduct, createMockUser } from "../utils/mock-factories"

describe("Product Management", () => {
  it("should handle low stock products", async () => {
    const lowStockProduct = createMockProduct({
      currentStock: 10, // Below minimum of 20
      minStockLevel: 20
    })
    
    const manager = createMockUser({ role: "manager" })
    
    mockDb.query.products.findFirst.mockResolvedValue(lowStockProduct)
    mockDb.query.users.findFirst.mockResolvedValue(manager)
    
    const result = await checkStockLevels("station-123")
    
    expect(result.lowStockAlerts).toHaveLength(1)
    expect(result.lowStockAlerts[0].productId).toBe(lowStockProduct.id)
  })
})
```

## Error Handling Testing

### 1. Network and Database Errors

```typescript
describe("Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    mockDb.query.products.findMany.mockRejectedValue(
      new Error("Connection timeout")
    )
    
    const result = await getProducts("station-123")
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Failed to fetch products")
  })

  it("should handle validation errors", async () => {
    const result = await createProduct({
      name: "", // Invalid
      type: "invalid-type", // Invalid
      currentStock: -10 // Invalid
    })
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toContain("validation")
  })

  it("should handle authentication expiry", async () => {
    mockAuth.mockRejectedValue(new Error("Token expired"))
    
    const result = await protectedAction()
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Authentication failed")
  })
})
```

## Performance Testing

### 1. Large Dataset Handling

```typescript
describe("Performance", () => {
  it("should handle large product lists efficiently", async () => {
    const largeProductList = Array.from({ length: 1000 }, (_, i) =>
      createMockProduct({ id: `product-${i}`, name: `Product ${i}` })
    )
    
    mockDb.query.products.findMany.mockResolvedValue(largeProductList)
    
    const startTime = Date.now()
    const result = await getProducts("station-123")
    const executionTime = Date.now() - startTime
    
    expect(result.isSuccess).toBe(true)
    expect(result.data).toHaveLength(1000)
    expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
  })

  it("should paginate large datasets", async () => {
    const result = await getProducts("station-123", {
      page: 2,
      limit: 50
    })
    
    expect(result.isSuccess).toBe(true)
    expect(result.data.length).toBeLessThanOrEqual(50)
    expect(result.pagination.page).toBe(2)
  })
})
```

## Test Utilities

### 1. Common Test Helpers

```typescript
// __tests__/utils/test-helpers.ts

export const waitForAsync = (ms: number = 0) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const mockSuccessResponse = (data: any) => ({
  isSuccess: true,
  data,
  error: null
})

export const mockErrorResponse = (error: string) => ({
  isSuccess: false,
  data: null,
  error
})

export const setupAuthenticatedUser = (role: "manager" | "staff" = "manager") => {
  const userId = `${role}-user-123`
  mockAuth.mockResolvedValue({ userId })
  mockDb.query.users.findFirst.mockResolvedValue(
    createMockUser({ clerkUserId: userId, role })
  )
  return userId
}

export const setupDatabaseError = (operation: string, error: string = "Database error") => {
  mockDb[operation].mockRejectedValue(new Error(error))
}

export const expectActionSuccess = (result: any, expectedData?: any) => {
  expect(result.isSuccess).toBe(true)
  expect(result.error).toBeNull()
  if (expectedData) {
    expect(result.data).toEqual(expect.objectContaining(expectedData))
  }
}

export const expectActionFailure = (result: any, expectedError: string) => {
  expect(result.isSuccess).toBe(false)
  expect(result.error).toBe(expectedError)
  expect(result.data).toBeNull()
}
```

## Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./"
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node", // Default for server actions
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "**/?(*.)+(spec|test).{js,jsx,ts,tsx}"
  ],
  testTimeout: 30000,
  transformIgnorePatterns: ["node_modules/(?!(postgres|drizzle-orm)/)"],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "actions/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

### Global Setup

```javascript
// jest.setup.js
require("@testing-library/jest-dom")

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CLERK_SECRET_KEY = "sk_test_mock"

// Global test timeout
jest.setTimeout(30000)

// Suppress console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.("Warning:")) {
    return
  }
  originalWarn(...args)
}

// Mock Next.js router globally
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  }),
  usePathname: () => "/test-path"
}))
```

## Coverage Requirements

### Minimum Coverage Targets
- **Server Actions**: 85% (all branches, functions, lines)
- **Components**: 80% (focus on user interactions)
- **Business Logic**: 90% (critical calculations and validations)
- **Error Handling**: 100% (all error paths must be tested)

### Coverage Commands
```bash
# Run tests with coverage
npm run test -- --coverage

# Generate coverage report
npm run test -- --coverage --coverageDirectory=coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Test Organization
- **One concept per test**: Each test should verify one specific behavior
- **Descriptive test names**: Use "should [expected behavior] when [condition]"
- **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
- **Group related tests**: Use `describe` blocks to organize related test cases

### 2. Mock Management
- **Mock at module level**: Always mock modules before importing
- **Reset mocks**: Use `jest.clearAllMocks()` in `beforeEach`
- **Simple mocks**: Prefer direct return values over complex implementations
- **Test behavior**: Mock external dependencies, test your code's behavior

### 3. Assertions
- **Specific assertions**: Use precise matchers (`toBe`, `toEqual`, `toContain`)
- **Meaningful messages**: Add custom error messages for complex assertions
- **Test edge cases**: Include boundary conditions and error scenarios
- **Avoid implementation details**: Test public API, not internal mechanics

### 4. Test Maintenance
- **Keep tests simple**: Complex tests are harder to maintain and debug
- **Update with code changes**: Tests should evolve with the codebase
- **Regular cleanup**: Remove obsolete tests and update deprecated patterns
- **Consistent patterns**: Use established patterns across the test suite

## Common Pitfalls to Avoid

### ❌ Wrong Patterns

```typescript
// ❌ DON'T: Import before mocking
import { actionToTest } from "@/actions/action"
jest.mock("@clerk/nextjs/server")

// ❌ DON'T: Complex chained mocking
mockDb.insert.mockReturnValue({
  values: jest.fn().mockReturnValue({
    returning: jest.fn().mockReturnValue({
      where: jest.fn()
    })