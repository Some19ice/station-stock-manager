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
  name: string
  address: string
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

interface ChainableMock {
  select: jest.Mock
  from: jest.Mock
  where: jest.Mock
  innerJoin: jest.Mock
  leftJoin: jest.Mock
  rightJoin: jest.Mock
  groupBy: jest.Mock
  orderBy: jest.Mock
  limit: jest.Mock
  offset: jest.Mock
  having: jest.Mock
  distinct: jest.Mock
  union: jest.Mock
  intersect: jest.Mock
  except: jest.Mock
  then: jest.Mock
  catch: jest.Mock
  finally: jest.Mock
  [Symbol.toStringTag]: string
}

interface DbMockResults {
  select?: unknown[]
  insert?: unknown[]
  update?: unknown[]
  delete?: unknown[]
  userFindFirst?: MockUser | null
  userFindMany?: MockUser[]
  stationFindFirst?: MockStation | null
  stationFindMany?: MockStation[]
  productFindFirst?: MockProduct | null
  productFindMany?: MockProduct[]
  transactionFindFirst?: MockTransaction | null
  transactionFindMany?: MockTransaction[]
  transactionItemFindFirst?: unknown | null
  transactionItemFindMany?: unknown[]
  stockMovementFindFirst?: unknown | null
  stockMovementFindMany?: unknown[]
  customerFindFirst?: unknown | null
  customerFindMany?: unknown[]
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
  name: "Test Station",
  address: "123 Test St",
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
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

export const mockTransaction: MockTransaction = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  stationId: "550e8400-e29b-41d4-a716-446655440001",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  totalAmount: 25.5,
  paymentMethod: "cash",
  createdAt: new Date("2024-01-01")
}

// Create a chainable query builder mock
const createChainableMock = <T>(finalResult: T[] = []): ChainableMock => {
  const chainable = {
    select: jest.fn(() => chainable),
    from: jest.fn(() => chainable),
    where: jest.fn(() => chainable),
    innerJoin: jest.fn(() => chainable),
    leftJoin: jest.fn(() => chainable),
    rightJoin: jest.fn(() => chainable),
    groupBy: jest.fn(() => chainable),
    orderBy: jest.fn(() => chainable),
    limit: jest.fn(() => chainable),
    offset: jest.fn(() => chainable),
    having: jest.fn(() => chainable),
    distinct: jest.fn(() => chainable),
    union: jest.fn(() => chainable),
    intersect: jest.fn(() => chainable),
    except: jest.fn(() => chainable),
    // These methods should resolve to the final result
    then: jest.fn(resolve => resolve(finalResult)),
    catch: jest.fn(() => chainable),
    finally: jest.fn(() => chainable),
    // Make it thenable so await works
    [Symbol.toStringTag]: "Promise" as const
  }

  // Make it actually awaitable
  Object.defineProperty(chainable, "then", {
    value: jest.fn(resolve => Promise.resolve(finalResult).then(resolve)),
    writable: true
  })

  return chainable
}

