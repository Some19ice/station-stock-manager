import { jest } from "@jest/globals"

// Mock data templates
export const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  clerkUserId: "user_test123",
  username: "testuser",
  role: "manager",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockStation = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  customerId: "550e8400-e29b-41d4-a716-446655440010",
  name: "Test Station",
  address: "123 Test St",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockCustomer = {
  id: "550e8400-e29b-41d4-a716-446655440010",
  userId: "user_test123",
  membership: "free",
  stripeCustomerId: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockProduct = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  name: "Test Product",
  type: "fuel",
  currentStock: 100,
  minStockLevel: 20,
  unitPrice: 1.5,
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  supplierId: "550e8400-e29b-41d4-a716-446655440003",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockSupplier = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "Test Supplier",
  contactInfo: "test@supplier.com",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockTransaction = {
  id: "550e8400-e29b-41d4-a716-446655440004",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  totalAmount: 25.5,
  paymentMethod: "cash",
  createdAt: new Date("2024-01-01")
}

// Helper to create test UUIDs
export const createTestUUID = (suffix: string = "0000") => {
  return `550e8400-e29b-41d4-a716-44665544${suffix.padStart(4, "0")}`
}

// Authentication mocking utility
export const mockAuth = jest.fn()

// Mock Clerk authentication
export const setupAuthMock = (userId: string | null = "user_test123") => {
  mockAuth.mockResolvedValue({ userId })

  // Also mock the currentUser function
  const mockCurrentUser = jest
    .fn()
    .mockResolvedValue(userId ? { id: userId } : null)

  return { mockAuth, mockCurrentUser }
}

// Reset auth mock
export const resetAuthMock = () => {
  mockAuth.mockReset()
}

// Database query result builder
export const createQueryResult = (data: any) => {
  if (Array.isArray(data)) {
    return data
  }
  return data ? [data] : []
}

// Simple database mock
export const createDbMock = (overrides: any = {}) => {
  const defaultResults = {
    users: mockUser,
    stations: mockStation,
    customers: mockCustomer,
    products: mockProduct,
    suppliers: mockSupplier,
    transactions: mockTransaction
  }

  const results = { ...defaultResults, ...overrides }

  // Create chainable query builder
  const createChainable = (result: any) => {
    const chainable = {
      values: jest.fn(() => chainable),
      returning: jest.fn(() => Promise.resolve(createQueryResult(result))),
      where: jest.fn(() => chainable),
      set: jest.fn(() => chainable),
      // Make it thenable for await
      then: jest.fn(resolve =>
        Promise.resolve(createQueryResult(result)).then(resolve)
      )
    }
    return chainable
  }

  const dbMock = {
    // Query builder methods
    select: jest.fn(() => createChainable([])),
    insert: jest.fn((table: any) =>
      createChainable(results[table?.name] || mockUser)
    ),
    update: jest.fn(() => createChainable(mockUser)),
    delete: jest.fn(() => createChainable([])),

    // Transaction method
    transaction: jest.fn(async (callback: any) => {
      const txMock = createDbMock(overrides)
      return callback(txMock)
    }),

    // Query interface
    query: {
      users: {
        findFirst: jest.fn(async () => results.users || null),
        findMany: jest.fn(async () => createQueryResult(results.users))
      },
      stations: {
        findFirst: jest.fn(async () => results.stations || null),
        findMany: jest.fn(async () => createQueryResult(results.stations))
      },
      customers: {
        findFirst: jest.fn(async () => results.customers || null),
        findMany: jest.fn(async () => createQueryResult(results.customers))
      },
      products: {
        findFirst: jest.fn(async () => results.products || null),
        findMany: jest.fn(async () => createQueryResult(results.products))
      },
      suppliers: {
        findFirst: jest.fn(async () => results.suppliers || null),
        findMany: jest.fn(async () => createQueryResult(results.suppliers))
      },
      transactions: {
        findFirst: jest.fn(async () => results.transactions || null),
        findMany: jest.fn(async () => createQueryResult(results.transactions))
      },
      transactionItems: {
        findFirst: jest.fn(async () => null),
        findMany: jest.fn(async () => [])
      },
      stockMovements: {
        findFirst: jest.fn(async () => null),
        findMany: jest.fn(async () => [])
      }
    }
  }

  return dbMock
}

// Reset database mock
export const resetDbMock = (dbMock: any) => {
  // Reset all query methods
  Object.keys(dbMock.query).forEach(table => {
    Object.keys(dbMock.query[table]).forEach(method => {
      if (typeof dbMock.query[table][method]?.mockReset === "function") {
        dbMock.query[table][method].mockReset()
      }
    })
  })

  // Reset builder methods
  ;["select", "insert", "update", "delete", "transaction"].forEach(method => {
    if (typeof dbMock[method]?.mockReset === "function") {
      dbMock[method].mockReset()
    }
  })
}

// Test setup utility
export const setupTestMocks = (
  options: {
    userId?: string | null
    dbOverrides?: any
  } = {}
) => {
  const { userId = "user_test123", dbOverrides = {} } = options

  const auth = setupAuthMock(userId)
  const db = createDbMock(dbOverrides)

  return {
    auth,
    db,
    mockData: {
      user: mockUser,
      station: mockStation,
      customer: mockCustomer,
      product: mockProduct,
      supplier: mockSupplier,
      transaction: mockTransaction
    }
  }
}

// Cleanup utility
export const cleanupTestMocks = (mocks: { auth: any; db: any }) => {
  resetAuthMock()
  resetDbMock(mocks.db)
}

// Mock Drizzle operators
export const drizzleOperators = {
  eq: jest.fn(() => "eq-condition"),
  ne: jest.fn(() => "ne-condition"),
  gt: jest.fn(() => "gt-condition"),
  gte: jest.fn(() => "gte-condition"),
  lt: jest.fn(() => "lt-condition"),
  lte: jest.fn(() => "lte-condition"),
  and: jest.fn(() => "and-condition"),
  or: jest.fn(() => "or-condition"),
  not: jest.fn(() => "not-condition"),
  desc: jest.fn(() => "desc-order"),
  asc: jest.fn(() => "asc-order"),
  sql: jest.fn(() => ({ raw: "sql-query" })),
  sum: jest.fn(() => "sum-aggregate"),
  count: jest.fn(() => "count-aggregate"),
  avg: jest.fn(() => "avg-aggregate"),
  min: jest.fn(() => "min-aggregate"),
  max: jest.fn(() => "max-aggregate")
}

// Mock Zod schema
export const createZodMock = () => {
  const zodMock = {
    parse: jest.fn(data => data),
    safeParse: jest.fn(data => ({ success: true, data }))
  }

  // Add chainable methods
  const chainableMethods = [
    "string",
    "number",
    "boolean",
    "object",
    "array",
    "uuid",
    "email",
    "min",
    "max",
    "optional",
    "enum"
  ]

  chainableMethods.forEach(method => {
    zodMock[method] = jest.fn(() => zodMock)
  })

  return zodMock
}
