import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Clerk authentication first
const mockAuth = jest.fn()
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

// Mock database schema
jest.mock("@/db/schema", () => ({
  transactions: { id: 'transactions.id', stationId: 'transactions.station_id' },
  transactionItems: { id: 'transactionItems.id' },
  products: { id: 'products.id', stationId: 'products.station_id' },
  users: { id: 'users.id' },
  stockMovements: { id: 'stockMovements.id' }
}))

// Mock drizzle-orm functions
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => 'eq-condition'),
  and: jest.fn(() => 'and-condition'),
  gte: jest.fn(() => 'gte-condition'),
  lte: jest.fn(() => 'lte-condition'),
  desc: jest.fn(() => 'desc-order'),
  sql: jest.fn(() => ({ mapWith: jest.fn() })),
  sum: jest.fn(() => 'sum-function'),
  count: jest.fn(() => 'count-function')
}))

// Mock the database with proper chainable methods
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  transaction: jest.fn(),
  query: {
    products: { findFirst: jest.fn(), findMany: jest.fn() },
    transactions: { findMany: jest.fn() },
    users: { findFirst: jest.fn() },
    transactionItems: { findMany: jest.fn() },
    stockMovements: { findMany: jest.fn() }
  }
}

jest.mock("@/db", () => ({ db: mockDb }))

// Import after mocking
const { 
  generateDailyReport, 
  getStaffPerformanceReport, 
  getLowStockAlerts,
  generateWeeklyReport,
  generateMonthlyReport
} = require('@/actions/reports')

