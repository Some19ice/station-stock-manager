import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import {
  createDbMock,
  createAuthMock,
  createTestUUID,
  createDrizzleMocks,
  createZodMocks,
  mockUser,
  resetDbMocks
} from "../utils/db-mock"

// Create mocks
const { mockAuth } = createAuthMock()
const dbMock = createDbMock()
const drizzleMocks = createDrizzleMocks()
const zodMocks = createZodMocks()

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
    transactionDate: "transactions.transaction_date",
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
    brand: "products.brand",
    type: "products.type",
    currentStock: "products.current_stock",
    minStockLevel: "products.min_stock_level",
    unitPrice: "products.unit_price",
    stationId: "products.station_id",
    isActive: "products.is_active"
  },
  users: {
    id: "users.id",
    username: "users.username",
    stationId: "users.station_id",
    role: "users.role"
  },
  stockMovements: {
    id: "stock_movements.id",
    productId: "stock_movements.product_id",
    movementType: "stock_movements.movement_type"
  }
}))

jest.mock("drizzle-orm", () => drizzleMocks)
jest.mock("zod", () => zodMocks)

// Import functions at the top level to avoid ReferenceError
let generateDailyReport: any
let getStaffPerformanceReport: any
let getLowStockAlerts: any
let generateWeeklyReport: any
let generateMonthlyReport: any

beforeAll(async () => {
  const reportsModule = await import("@/actions/reports")
  generateDailyReport = reportsModule.generateDailyReport
  getStaffPerformanceReport = reportsModule.getStaffPerformanceReport
  getLowStockAlerts = reportsModule.getLowStockAlerts
  generateWeeklyReport = reportsModule.generateWeeklyReport
  generateMonthlyReport = reportsModule.generateMonthlyReport
})

// Helper to create chainable query mock
const createQueryChain = (result: any) => {
  const chain: any = {
    from: jest.fn(() => chain),
    where: jest.fn(() => chain),
    innerJoin: jest.fn(() => chain),
    leftJoin: jest.fn(() => chain),
    groupBy: jest.fn(() => chain),
    orderBy: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    then: jest.fn(resolve => Promise.resolve(result).then(resolve)),
    catch: jest.fn(),
    finally: jest.fn(),
    [Symbol.toStringTag]: "Promise"
  }
  return chain
}

