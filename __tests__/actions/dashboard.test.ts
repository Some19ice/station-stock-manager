import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Clerk authentication first
const mockAuth = jest.fn()
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

// Mock auth actions
const mockValidateUserRole = jest.fn()
jest.mock("@/actions/auth", () => ({
  validateUserRole: mockValidateUserRole
}))

// Mock database schema
jest.mock("@/db/schema", () => ({
  transactions: { id: 'transactions.id', stationId: 'transactions.station_id', totalAmount: 'transactions.total_amount' },
  transactionItems: { id: 'transaction_items.id', quantity: 'transaction_items.quantity' },
  products: { id: 'products.id', currentStock: 'products.current_stock', type: 'products.type' },
  users: { id: 'users.id', stationId: 'users.station_id' },
  stations: { id: 'stations.id' }
}))

// Mock drizzle-orm functions
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => 'eq_condition'),
  and: jest.fn(() => 'and_condition'),
  gte: jest.fn(() => 'gte_condition'),
  lte: jest.fn(() => 'lte_condition'),
  sql: jest.fn(() => ({ raw: 'sql_query' })),
  desc: jest.fn(() => 'desc_order')
}))

// Mock the database with proper chainable methods
const mockDb = {
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  innerJoin: jest.fn(),
  leftJoin: jest.fn(),
  groupBy: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  query: {
    users: { findFirst: jest.fn() },
    products: { findMany: jest.fn(), findFirst: jest.fn() },
    transactions: { findMany: jest.fn() },
    stockMovements: { findMany: jest.fn() }
  }
}

jest.mock("@/db", () => ({ db: mockDb }))

// Import after mocking
import { getDashboardMetrics, getLowStockAlerts, getRecentTransactions } from '@/actions/dashboard'