describe("Reports Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup chainable methods for database operations
    const mockChain = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([])
    }
    
    mockDb.select.mockReturnValue(mockChain)
    mockDb.transaction.mockImplementation((callback) => callback(mockDb))
  })

  describe("generateDailyReport", () => {
    const validInput = {
      stationId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2024-01-15",
      endDate: "2024-01-15"
    }

    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await generateDailyReport(validInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("Input Validation", () => {
      it("should validate required fields", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const invalidInput = { ...validInput, stationId: "" }
        
        const result = await generateDailyReport(invalidInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toContain("Failed to generate daily report")
      })

      it("should validate date format", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const invalidInput = { ...validInput, startDate: "invalid-date" }
        
        const result = await generateDailyReport(invalidInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toContain("Failed to generate daily report")
      })
    })

    describe("Report Generation", () => {
      it("should generate daily report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        // Mock database responses
        const mockSalesOverview = [{ totalSales: "5000", totalTransactions: 10 }]
        const mockTopProduct = [{ productName: "Premium PMS", totalQuantity: "100" }]
        const mockPmsProducts = [{ currentStock: "1000" }]
        const mockPmsSales = [{ totalQuantity: "100", totalRevenue: "5000" }]
        const mockLubricantSales = [
          {
            productId: "product-1",
            productName: "Engine Oil",
            brand: "Shell",
            currentStock: "50",
            totalQuantity: "5",
            totalRevenue: "2500"
          }
        ]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }

        // Setup different return values for different queries
        mockDb.select
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockSalesOverview) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockTopProduct) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockPmsProducts) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockPmsSales) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockLubricantSales) })

        const result = await generateDailyReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.salesOverview.totalSales).toBe("5000")
        expect(result.data?.salesOverview.totalTransactions).toBe(10)
      })

      it("should handle empty sales data", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue([])
        })

        const result = await generateDailyReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data?.salesOverview.totalSales).toBe("0")
        expect(result.data?.salesOverview.totalTransactions).toBe(0)
      })
    })

    describe("Error Handling", () => {
      it("should handle database errors gracefully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockDb.select.mockImplementation(() => {
          throw new Error("Database connection failed")
        })
        
        const result = await generateDailyReport(validInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Failed to generate daily report")
      })
    })
  })

  describe("getStaffPerformanceReport", () => {
    const validInput = {
      stationId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2024-01-01",
      endDate: "2024-01-07"
    }

    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await getStaffPerformanceReport(validInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("Report Generation", () => {
      it("should generate staff performance report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockStaffPerformance = [
          {
            staffId: "staff-1",
            username: "john_doe",
            transactionCount: 15,
            totalSales: "7500"
          }
        ]

        const mockTopProduct = [{ productName: "Premium PMS", totalQuantity: "100" }]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }

        mockDb.select
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockStaffPerformance) })
          .mockReturnValue({ ...mockChain, from: jest.fn().mockResolvedValue(mockTopProduct) })

        const result = await getStaffPerformanceReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.length).toBe(1)
        expect(result.data?.[0].username).toBe("john_doe")
        expect(result.data?.[0].totalSales).toBe("7500")
        expect(result.data?.[0].averageTransaction).toBe("500.00")
      })

      it("should handle staff with no sales", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue([])
        })

        const result = await getStaffPerformanceReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toEqual([])
      })
    })

    describe("Date Range Filtering", () => {
      it("should filter by specific user when provided", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const inputWithUserId = { ...validInput, userId: "550e8400-e29b-41d4-a716-446655440001" }
        
        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue([])
        })

        const result = await getStaffPerformanceReport(inputWithUserId)
        
        expect(result.isSuccess).toBe(true)
      })
    })
  })

  describe("getLowStockAlerts", () => {
    const stationId = "550e8400-e29b-41d4-a716-446655440000"

    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await getLowStockAlerts(stationId)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("Alert Generation", () => {
      it("should return low stock alerts successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockLowStockProducts = [
          {
            productId: "product-1",
            productName: "Engine Oil",
            brand: "Shell",
            type: "lubricant",
            currentStock: "5",
            minThreshold: "20",
            unit: "units"
          }
        ]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue(mockLowStockProducts)
        })

        const result = await getLowStockAlerts(stationId)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.length).toBe(1)
        expect(result.data?.[0].productName).toBe("Engine Oil")
        expect(result.data?.[0].reorderQuantity).toBe("35.00") // (20 * 2) - 5
      })

      it("should return empty array when no low stock items", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue([])
        })

        const result = await getLowStockAlerts(stationId)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toEqual([])
      })
    })

    describe("Reorder Calculations", () => {
      it("should calculate correct reorder quantities", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockLowStockProducts = [
          {
            productId: "product-1",
            productName: "Test Product",
            brand: "Test Brand",
            type: "lubricant",
            currentStock: "10",
            minThreshold: "50",
            unit: "units"
          }
        ]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis()
        }

        mockDb.select.mockReturnValue({ 
          ...mockChain, 
          from: jest.fn().mockResolvedValue(mockLowStockProducts)
        })

        const result = await getLowStockAlerts(stationId)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data?.[0].reorderQuantity).toBe("90.00") // (50 * 2) - 10
      })
    })
  })

  describe("generateWeeklyReport", () => {
    const validInput = {
      stationId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2024-01-01",
      endDate: "2024-01-07"
    }

    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await generateWeeklyReport(validInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("Report Generation", () => {
      it("should generate weekly report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockDailySales = [
          { date: "2024-01-01", totalSales: "1000", transactionCount: 5 },
          { date: "2024-01-02", totalSales: "1500", transactionCount: 8 }
        ]
        const mockWeekTotals = [{ totalSales: "2500", totalTransactions: 13 }]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis()
        }

        mockDb.select
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockDailySales) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockWeekTotals) })

        const result = await generateWeeklyReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.dailyBreakdown.length).toBe(2)
        expect(result.data?.weekTotals.totalSales).toBe("2500")
      })
    })
  })

  describe("generateMonthlyReport", () => {
    const validInput = {
      stationId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    }

    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await generateMonthlyReport(validInput)
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("Report Generation", () => {
      it("should generate monthly report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        
        const mockWeeklySales = [
          { week: "1", totalSales: "5000", transactionCount: 25 },
          { week: "2", totalSales: "6000", transactionCount: 30 }
        ]
        const mockMonthTotals = [{ totalSales: "11000", totalTransactions: 55 }]
        const mockProductPerformance = [
          {
            productName: "Premium PMS",
            type: "pms",
            totalQuantity: "500",
            totalRevenue: "8000"
          }
        ]

        const mockChain = {
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis()
        }

        mockDb.select
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockWeeklySales) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockMonthTotals) })
          .mockReturnValueOnce({ ...mockChain, from: jest.fn().mockResolvedValue(mockProductPerformance) })

        const result = await generateMonthlyReport(validInput)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.weeklyBreakdown.length).toBe(2)
        expect(result.data?.monthTotals.totalSales).toBe("11000")
        expect(result.data?.productPerformance.length).toBe(1)
      })
    })
  })
})