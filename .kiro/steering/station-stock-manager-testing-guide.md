# Station Stock Manager - Testing Guide

## Overview

This document provides comprehensive testing guidelines for the Station Stock Manager project. Follow these patterns and practices to ensure consistent, reliable, and maintainable tests across the entire application.

## Testing Architecture

### Test Structure
```
__tests__/
├── actions/           # Server action tests
├── components/        # React component tests
├── hooks/            # Custom hook tests
├── middleware/       # Middleware tests
├── utils/            # Utility function tests
└── e2e/              # End-to-end tests (future)
```

### Test File Naming
- Server actions: `__tests__/actions/[action-name].test.ts`
- Components: `__tests__/components/[component-path]/[component-name].test.tsx`
- Hooks: `__tests__/hooks/[hook-name].test.ts`
- Utilities: `__tests__/utils/[util-name].test.ts`

## Mocking Strategies

### 1. Database Mocking Pattern
```typescript
// Mock the database with proper chainable methods
const mockDb = {
  insert: jest.fn(),
  update: jest.fn(),
  transaction: jest.fn(),
  query: {
    users: { findFirst: jest.fn() },
    products: { findMany: jest.fn(), findFirst: jest.fn() },
    transactions: { findMany: jest.fn() },
    stockMovements: { findMany: jest.fn() }
  }
}

jest.mock("@/db", () => ({ db: mockDb }))

// Setup chainable methods in beforeEach
beforeEach(() => {
  const mockChain = {
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([])
  }
  
  mockDb.insert.mockReturnValue(mockChain)
  mockDb.update.mockReturnValue(mockChain)
  mockDb.transaction.mockImplementation((callback) => callback(mockDb))
})
```

### 2. Authentication Mocking Pattern
```typescript
// Mock Clerk authentication
const mockAuth = jest.fn()
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

// Setup auth responses
beforeEach(() => {
  mockAuth.mockResolvedValue({ userId: null }) // Default unauthenticated
})

// In specific tests
mockAuth.mockResolvedValue({ userId: "user-123" })
```

### 3. Schema Mocking Pattern
```typescript
// Mock database schema to prevent import errors
jest.mock("@/db/schema", () => ({
  products: {},
  stockMovements: {},
  users: {},
  transactions: {},
  transactionItems: {}
}))
```

## Server Action Testing Patterns

### 1. Basic Server Action Test Structure
```typescript
describe("ActionName", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mocks
  })

  describe("Authentication", () => {
    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })
      
      const result = await actionName(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })
  })

  describe("Authorization", () => {
    it("should reject non-managers for manager-only actions", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" })
      mockDb.query.users.findFirst.mockResolvedValue({
        role: "staff"
      })
      
      const result = await managerOnlyAction(validInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("manager")
    })
  })

  describe("Input Validation", () => {
    it("should validate required fields", async () => {
      const invalidInput = { ...validInput, requiredField: "" }
      
      const result = await actionName(invalidInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("required")
    })

    it("should validate data types and constraints", async () => {
      const invalidInput = { ...validInput, numericField: -1 }
      
      const result = await actionName(invalidInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("positive")
    })
  })

  describe("Business Logic", () => {
    it("should handle successful operations", async () => {
      // Setup successful mocks
      mockAuth.mockResolvedValue({ userId: "user-123" })
      mockDb.query.users.findFirst.mockResolvedValue({ role: "manager" })
      
      const result = await actionName(validInput)
      
      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
    })

    it("should handle business rule violations", async () => {
      // Test specific business rules
      const result = await actionName(businessRuleViolatingInput)
      
      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("business rule message")
    })
  })
})
```

### 2. Stock Management Testing Pattern
```typescript
describe("Stock Operations", () => {
  it("should prevent negative stock", async () => {
    mockDb.query.products.findFirst.mockResolvedValue({
      currentStock: "10"
    })
    
    const result = await updateStock({
      productId: "product-123",
      quantity: -20, // More than available
      movementType: "sale"
    })
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toContain("Insufficient stock")
  })

  it("should update stock levels correctly", async () => {
    mockDb.query.products.findFirst.mockResolvedValue({
      currentStock: "100"
    })
    
    const result = await updateStock({
      productId: "product-123",
      quantity: -10,
      movementType: "sale"
    })
    
    expect(result.isSuccess).toBe(true)
    // Verify stock movement was recorded
    expect(mockDb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        movementType: "sale",
        quantity: "-10"
      })
    )
  })
})
```