describe("Reports Actions", () => {
  const validStationId = createTestUUID("1001")
  const validUserId = createTestUUID("2001")

  beforeEach(() => {
    jest.clearAllMocks()
    resetDbMocks(dbMock)
  })

  describe("generateDailyReport", () => {
    const validInput = {
      stationId: validStationId,
      startDate: "2024-01-15",
      endDate: "2024-01-15"
    }

    it("should generate daily report for authenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      // Mock multiple sequential queries
      const mockResults = [
        [{ totalSales: "1500.00", totalTransactions: 5 }], // sales overview
        [{ productName: "Premium Gasoline", totalQuantity: "100.00" }], // top product
        [{ currentStock: "1000.00" }], // PMS products
        [{ totalQuantity: "200.00", totalRevenue: "300.00" }], // PMS sales
        [
          {
            // lubricant sales
            productName: "Motor Oil",
            brand: "Shell",
            currentStock: "50.00",
            totalQuantity: "10.00",
            totalRevenue: "150.00"
          }
        ]
      ]

      let queryCount = 0
      dbMock.select.mockImplementation(() => {
        const result = mockResults[queryCount] || []
        queryCount++
        return createQueryChain(result)
      })

      const result = await generateDailyReport(validInput)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.salesOverview).toBeDefined()
      expect(result.data?.pmsReport).toBeDefined()
      expect(result.data?.lubricantBreakdown).toBeDefined()
    })

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await generateDailyReport(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    describe("Report Generation", () => {
      it("should generate daily report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const mockResults = [
          [{ totalSales: "5000", totalTransactions: 10 }],
          [{ productName: "Premium Gas", totalQuantity: "500" }],
          [{ currentStock: "2000.00" }],
          [{ totalQuantity: "400.00", totalRevenue: "2000.00" }],
          [
            {
              productName: "Engine Oil",
              brand: "Mobil",
              currentStock: "100.00",
              totalQuantity: "20.00",
              totalRevenue: "800.00"
            }
          ]
        ]

        let queryCount = 0
        dbMock.select.mockImplementation(() => {
          const result = mockResults[queryCount] || []
          queryCount++
          return createQueryChain(result)
        })

        const result = await generateDailyReport(validInput)

        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.salesOverview.totalSales).toBe("5000")
        expect(result.data?.salesOverview.totalTransactions).toBe(10)
      })

      it("should handle empty sales data", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        dbMock.select.mockImplementation(() => createQueryChain([]))

        const result = await generateDailyReport(validInput)

        expect(result.isSuccess).toBe(true)
        expect(result.data?.salesOverview.totalSales).toBe("0")
        expect(result.data?.salesOverview.totalTransactions).toBe(0)
      })
    })

    it("should handle database errors", async () => {
      mockAuth.mockResolvedValue({ userId: mockUser.clerkUserId })

      dbMock.select.mockImplementation(() => {
        throw new Error("Database connection failed")
      })

      const result = await generateDailyReport(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to generate daily report")
    })
  })

  describe("getStaffPerformanceReport", () => {
    const validInput = {
      stationId: validStationId,
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    }

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getStaffPerformanceReport(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    describe("Report Generation", () => {
      it("should generate staff performance report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const mockStaffPerformance = [
          {
            staffId: validUserId,
            username: "john_doe",
            totalSales: "7500",
            transactionCount: 15
          }
        ]

        const mockTopProduct = [{ productName: "Premium Gas" }]

        let queryCount = 0
        dbMock.select.mockImplementation(() => {
          queryCount++
          if (queryCount === 1) return createQueryChain(mockStaffPerformance)
          return createQueryChain(mockTopProduct)
        })

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

        dbMock.select.mockImplementation(() => createQueryChain([]))

        const result = await getStaffPerformanceReport(validInput)

        expect(result.isSuccess).toBe(true)
        expect(result.data).toEqual([])
      })
    })

    describe("Date Range Filtering", () => {
      it("should filter by specific user when provided", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const inputWithUserId = {
          ...validInput,
          userId: validUserId
        }

        dbMock.select.mockImplementation(() => createQueryChain([]))

        const result = await getStaffPerformanceReport(inputWithUserId)

        expect(result.isSuccess).toBe(true)
      })
    })
  })

  describe("getLowStockAlerts", () => {
    const stationId = validStationId

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getLowStockAlerts(stationId)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    describe("Alert Generation", () => {
      it("should return low stock alerts successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const mockLowStockProducts = [
          {
            productId: createTestUUID("3001"),
            productName: "Engine Oil",
            brand: "Mobil",
            type: "lubricant",
            currentStock: "5.00",
            minThreshold: "20.00",
            unit: "liters"
          }
        ]

        dbMock.select.mockImplementation(() =>
          createQueryChain(mockLowStockProducts)
        )

        const result = await getLowStockAlerts(stationId)

        expect(result.isSuccess).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.length).toBe(1)
        expect(result.data?.[0].productName).toBe("Engine Oil")
        expect(result.data?.[0].reorderQuantity).toBe("35.00") // (20 * 2) - 5
      })

      it("should return empty array when no low stock items", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        dbMock.select.mockImplementation(() => createQueryChain([]))

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
            productId: createTestUUID("3002"),
            productName: "Brake Fluid",
            brand: "Shell",
            type: "lubricant",
            currentStock: "10.00",
            minThreshold: "50.00",
            unit: "liters"
          }
        ]

        dbMock.select.mockImplementation(() =>
          createQueryChain(mockLowStockProducts)
        )

        const result = await getLowStockAlerts(stationId)

        expect(result.isSuccess).toBe(true)
        expect(result.data?.[0].reorderQuantity).toBe("90.00") // (50 * 2) - 10
      })
    })
  })

  describe("generateWeeklyReport", () => {
    const validInput = {
      stationId: validStationId,
      startDate: "2024-01-08",
      endDate: "2024-01-14"
    }

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await generateWeeklyReport(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    describe("Report Generation", () => {
      it("should generate weekly report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const mockResults = [
          [
            { date: "2024-01-08", totalSales: "1200", totalTransactions: "8" },
            { date: "2024-01-09", totalSales: "1300", totalTransactions: "12" }
          ],
          [
            {
              totalSales: "2500",
              totalTransactions: "20",
              averageDaily: "357.14"
            }
          ]
        ]

        let queryCount = 0
        dbMock.select.mockImplementation(() => {
          const result = mockResults[queryCount] || []
          queryCount++
          return createQueryChain(result)
        })

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
      stationId: validStationId,
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    }

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await generateMonthlyReport(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    describe("Report Generation", () => {
      it("should generate monthly report successfully", async () => {
        mockAuth.mockResolvedValue({ userId: "user-123" })

        const mockResults = [
          [
            { week: "Week 1", totalSales: "5500", totalTransactions: "45" },
            { week: "Week 2", totalSales: "5500", totalTransactions: "48" }
          ],
          [
            {
              totalSales: "11000",
              totalTransactions: "93",
              averageDaily: "354.84"
            }
          ],
          [
            {
              productName: "Premium Gas",
              totalRevenue: "8000",
              totalQuantity: "4000"
            }
          ]
        ]

        let queryCount = 0
        dbMock.select.mockImplementation(() => {
          const result = mockResults[queryCount] || []
          queryCount++
          return createQueryChain(result)
        })

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
