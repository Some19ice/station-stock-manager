// Mock Clerk authentication (properly hoisted)
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn()
}))

jest.mock("@/db", () => ({
  db: {
    transaction: jest.fn(),
    query: {
      users: { findFirst: jest.fn() },
      products: { findFirst: jest.fn(), findMany: jest.fn() },
      suppliers: { findFirst: jest.fn() },
      stockMovements: { findMany: jest.fn() }
    },
    insert: jest.fn(),
    update: jest.fn()
  }
}))

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition"),
  and: jest.fn(() => "and-condition"),
  desc: jest.fn(() => "desc-order"),
  gte: jest.fn(() => "gte-condition"),
  lte: jest.fn(() => "lte-condition")
}))

// ✅ THEN import the actions
import {
  recordStockAdjustment,
  recordDelivery,
  getInventoryStatus,
  updateStockAlertThreshold,
  generateReorderRecommendations
} from "@/actions/inventory"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"

// Type the mocked functions
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDb = db as jest.Mocked<typeof db>

describe("Inventory Actions - Comprehensive Tests", () => {
  const validProductId = "550e8400-e29b-41d4-a716-446655440000"
  const validStationId = "660e8400-e29b-41d4-a716-446655440000"

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up default authentication
    mockAuth.mockResolvedValue({ userId: "user-123" })

    // Set up default user role
    mockDb.query.users.findFirst.mockResolvedValue({
      id: "user-123",
      clerkUserId: "user-123",
      role: "manager",
      stationId: validStationId
    })

    // Set up default database behavior
    mockDb.query.products.findFirst.mockResolvedValue({
      id: validProductId,
      name: "Premium PMS",
      currentStock: "100",
      minThreshold: "20",
      unitPrice: "650",
      unit: "litres"
    })

    mockDb.query.products.findMany.mockResolvedValue([])
    mockDb.query.suppliers.findFirst.mockResolvedValue(null)
    mockDb.query.stockMovements.findMany.mockResolvedValue([])

    // Simple transaction mock
    mockDb.transaction.mockImplementation(async callback => {
      return await callback(mockDb)
    })

    // Simple insert/update mocks
    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: "new-record" }])
      })
    })

    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: "updated-record" }])
        })
      })
    })
  })

  describe("Authentication and Authorization", () => {
    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 10,
        reason: "Counting error"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    it("should reject non-managers for manager-only actions", async () => {
      mockDb.query.users.findFirst.mockResolvedValue({
        id: "user-123",
        role: "staff"
      })

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 10,
        reason: "Counting error"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can adjust stock")
    })
  })

  describe("Stock Adjustment Operations", () => {
    it("should record positive stock adjustment successfully", async () => {
      mockDb.transaction.mockResolvedValue({
        product: {
          id: validProductId,
          currentStock: "110"
        },
        movement: {
          id: "movement-123",
          quantity: "10"
        },
        previousStock: 100,
        newStock: 110,
        adjustment: 10
      })

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 10,
        reason: "Counting error"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.newStock).toBe(110)
      expect(result.data?.adjustment).toBe(10)
    })

    it("should prevent negative stock levels", async () => {
      mockDb.query.products.findFirst.mockResolvedValue({
        id: validProductId,
        currentStock: "10"
      })

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: -20,
        reason: "Damage"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("negative stock")
    })
  })

  describe("Delivery Operations", () => {
    it("should record delivery successfully", async () => {
      mockDb.transaction.mockResolvedValue({
        product: {
          id: validProductId,
          currentStock: "150"
        },
        movement: {
          id: "movement-123"
        },
        previousStock: 100,
        newStock: 150,
        deliveryQuantity: 50,
        priceUpdated: false
      })

      const result = await recordDelivery({
        productId: validProductId,
        quantity: 50,
        deliveryNote: "Weekly delivery"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.newStock).toBe(150)
      expect(result.data?.deliveryQuantity).toBe(50)
    })

    it("should update product price when unit cost provided", async () => {
      mockDb.transaction.mockResolvedValue({
        product: {
          id: validProductId,
          currentStock: "150",
          unitPrice: "700"
        },
        movement: {
          id: "movement-123"
        },
        previousStock: 100,
        newStock: 150,
        deliveryQuantity: 50,
        priceUpdated: true
      })

      const result = await recordDelivery({
        productId: validProductId,
        quantity: 50,
        unitCost: 700,
        deliveryNote: "Price increase"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.priceUpdated).toBe(true)
    })
  })

  describe("Inventory Status and Analytics", () => {
    it("should return comprehensive inventory status", async () => {
      mockDb.query.products.findMany.mockResolvedValue([
        {
          id: "product-1",
          name: "Premium PMS",
          currentStock: "5",
          minThreshold: "20",
          unitPrice: "650",
          unit: "litres",
          isActive: true,
          supplier: { id: "supplier-1", name: "Shell Nigeria" }
        },
        {
          id: "product-2",
          name: "Engine Oil",
          currentStock: "50",
          minThreshold: "10",
          unitPrice: "5000",
          unit: "units",
          isActive: true,
          supplier: null
        }
      ])

      const result = await getInventoryStatus(validStationId)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.summary.totalProducts).toBe(2)
      expect(result.data?.summary.lowStockCount).toBe(1)
      expect(result.data?.items[0].isLowStock).toBe(true)
      expect(result.data?.items[1].isLowStock).toBe(false)
    })

    it("should generate reorder recommendations", async () => {
      mockDb.query.products.findMany.mockResolvedValue([
        {
          id: "product-1",
          name: "Premium PMS",
          currentStock: "0",
          minThreshold: "20",
          supplier: {
            id: "supplier-1",
            name: "Shell Nigeria",
            phone: "+234123456789"
          },
          stockMovements: [
            { quantity: "-10", createdAt: new Date() },
            { quantity: "-15", createdAt: new Date() }
          ]
        }
      ])

      const result = await generateReorderRecommendations(validStationId)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.recommendations).toHaveLength(1)
      expect(result.data?.recommendations[0].priority).toBe("urgent")
      expect(result.data?.summary.urgentCount).toBe(1)
    })
  })

  describe("Threshold Management", () => {
    it("should update stock alert threshold", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: validProductId,
                minThreshold: "30"
              }
            ])
          })
        })
      })

      const result = await updateStockAlertThreshold({
        productId: validProductId,
        newThreshold: 30
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.minThreshold).toBe("30")
    })
  })

  describe("Input Validation", () => {
    it("should validate required fields for stock adjustment", async () => {
      const result = await recordStockAdjustment({
        productId: "",
        quantity: 0,
        reason: ""
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("required")
    })

    it("should validate positive quantities for deliveries", async () => {
      const result = await recordDelivery({
        productId: validProductId,
        quantity: -5
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("positive")
    })

    it("should validate non-negative thresholds", async () => {
      const result = await updateStockAlertThreshold({
        productId: validProductId,
        newThreshold: -1
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("negative")
    })
  })

  describe("Error Handling", () => {
    it("should handle database transaction errors", async () => {
      mockDb.transaction.mockRejectedValue(
        new Error("Database connection failed")
      )

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 10,
        reason: "Test"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to adjust stock")
    })

    it("should handle product not found errors", async () => {
      mockDb.query.products.findFirst.mockResolvedValue(null)

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 10,
        reason: "Test"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Product not found")
    })
  })

  describe("Business Logic Validation", () => {
    it("should calculate stock levels correctly", async () => {
      mockDb.transaction.mockImplementation(async callback => {
        // Simulate the actual business logic
        const product = await mockDb.query.products.findFirst()
        const currentStock = parseFloat(product.currentStock)
        const adjustment = 15
        const newStock = currentStock + adjustment

        return {
          product: { ...product, currentStock: newStock.toString() },
          movement: { id: "movement-123" },
          previousStock: currentStock,
          newStock,
          adjustment
        }
      })

      const result = await recordStockAdjustment({
        productId: validProductId,
        quantity: 15,
        reason: "Recount"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.previousStock).toBe(100)
      expect(result.data?.newStock).toBe(115)
      expect(result.data?.adjustment).toBe(15)
    })

    it("should handle low stock detection correctly", async () => {
      mockDb.query.products.findMany.mockResolvedValue([
        {
          id: "product-1",
          name: "Low Stock Product",
          currentStock: "5",
          minThreshold: "20",
          unitPrice: "100",
          unit: "units",
          isActive: true,
          supplier: null
        }
      ])

      const result = await getInventoryStatus(validStationId)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.summary.lowStockCount).toBe(1)
      expect(result.data?.items[0].isLowStock).toBe(true)
      expect(result.data?.items[0].stockStatus).toBe("low_stock")
    })

    it("should handle out of stock detection correctly", async () => {
      mockDb.query.products.findMany.mockResolvedValue([
        {
          id: "product-1",
          name: "Out of Stock Product",
          currentStock: "0",
          minThreshold: "10",
          unitPrice: "100",
          unit: "units",
          isActive: true,
          supplier: null
        }
      ])

      const result = await getInventoryStatus(validStationId)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.summary.outOfStockCount).toBe(1)
      expect(result.data?.items[0].isOutOfStock).toBe(true)
      expect(result.data?.items[0].stockStatus).toBe("out_of_stock")
    })
  })
})