## Component Testing Patterns

### 1. Basic Component Test Structure
```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ComponentName } from "@/components/path/component-name"

// Mock dependencies
jest.mock("@/actions/action-name", () => ({
  actionName: jest.fn()
}))

describe("ComponentName", () => {
  const defaultProps = {
    // Define default props
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ComponentName {...defaultProps} />)
      
      expect(screen.getByText("Expected Text")).toBeInTheDocument()
    })

    it("should render different states correctly", () => {
      render(<ComponentName {...defaultProps} loading={true} />)
      
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
  })

  describe("User Interactions", () => {
    it("should handle form submission", async () => {
      const mockAction = jest.fn().mockResolvedValue({ isSuccess: true })
      require("@/actions/action-name").actionName.mockImplementation(mockAction)
      
      render(<ComponentName {...defaultProps} />)
      
      fireEvent.change(screen.getByLabelText("Input Label"), {
        target: { value: "test value" }
      })
      fireEvent.click(screen.getByText("Submit"))
      
      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            field: "test value"
          })
        )
      })
    })
  })

  describe("Error Handling", () => {
    it("should display error messages", async () => {
      const mockAction = jest.fn().mockResolvedValue({
        isSuccess: false,
        error: "Test error message"
      })
      require("@/actions/action-name").actionName.mockImplementation(mockAction)
      
      render(<ComponentName {...defaultProps} />)
      
      fireEvent.click(screen.getByText("Submit"))
      
      await waitFor(() => {
        expect(screen.getByText("Test error message")).toBeInTheDocument()
      })
    })
  })
})
```

### 2. Role-Based Component Testing
```typescript
describe("Role-Based Access", () => {
  it("should show manager-only features for managers", () => {
    render(
      <ComponentName 
        {...defaultProps} 
        user={{ role: "manager" }} 
      />
    )
    
    expect(screen.getByText("Manager Action")).toBeInTheDocument()
  })

  it("should hide manager-only features for staff", () => {
    render(
      <ComponentName 
        {...defaultProps} 
        user={{ role: "staff" }} 
      />
    )
    
    expect(screen.queryByText("Manager Action")).not.toBeInTheDocument()
  })
})
```

## Business Logic Testing

### 1. Currency and Calculations
```typescript
describe("Business Calculations", () => {
  it("should calculate prices correctly", () => {
    const quantity = 10
    const unitPrice = 650.50
    const total = quantity * unitPrice
    
    expect(total).toBe(6505)
  })

  it("should format Nigerian currency correctly", () => {
    const amount = 1234.56
    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
    
    expect(formatted).toContain('₦')
    expect(formatted).toContain('1,234.56')
  })

  it("should handle stock level calculations", () => {
    const currentStock = 50
    const minThreshold = 20
    const isLowStock = currentStock <= minThreshold
    
    expect(isLowStock).toBe(false)
  })
})
```

### 2. Data Validation Testing
```typescript
describe("Data Validation", () => {
  it("should validate product types", () => {
    const validTypes = ["pms", "lubricant"]
    
    expect(validTypes).toContain("pms")
    expect(validTypes).toContain("lubricant")
    expect(validTypes).not.toContain("invalid")
  })

  it("should validate user roles", () => {
    const validRoles = ["staff", "manager"]
    
    expect(validRoles).toContain("staff")
    expect(validRoles).toContain("manager")
    expect(validRoles).not.toContain("admin")
  })

  it("should validate movement types", () => {
    const validMovements = ["sale", "adjustment", "delivery"]
    
    validMovements.forEach(type => {
      expect(["sale", "adjustment", "delivery"]).toContain(type)
    })
  })
})
```

## Hook Testing Patterns

### 1. Custom Hook Testing
```typescript
import { renderHook, act } from "@testing-library/react"
import { useCustomHook } from "@/hooks/use-custom-hook"

describe("useCustomHook", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it("should handle state updates", async () => {
    const { result } = renderHook(() => useCustomHook())
    
    await act(async () => {
      await result.current.fetchData()
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeDefined()
  })
})
```

## Test Data Patterns

