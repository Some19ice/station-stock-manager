import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import {
  createDbMock,
  createAuthMock,
  createTestUUID,
  createDrizzleMocks,
  mockUser,
  mockStation,
  mockProduct,
  mockTransaction,
  resetDbMocks
} from "../utils/db-mock"

// Create mocks
const { mockAuth } = createAuthMock()
const dbMock = createDbMock()
const drizzleMocks = createDrizzleMocks()

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

jest.mock("@/db", () => ({
  db: dbMock
}))

jest.mock("@/db/schema", () => ({
  transactions: {
    id: "transactions.id",
    stationId: "transactions.station_id",
    totalAmount: "transactions.total_amount",
    createdAt: "transactions.created_at",
    userId: "transactions.user_id"
  },
  transactionItems: {
    id: "transaction_items.id",
    transactionId: "transaction_items.transaction_id",
    productId: "transaction_items.product_id",
    quantity: "transaction_items.quantity",
    unitPrice: "transaction_items.unit_price"
  },
  products: {
    id: "products.id",
    name: "products.name",
    type: "products.type",
    currentStock: "products.current_stock",
    minStockLevel: "products.min_stock_level",
    unitPrice: "products.unit_price",
    stationId: "products.station_id"
  },
  users: {
    id: "users.id",
    username: "users.username",
    stationId: "users.station_id",
    role: "users.role",
    isActive: "users.is_active"
  },
  stations: {
    id: "stations.id",
    name: "stations.name"
  }
}))

jest.mock("drizzle-orm", () => drizzleMocks)

// Mock auth actions
jest.mock("@/actions/auth", () => ({
  validateUserRole: jest.fn().mockResolvedValue({ isSuccess: true }),
  getCurrentUserProfile: jest.fn().mockResolvedValue({
    isSuccess: true,
    data: {
      user: mockUser,
      station: mockStation
    }
  }),
  getUserRole: jest
    .fn()
    .mockResolvedValue({ isSuccess: true, data: "manager" }),
  createStationUser: jest.fn().mockResolvedValue({ isSuccess: true }),
  updateUserStatus: jest.fn().mockResolvedValue({ isSuccess: true }),
  getStationUsers: jest
    .fn()
    .mockResolvedValue({ isSuccess: true, data: [mockUser] })
}))