// Create database mock
export const createDbMock = (customResults: DbMockResults = {}): DbMock => {
  const dbMock: DbMock = {
    // Query builder methods
    select: jest.fn(() => createChainableMock(customResults.select || [])),
    insert: jest.fn(() => createChainableMock(customResults.insert || [])),
    update: jest.fn(() => createChainableMock(customResults.update || [])),
    delete: jest.fn(() => createChainableMock(customResults.delete || [])),

    // Transaction support
    transaction: jest.fn(async (callback: (tx: DbMock) => Promise<unknown>) => {
      // Create a transaction-like object with the same interface
      const tx = createDbMock(customResults)
      return callback(tx)
    }),

    // Schema-based query interface
    query: {
      users: {
        findFirst: jest.fn(async () => customResults.userFindFirst ?? mockUser),
        findMany: jest.fn(async () => customResults.userFindMany ?? [mockUser])
      },
      stations: {
        findFirst: jest.fn(
          async () => customResults.stationFindFirst ?? mockStation
        ),
        findMany: jest.fn(
          async () => customResults.stationFindMany ?? [mockStation]
        )
      },
      products: {
        findFirst: jest.fn(
          async () => customResults.productFindFirst ?? mockProduct
        ),
        findMany: jest.fn(
          async () => customResults.productFindMany ?? [mockProduct]
        )
      },
      transactions: {
        findFirst: jest.fn(
          async () => customResults.transactionFindFirst ?? mockTransaction
        ),
        findMany: jest.fn(
          async () => customResults.transactionFindMany ?? [mockTransaction]
        )
      },
      transactionItems: {
        findFirst: jest.fn(
          async () => customResults.transactionItemFindFirst ?? null
        ),
        findMany: jest.fn(
          async () => customResults.transactionItemFindMany ?? []
        )
      },
      stockMovements: {
        findFirst: jest.fn(
          async () => customResults.stockMovementFindFirst ?? null
        ),
        findMany: jest.fn(async () => customResults.stockMovementFindMany ?? [])
      },
      customers: {
        findFirst: jest.fn(async () => customResults.customerFindFirst ?? null),
        findMany: jest.fn(async () => customResults.customerFindMany ?? [])
      }
    }
  }

  return dbMock
}

// Helper function to reset all mocks
export const resetDbMocks = (dbMock: DbMock): void => {
  const mockMethods = ['select', 'insert', 'update', 'delete', 'transaction'] as const
  
  mockMethods.forEach(key => {
    if (typeof dbMock[key]?.mockClear === "function") {
      dbMock[key].mockClear()
    }
  })

  Object.keys(dbMock.query).forEach(table => {
    Object.keys(dbMock.query[table]).forEach(method => {
      const mockMethod = dbMock.query[table][method as keyof typeof dbMock.query[typeof table]]
      if (typeof mockMethod?.mockClear === "function") {
        mockMethod.mockClear()
      }
    })
  })
}

// Common mock setup for auth
export const createAuthMock = (
  userOverrides: Partial<MockUser> = {}
) => {
  const user = { ...mockUser, ...userOverrides }

  return {
    mockAuth: jest.fn().mockResolvedValue({ userId: user.clerkUserId }),
    mockCurrentUser: jest.fn().mockResolvedValue({ id: user.clerkUserId }),
    mockUser: user
  }
}

// Helper to create valid UUIDs for tests
export const createTestUUID = (suffix: string = "0000"): string => {
  return `550e8400-e29b-41d4-a716-44665544${suffix.padStart(4, "0")}`
}

// Mock Drizzle ORM operators
export const createDrizzleMocks = () => ({
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
})