describe("Dashboard Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default chainable methods
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([])
    }
    
    mockDb.select.mockReturnValue(mockChain)
    
    // Setup default auth responses
    mockAuth.mockResolvedValue({ userId: null })
    mockValidateUserRole.mockResolvedValue({ isSuccess: false })
  })

  describe("getDashboardMetrics", () => {
    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await getDashboardMetrics()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })

      it("should reject non-managers", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({ 
          isSuccess: false, 
          error: "Insufficient permissions" 
        })
        
        const result = await getDashboardMetrics()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Insufficient permissions")
      })
    })

    describe("Data Fetching", () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({
          isSuccess: true,
          data: {
            user: { stationId: "station-123" },
            station: { name: "Test Station" }
          }
        })
      })

      it("should fetch dashboard metrics successfully", async () => {
        // Mock database responses
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn()
        }

        // Mock sales data
        mockChain.limit.mockResolvedValueOnce([{
          totalValue: "5000.00",
          transactionCount: 10
        }])

        // Mock stock status
        mockChain.limit.mockResolvedValueOnce([{
          totalProducts: 25,
          lowStockCount: 3,
          pmsLevel: "1500.00"
        }])

        // Mock staff activity
        mockChain.limit.mockResolvedValueOnce([{
          totalStaff: 5,
          activeStaffCount: 4
        }])

        // Mock top products
        mockChain.limit.mockResolvedValueOnce([
          {
            id: "product-1",
            name: "Premium PMS",
            totalSold: "100.00",
            revenue: "65000.00"
          }
        ])

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getDashboardMetrics()
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.todaysSales.totalValue).toBe("5000.00")
        expect(result.data?.todaysSales.transactionCount).toBe(10)
        expect(result.data?.todaysSales.averageTransaction).toBe("500.00")
        expect(result.data?.stockStatus.lowStockCount).toBe(3)
        expect(result.data?.staffActivity.activeStaffCount).toBe(4)
        expect(result.data?.topProducts).toHaveLength(1)
      })

      it("should handle zero transactions", async () => {
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn()
        }

        // Mock zero sales
        mockChain.limit.mockResolvedValueOnce([{
          totalValue: "0",
          transactionCount: 0
        }])

        // Mock other data
        mockChain.limit.mockResolvedValueOnce([{
          totalProducts: 25,
          lowStockCount: 0,
          pmsLevel: "1500.00"
        }])

        mockChain.limit.mockResolvedValueOnce([{
          totalStaff: 5,
          activeStaffCount: 4
        }])

        mockChain.limit.mockResolvedValueOnce([])

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getDashboardMetrics()
        
        expect(result.isSuccess).toBe(true)
        expect(result.data?.todaysSales.totalValue).toBe("0")
        expect(result.data?.todaysSales.transactionCount).toBe(0)
        expect(result.data?.todaysSales.averageTransaction).toBe("0")
        expect(result.data?.topProducts).toHaveLength(0)
      })

      it("should handle database errors", async () => {
        mockDb.select.mockImplementation(() => {
          throw new Error("Database connection failed")
        })
        
        const result = await getDashboardMetrics()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Failed to fetch dashboard metrics")
      })
    })

    describe("Date Filtering", () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({
          isSuccess: true,
          data: {
            user: { stationId: "station-123" },
            station: { name: "Test Station" }
          }
        })
      })

      it("should use provided date for filtering", async () => {
        const testDate = new Date('2024-01-15')
        
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{
            totalValue: "1000.00",
            transactionCount: 5
          }])
        }

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getDashboardMetrics(testDate)
        
        expect(result.isSuccess).toBe(true)
        // Verify that where clause was called (date filtering applied)
        expect(mockChain.where).toHaveBeenCalled()
      })
    })
  })

  describe("getLowStockAlerts", () => {
    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await getLowStockAlerts()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })

      it("should reject non-managers", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({ 
          isSuccess: false, 
          error: "Insufficient permissions" 
        })
        
        const result = await getLowStockAlerts()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Insufficient permissions")
      })
    })

    describe("Data Fetching", () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({
          isSuccess: true,
          data: {
            user: { stationId: "station-123" },
            station: { name: "Test Station" }
          }
        })
      })

      it("should fetch low stock alerts successfully", async () => {
        const mockLowStockProducts = [
          {
            id: "product-1",
            name: "Engine Oil 10W-40",
            type: "lubricant",
            currentStock: "5.00",
            minThreshold: "20.00",
            unit: "units",
            brand: "Mobil"
          },
          {
            id: "product-2",
            name: "Premium PMS",
            type: "pms",
            currentStock: "100.00",
            minThreshold: "500.00",
            unit: "litres",
            brand: null
          }
        ]

        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockLowStockProducts)
        }

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getLowStockAlerts()
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toHaveLength(2)
        expect(result.data?.[0].name).toBe("Engine Oil 10W-40")
        expect(result.data?.[0].type).toBe("lubricant")
        expect(result.data?.[1].name).toBe("Premium PMS")
        expect(result.data?.[1].type).toBe("pms")
      })

      it("should return empty array when no low stock items", async () => {
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue([])
        }

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getLowStockAlerts()
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toHaveLength(0)
      })

      it("should handle database errors", async () => {
        mockDb.select.mockImplementation(() => {
          throw new Error("Database connection failed")
        })
        
        const result = await getLowStockAlerts()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Failed to fetch low stock alerts")
      })
    })
  })

  describe("getRecentTransactions", () => {
    describe("Authentication", () => {
      it("should reject unauthenticated users", async () => {
        mockAuth.mockResolvedValue({ userId: null })
        
        const result = await getRecentTransactions()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })

      it("should reject non-managers", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({ 
          isSuccess: false, 
          error: "Insufficient permissions" 
        })
        
        const result = await getRecentTransactions()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Insufficient permissions")
      })
    })

    describe("Data Fetching", () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ userId: "user-123" })
        mockValidateUserRole.mockResolvedValue({
          isSuccess: true,
          data: {
            user: { stationId: "station-123" },
            station: { name: "Test Station" }
          }
        })
      })

      it("should fetch recent transactions successfully", async () => {
        const mockTransactions = [
          {
            id: "transaction-1",
            totalAmount: "1500.00",
            transactionDate: new Date('2024-01-15T10:30:00Z'),
            userName: "john_doe",
            itemCount: 3
          },
          {
            id: "transaction-2",
            totalAmount: "750.00",
            transactionDate: new Date('2024-01-15T09:15:00Z'),
            userName: "jane_smith",
            itemCount: 1
          }
        ]

        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockTransactions)
        }

        mockDb.select.mockReturnValue(mockChain)
        
        const result = await getRecentTransactions(10)
        
        expect(result.isSuccess).toBe(true)
        expect(result.data).toHaveLength(2)
        expect(result.data?.[0].totalAmount).toBe("1500.00")
        expect(result.data?.[0].userName).toBe("john_doe")
        expect(result.data?.[0].itemCount).toBe(3)
      })

      it("should respect limit parameter", async () => {
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([])
        }

        mockDb.select.mockReturnValue(mockChain)
        
        await getRecentTransactions(5)
        
        expect(mockChain.limit).toHaveBeenCalledWith(5)
      })

      it("should use default limit when not specified", async () => {
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([])
        }

        mockDb.select.mockReturnValue(mockChain)
        
        await getRecentTransactions()
        
        expect(mockChain.limit).toHaveBeenCalledWith(10)
      })

      it("should handle database errors", async () => {
        mockDb.select.mockImplementation(() => {
          throw new Error("Database connection failed")
        })
        
        const result = await getRecentTransactions()
        
        expect(result.isSuccess).toBe(false)
        expect(result.error).toBe("Failed to fetch recent transactions")
      })
    })
  })

  describe("Business Logic", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ userId: "user-123" })
      mockValidateUserRole.mockResolvedValue({
        isSuccess: true,
        data: {
          user: { stationId: "station-123" },
          station: { name: "Test Station" }
        }
      })
    })

    it("should calculate average transaction correctly", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn()
      }

      // Mock sales data with specific values for calculation
      mockChain.limit.mockResolvedValueOnce([{
        totalValue: "1000.00",
        transactionCount: 4
      }])

      // Mock other required data
      mockChain.limit.mockResolvedValueOnce([{
        totalProducts: 10,
        lowStockCount: 0,
        pmsLevel: "500.00"
      }])

      mockChain.limit.mockResolvedValueOnce([{
        totalStaff: 3,
        activeStaffCount: 2
      }])

      mockChain.limit.mockResolvedValueOnce([])

      mockDb.select.mockReturnValue(mockChain)
      
      const result = await getDashboardMetrics()
      
      expect(result.isSuccess).toBe(true)
      expect(result.data?.todaysSales.averageTransaction).toBe("250.00")
    })

    it("should handle null/undefined values gracefully", async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn()
      }

      // Mock with null/undefined values
      mockChain.limit.mockResolvedValueOnce([])
      mockChain.limit.mockResolvedValueOnce([])
      mockChain.limit.mockResolvedValueOnce([])
      mockChain.limit.mockResolvedValueOnce([])

      mockDb.select.mockReturnValue(mockChain)
      
      const result = await getDashboardMetrics()
      
      expect(result.isSuccess).toBe(true)
      expect(result.data?.todaysSales.totalValue).toBe("0")
      expect(result.data?.todaysSales.transactionCount).toBe(0)
      expect(result.data?.stockStatus.lowStockCount).toBe(0)
      expect(result.data?.staffActivity.activeStaffCount).toBe(0)
    })
  })
})