describe("Dashboard Actions", () => {
  const validStationId = createTestUUID("1001")

  beforeEach(() => {
    jest.clearAllMocks()
    resetDbMocks(dbMock)
  })

  describe("getDashboardMetrics", () => {
    it("should return dashboard metrics for authenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      // Mock metrics data - these should match the actual query results structure
      const todaysSalesData = [{ totalValue: "1500.00", transactionCount: 25 }]
      const stockStatusData = [
        { totalProducts: 50, lowStockCount: 3, pmsLevel: "2000.00" }
      ]
      const staffActivityData = [{ totalStaff: 8, activeStaffCount: 6 }]
      const topProductsData = [
        {
          id: createTestUUID("4001"),
          name: "Regular Gas",
          totalSold: "1000",
          revenue: "1450.00"
        }
      ]

      let queryCount = 0
      dbMock.select.mockImplementation(() => {
        const chain = {
          from: jest.fn(() => chain),
          where: jest.fn(() => chain),
          innerJoin: jest.fn(() => chain),
          leftJoin: jest.fn(() => chain),
          groupBy: jest.fn(() => chain),
          orderBy: jest.fn(() => chain),
          limit: jest.fn(() => chain),
          then: jest.fn(resolve => {
            queryCount++
            if (queryCount === 1) return resolve(todaysSalesData)
            if (queryCount === 2) return resolve(stockStatusData)
            if (queryCount === 3) return resolve(staffActivityData)
            return resolve(topProductsData)
          }),
          [Symbol.toStringTag]: "Promise"
        }
        return chain
      })

      const { getDashboardMetrics } = await import("@/actions/dashboard")
      const result = await getDashboardMetrics()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.todaysSales).toBeDefined()
      expect(result.data?.stockStatus).toBeDefined()
      expect(result.data?.staffActivity).toBeDefined()
      expect(result.data?.topProducts).toBeDefined()
    })

    it("should return error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const { getDashboardMetrics } = await import("@/actions/dashboard")
      const result = await getDashboardMetrics()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    it("should handle database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      dbMock.select.mockImplementation(() => {
        throw new Error("Database connection failed")
      })

      const { getDashboardMetrics } = await import("@/actions/dashboard")
      const result = await getDashboardMetrics()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch dashboard metrics")
    })
  })

  describe("getRecentTransactions", () => {
    it("should return recent transactions for authenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      const recentTransactions = [
        {
          id: createTestUUID("2001"),
          totalAmount: "45.50",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "john_doe",
          itemCount: 2
        },
        {
          id: createTestUUID("2002"),
          totalAmount: "125.00",
          transactionDate: new Date("2024-01-15T11:15:00Z"),
          userName: "jane_smith",
          itemCount: 1
        }
      ]

      dbMock.select.mockImplementation(() => {
        const chain = {
          from: jest.fn(() => chain),
          where: jest.fn(() => chain),
          innerJoin: jest.fn(() => chain),
          leftJoin: jest.fn(() => chain),
          groupBy: jest.fn(() => chain),
          orderBy: jest.fn(() => chain),
          limit: jest.fn(() => chain),
          then: jest.fn(resolve => resolve(recentTransactions)),
          [Symbol.toStringTag]: "Promise"
        }
        return chain
      })

      const { getRecentTransactions } = await import("@/actions/dashboard")
      const result = await getRecentTransactions()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].totalAmount).toBe("45.50")
      expect(result.data?.[1].totalAmount).toBe("125.00")
    })

    it("should return empty array when no recent activity", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      dbMock.select.mockImplementation(() => {
        const chain = {
          from: jest.fn(() => chain),
          where: jest.fn(() => chain),
          innerJoin: jest.fn(() => chain),
          leftJoin: jest.fn(() => chain),
          groupBy: jest.fn(() => chain),
          orderBy: jest.fn(() => chain),
          limit: jest.fn(() => chain),
          then: jest.fn(resolve => resolve([])),
          [Symbol.toStringTag]: "Promise"
        }
        return chain
      })

      const { getRecentTransactions } = await import("@/actions/dashboard")
      const result = await getRecentTransactions()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe("getLowStockAlerts", () => {
    it("should return low stock alerts for authenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      const lowStockAlerts = [
        {
          id: createTestUUID("3001"),
          name: "Motor Oil 5W-30",
          type: "lubricant",
          currentStock: "5.0",
          minThreshold: "20.0",
          unit: "liters",
          brand: "Mobil"
        },
        {
          id: createTestUUID("3002"),
          name: "Premium Gasoline",
          type: "fuel",
          currentStock: "150.0",
          minThreshold: "500.0",
          unit: "liters"
        }
      ]

      dbMock.select.mockImplementation(() => {
        const chain = {
          from: jest.fn(() => chain),
          where: jest.fn(() => chain),
          orderBy: jest.fn(() => chain),
          then: jest.fn(resolve => resolve(lowStockAlerts)),
          [Symbol.toStringTag]: "Promise"
        }
        return chain
      })

      const { getLowStockAlerts } = await import("@/actions/dashboard")
      const result = await getLowStockAlerts()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].name).toBe("Motor Oil 5W-30")
      expect(result.data?.[1].name).toBe("Premium Gasoline")
    })

    it("should return empty array when no low stock items", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      dbMock.select.mockImplementation(() => {
        const chain = {
          from: jest.fn(() => chain),
          where: jest.fn(() => chain),
          orderBy: jest.fn(() => chain),
          then: jest.fn(resolve => resolve([])),
          [Symbol.toStringTag]: "Promise"
        }
        return chain
      })

      const { getLowStockAlerts } = await import("@/actions/dashboard")
      const result = await getLowStockAlerts()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })
})