// Mock Zod schemas with chainable methods
export const createZodMocks = () => {
  // Create a chainable mock that supports all Zod methods
  const createChainableZodMock = (): ZodMock => {
    const chainable: ZodMock = {
      parse: jest.fn((data: unknown) => data),
      safeParse: jest.fn((data: unknown) => ({ success: true, data })),
      // String methods
      uuid: jest.fn(() => createChainableZodMock()),
      email: jest.fn(() => createChainableZodMock()),
      url: jest.fn(() => createChainableZodMock()),
      min: jest.fn(() => createChainableZodMock()),
      max: jest.fn(() => createChainableZodMock()),
      length: jest.fn(() => createChainableZodMock()),
      regex: jest.fn(() => createChainableZodMock()),
      // Transform and refinement methods
      transform: jest.fn(() => createChainableZodMock()),
      refine: jest.fn(() => createChainableZodMock()),
      superRefine: jest.fn(() => createChainableZodMock()),
      // Optional and nullable
      optional: jest.fn(() => createChainableZodMock()),
      nullable: jest.fn(() => createChainableZodMock()),
      nullish: jest.fn(() => createChainableZodMock()),
      // Default values
      default: jest.fn(() => createChainableZodMock()),
      // Array methods
      array: jest.fn(() => createChainableZodMock()),
      nonempty: jest.fn(() => createChainableZodMock()),
      // Object methods
      extend: jest.fn(() => createChainableZodMock()),
      merge: jest.fn(() => createChainableZodMock()),
      pick: jest.fn(() => createChainableZodMock()),
      omit: jest.fn(() => createChainableZodMock()),
      partial: jest.fn(() => createChainableZodMock()),
      deepPartial: jest.fn(() => createChainableZodMock()),
      required: jest.fn(() => createChainableZodMock()),
      strict: jest.fn(() => createChainableZodMock()),
      passthrough: jest.fn(() => createChainableZodMock()),
      strip: jest.fn(() => createChainableZodMock()),
      // Union and intersection
      or: jest.fn(() => createChainableZodMock()),
      and: jest.fn(() => createChainableZodMock()),
      // Branded types
      brand: jest.fn(() => createChainableZodMock()),
      // Error handling
      catch: jest.fn(() => createChainableZodMock())
    }
    return chainable
  }

  return {
    z: {
      // Basic types
      string: jest.fn(() => createChainableZodMock()),
      number: jest.fn(() => createChainableZodMock()),
      boolean: jest.fn(() => createChainableZodMock()),
      date: jest.fn(() => createChainableZodMock()),
      bigint: jest.fn(() => createChainableZodMock()),
      symbol: jest.fn(() => createChainableZodMock()),
      undefined: jest.fn(() => createChainableZodMock()),
      null: jest.fn(() => createChainableZodMock()),
      void: jest.fn(() => createChainableZodMock()),
      any: jest.fn(() => createChainableZodMock()),
      unknown: jest.fn(() => createChainableZodMock()),
      never: jest.fn(() => createChainableZodMock()),

      // Complex types
      object: jest.fn(() => createChainableZodMock()),
      array: jest.fn(() => createChainableZodMock()),
      tuple: jest.fn(() => createChainableZodMock()),
      record: jest.fn(() => createChainableZodMock()),
      map: jest.fn(() => createChainableZodMock()),
      set: jest.fn(() => createChainableZodMock()),

      // Enums and literals
      enum: jest.fn(() => createChainableZodMock()),
      nativeEnum: jest.fn(() => createChainableZodMock()),
      literal: jest.fn(() => createChainableZodMock()),

      // Union and intersection
      union: jest.fn(() => createChainableZodMock()),
      discriminatedUnion: jest.fn(() => createChainableZodMock()),
      intersection: jest.fn(() => createChainableZodMock()),

      // Functions and promises
      function: jest.fn(() => createChainableZodMock()),
      promise: jest.fn(() => createChainableZodMock()),

      // Utility methods
      optional: jest.fn(() => createChainableZodMock()),
      nullable: jest.fn(() => createChainableZodMock()),
      lazy: jest.fn(() => createChainableZodMock()),
      instanceof: jest.fn(() => createChainableZodMock()),

      // Custom types
      custom: jest.fn(() => createChainableZodMock()),

      // Coercion
      coerce: {
        string: jest.fn(() => createChainableZodMock()),
        number: jest.fn(() => createChainableZodMock()),
        boolean: jest.fn(() => createChainableZodMock()),
        date: jest.fn(() => createChainableZodMock()),
        bigint: jest.fn(() => createChainableZodMock())
      }
    }
  }
}

// Type definition for ZodMock
interface ZodMock {
  parse: jest.Mock
  safeParse: jest.Mock
  uuid: jest.Mock
  email: jest.Mock
  url: jest.Mock
  min: jest.Mock
  max: jest.Mock
  length: jest.Mock
  regex: jest.Mock
  transform: jest.Mock
  refine: jest.Mock
  superRefine: jest.Mock
  optional: jest.Mock
  nullable: jest.Mock
  nullish: jest.Mock
  default: jest.Mock
  array: jest.Mock
  nonempty: jest.Mock
  extend: jest.Mock
  merge: jest.Mock
  pick: jest.Mock
  omit: jest.Mock
  partial: jest.Mock
  deepPartial: jest.Mock
  required: jest.Mock
  strict: jest.Mock
  passthrough: jest.Mock
  strip: jest.Mock
  or: jest.Mock
  and: jest.Mock
  brand: jest.Mock
  catch: jest.Mock
}