### 1. Mock Data Factory
```typescript
// __tests__/utils/mock-data.ts
export const createMockProduct = (overrides = {}) => ({
  id: "product-123",
  stationId: "station-123",
  name: "Premium Motor Spirit",
  type: "pms",
  currentStock: "1000",
  unitPrice: "650",
  minThreshold: "100",
  unit: "litres",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: "user-123",
  clerkUserId: "clerk-123",
  stationId: "station-123",
  username: "testuser",
  role: "staff",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockTransaction = (overrides = {}) => ({
  id: "transaction-123",
  stationId: "station-123",
  userId: "user-123",
  totalAmount: "650",
  transactionDate: new Date(),
  syncStatus: "synced",
  createdAt: new Date(),
  ...overrides
})
```

### 2. Using Mock Data
```typescript
import { createMockProduct, createMockUser } from "../utils/mock-data"

describe("Product Management", () => {
  it("should handle low stock products", () => {
    const lowStockProduct = createMockProduct({
      currentStock: "5",
      minThreshold: "20"
    })
    
    const isLowStock = parseFloat(lowStockProduct.currentStock) <= 
                      parseFloat(lowStockProduct.minThreshold)
    
    expect(isLowStock).toBe(true)
  })
})
```

## Error Handling Testing

### 1. Network Error Simulation
```typescript
describe("Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    mockDb.query.products.findMany.mockRejectedValue(
      new Error("Network error")
    )
    
    const result = await getProducts("station-123")
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe("Failed to fetch products")
  })

  it("should handle validation errors", async () => {
    const invalidInput = { name: "" }
    
    const result = await createProduct(invalidInput)
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toContain("required")
  })
})
```

## Performance Testing Guidelines

### 1. Large Dataset Testing
```typescript
describe("Performance", () => {
  it("should handle large product lists efficiently", async () => {
    const largeProductList = Array.from({ length: 1000 }, (_, i) =>
      createMockProduct({ id: `product-${i}`, name: `Product ${i}` })
    )
    
    mockDb.query.products.findMany.mockResolvedValue(largeProductList)
    
    const startTime = Date.now()
    const result = await getProducts("station-123")
    const endTime = Date.now()
    
    expect(result.isSuccess).toBe(true)
    expect(endTime - startTime).toBeLessThan(1000) // Should complete in < 1s
  })
})
```

## Test Utilities

### 1. Common Test Helpers
```typescript
// __tests__/utils/test-helpers.ts
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockSuccessResponse = (data: any) => ({
  isSuccess: true,
  data
})

export const mockErrorResponse = (error: string) => ({
  isSuccess: false,
  error
})

export const setupAuthenticatedUser = (role: "staff" | "manager" = "staff") => {
  mockAuth.mockResolvedValue({ userId: "user-123" })
  mockDb.query.users.findFirst.mockResolvedValue(
    createMockUser({ role })
  )
}
```

## Coverage Requirements

### Minimum Coverage Targets
- **Server Actions**: 90% line coverage
- **Components**: 80% line coverage
- **Hooks**: 85% line coverage
- **Business Logic**: 95% line coverage

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# Run specific test file with coverage
npm run test:coverage -- __tests__/actions/products.test.ts

# Generate coverage report
npm run test:coverage -- --coverage --watchAll=false
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert
- Keep tests focused on a single behavior

### 2. Mock Management
- Reset mocks in `beforeEach` to ensure test isolation
- Use specific mocks for each test scenario
- Avoid over-mocking - only mock what's necessary

### 3. Assertions
- Use specific assertions that clearly indicate what's being tested
- Test both success and failure scenarios
- Verify side effects (database calls, function calls)

### 4. Test Maintenance
- Update tests when business logic changes
- Remove obsolete tests
- Refactor tests to reduce duplication
- Keep test data realistic but minimal

## Common Pitfalls to Avoid

1. **Over-mocking**: Don't mock everything - test real logic where possible
2. **Brittle tests**: Avoid testing implementation details
3. **Async issues**: Always await async operations and use proper async test patterns
4. **Test pollution**: Ensure tests don't affect each other
5. **Incomplete coverage**: Test edge cases and error conditions
6. **Slow tests**: Keep tests fast by avoiding unnecessary delays
7. **Complex setup**: Keep test setup simple and focused

## Integration with CI/CD

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit && npm run lint"
    }
  }
}
```

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:coverage -- --coverage --watchAll=false
    
- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

This testing guide ensures consistent, reliable, and maintainable tests across the Station Stock Manager project. Follow these patterns to create comprehensive test coverage that supports confident development and deployment.