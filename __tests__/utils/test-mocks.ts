import { jest } from "@jest/globals"

// Type definitions for better type safety
interface MockUser {
  id: string
  clerkUserId: string
  username: string
  role: string
  stationId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MockStation {
  id: string
  customerId: string
  name: string
  address: string
  createdAt: Date
  updatedAt: Date
}

interface MockCustomer {
  id: string
  userId: string
  membership: string
  stripeCustomerId: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockProduct {
  id: string
  name: string
  type: string
  currentStock: number
  minStockLevel: number
  unitPrice: number
  stationId: string
  supplierId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MockSupplier {
  id: string
  name: string
  contactInfo: string
  stationId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MockTransaction {
  id: string
  stationId: string
  userId: string
  totalAmount: number
  paymentMethod: string
  createdAt: Date
}

interface DbOverrides {
  users?: MockUser | MockUser[]
  stations?: MockStation | MockStation[]
  customers?: MockCustomer | MockCustomer[]
  products?: MockProduct | MockProduct[]
  suppliers?: MockSupplier | MockSupplier[]
  transactions?: MockTransaction | MockTransaction[]
}

interface TestMockOptions {
  userId?: string | null
  dbOverrides?: DbOverrides
}

interface ChainableQuery<T = unknown> {
  values: jest.Mock
  returning: jest.Mock
  where: jest.Mock
  set: jest.Mock
  then: jest.Mock
}

interface DbMock {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  transaction: jest.Mock
  query: {
    [key: string]: {
      findFirst: jest.Mock
      findMany: jest.Mock
    }
  }
}

// Mock data templates
export const mockUser: MockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  clerkUserId: "user_test123",
  username: "testuser",
  role: "manager",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockStation: MockStation = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  customerId: "550e8400-e29b-41d4-a716-446655440010",
  name: "Test Station",
  address: "123 Test St",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockCustomer: MockCustomer = {
  id: "550e8400-e29b-41d4-a716-446655440010",
  userId: "user_test123",
  membership: "free",
  stripeCustomerId: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockProduct: MockProduct = {
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

export const mockSupplier: MockSupplier = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "Test Supplier",
  contactInfo: "test@supplier.com",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockTransaction: MockTransaction = {
  id: "550e8400-e29b-41d4-a716-446655440004",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  totalAmount: 25.5,
  paymentMethod: "cash",
  createdAt: new Date("2024-01-01")
}

// Helper to create test UUIDs
export const createTestUUID = (suffix: string = "0000"): string => {
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
export const resetAuthMock = (): void => {
  mockAuth.mockReset()
}

// Database query result builder
export const createQueryResult = <T>(data: T | T[]): T[] => {
  if (Array.isArray(data)) {
    return data
  }
  return data ? [data] : []
}

// Simple database mock
export const createDbMock = (overrides: DbOverrides = {}): DbMock => {
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
  const createChainable = <T>(result: T): ChainableQuery<T> => {
    const chainable: ChainableQuery<T> = {
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

  const dbMock: DbMock = {
    // Query builder methods
    select: jest.fn(() => createChainable([])),
    insert: jest.fn((table: { name?: string } = {}) =>
      createChainable(results[table.name as keyof typeof results] || mockUser)
    ),
    update: jest.fn(() => createChainable(mockUser)),
    delete: jest.fn(() => createChainable([])),

    // Transaction method
    transaction: jest.fn(async (callback: (tx: DbMock) => Promise<unknown>) => {
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
export const resetDbMock = (dbMock: DbMock): void => {
  // Reset all query methods
  Object.keys(dbMock.query).forEach(table => {
    Object.keys(dbMock.query[table]).forEach(method => {
      const mockMethod = dbMock.query[table][method as keyof typeof dbMock.query[typeof table]]
      if (typeof mockMethod?.mockReset === "function") {
        mockMethod.mockReset()
      }
    })
  })

  // Reset builder methods
  ;(["select", "insert", "update", "delete", "transaction"] as const).forEach(method => {
    if (typeof dbMock[method]?.mockReset === "function") {
      dbMock[method].mockReset()
    }
  })
}

// Test setup utility
export const setupTestMocks = (options: TestMockOptions = {}) => {
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
export const cleanupTestMocks = (mocks: { auth: ReturnType<typeof setupAuthMock>; db: DbMock }): void => {
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
    parse: jest.fn((data: unknown) => data),
    safeParse: jest.fn((data: unknown) => ({ success: true, data }))
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
  ] as const

  chainableMethods.forEach(method => {
    ;(zodMock as Record<string, jest.Mock>)[method] = jest.fn(() => zodMock)
  })

  return zodMock
}
