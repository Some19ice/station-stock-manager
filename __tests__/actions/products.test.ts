// Mock Clerk authentication (properly hoisted)
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn()
}))

// Mock database (properly hoisted)
jest.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn()
      },
      products: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      },
      suppliers: {
        findFirst: jest.fn()
      }
    },
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn()
  }
}))

// Mock Drizzle ORM (properly hoisted)
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  desc: jest.fn(),
  relations: jest.fn()
}))

// Mock Zod (use the comprehensive mock from __mocks__)
jest.mock("zod")

// Import after mocks are set up
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import * as products from "@/actions/products"

// Type the mocked functions
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDb = db as jest.Mocked<typeof db>

describe("Products Actions - Basic Tests", () => {
  const mockUser = {
    id: "user-123",
    clerkUserId: "user-123",
    stationId: "station-123",
    role: "attendant"
  }

  const mockManagerUser = {
    id: "manager-123",
    clerkUserId: "manager-123",
    stationId: "station-123",
    role: "manager"
  }

  const mockSupplier = {
    id: "supplier-123",
    name: "Test Supplier"
  }

  const mockProduct = {
    id: "product-123",
    name: "Test Product",
    type: "pms",
    currentStock: "100",
    unitPrice: "1.50",
    minThreshold: "20",
    stationId: "station-123",
    isActive: true
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default auth setup - authenticated user
    mockAuth.mockResolvedValue({ userId: "user-123" })

    // Default database responses
    mockDb.query.users.findFirst.mockResolvedValue(mockUser)
    mockDb.query.suppliers.findFirst.mockResolvedValue(mockSupplier)
    mockDb.query.products.findFirst.mockResolvedValue(null)
    mockDb.query.products.findMany.mockResolvedValue([])
  })

  describe("Authentication", () => {
    it("should reject unauthenticated requests", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    it("should accept authenticated requests", async () => {
      mockDb.query.products.findMany.mockResolvedValue([mockProduct])

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(mockAuth).toHaveBeenCalled()
    })
  })

  describe("Product Retrieval", () => {
    it("should return empty array when no products found", async () => {
      mockDb.query.products.findMany.mockResolvedValue([])

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual([])
    })

    it("should return products when found", async () => {
      const productList = [mockProduct]
      mockDb.query.products.findMany.mockResolvedValue(productList)

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual(productList)
    })

    it("should filter products by type when specified", async () => {
      const result = await products.getProducts("station-123", "pms")

      expect(result.isSuccess).toBe(true)
      expect(mockDb.query.products.findMany).toHaveBeenCalled()
    })
  })

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockDb.query.products.findMany.mockRejectedValue(new Error("DB Error"))

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch products")
    })

    it("should handle database connection issues", async () => {
      mockDb.query.products.findMany.mockRejectedValue(
        new Error("Connection timeout")
      )

      const result = await products.getProducts("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch products")
    })
  })

  describe("Product Creation", () => {
    const validProductData = {
      name: "Test Product",
      type: "pms" as const,
      currentStock: 100,
      minThreshold: 20,
      unitPrice: 1.5,
      stationId: "station-123",
      unit: "litres"
    }

    it("should require manager role for product creation", async () => {
      // Mock as non-manager user
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)

      const result = await products.createProduct(validProductData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can create products")
    })

    it("should allow managers to create products", async () => {
      // Mock as manager user
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProduct])
        })
      } as any)

      const result = await products.createProduct(validProductData)

      expect(result.isSuccess).toBe(true)
    })

    it("should validate required fields", async () => {
      const invalidData = {
        ...validProductData,
        name: "" // Invalid name
      }

      const result = await products.createProduct(invalidData)

      expect(result.isSuccess).toBe(false)
      // This will depend on the Zod validation
    })
  })

  describe("Single Product Retrieval", () => {
    it("should return product when found", async () => {
      mockDb.query.products.findFirst.mockResolvedValue(mockProduct)

      const result = await products.getProduct("product-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual(mockProduct)
    })

    it("should handle product not found", async () => {
      mockDb.query.products.findFirst.mockResolvedValue(null)

      const result = await products.getProduct("nonexistent-product")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Product not found")
    })

    it("should require authentication", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await products.getProduct("product-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })
  })

  describe("Product Updates", () => {
    const updateData = {
      id: "product-123",
      name: "Updated Product",
      unitPrice: 2.0
    }

    it("should require manager role for updates", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)

      const result = await products.updateProduct(updateData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update products")
    })

    it("should allow managers to update products", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest
              .fn()
              .mockResolvedValue([{ ...mockProduct, ...updateData }])
          })
        })
      } as any)

      const result = await products.updateProduct(updateData)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe("Stock Management", () => {
    const stockUpdateData = {
      productId: "product-123",
      quantity: -10, // Sale
      movementType: "sale" as const,
      reference: "Sale #123"
    }

    it("should handle stock updates with transaction", async () => {
      mockDb.transaction.mockImplementation(async callback => {
        const mockTx = {
          query: {
            products: {
              findFirst: jest.fn().mockResolvedValue(mockProduct)
            }
          },
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([
                  {
                    ...mockProduct,
                    currentStock: "90"
                  }
                ])
              })
            })
          }),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue([])
          })
        }
        return await callback(mockTx)
      })

      const result = await products.updateStock(stockUpdateData)

      expect(result.isSuccess).toBe(true)
    })

    it("should prevent negative stock for sales", async () => {
      const insufficientStockProduct = {
        ...mockProduct,
        currentStock: "5" // Less than the sale quantity
      }

      mockDb.transaction.mockImplementation(async callback => {
        const mockTx = {
          query: {
            products: {
              findFirst: jest.fn().mockResolvedValue(insufficientStockProduct)
            }
          }
        }

        try {
          await callback(mockTx)
        } catch (error) {
          throw error
        }
      })

      const result = await products.updateStock(stockUpdateData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Insufficient stock available")
    })
  })

  describe("Low Stock Detection", () => {
    it("should identify products with low stock", async () => {
      const lowStockProduct = {
        ...mockProduct,
        currentStock: "10" // Below minThreshold of 20
      }

      mockDb.query.products.findMany.mockResolvedValue([lowStockProduct])

      const result = await products.getLowStockProducts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it("should return empty array when no low stock products", async () => {
      const goodStockProduct = {
        ...mockProduct,
        currentStock: "50" // Above minThreshold
      }

      mockDb.query.products.findMany.mockResolvedValue([goodStockProduct])

      const result = await products.getLowStockProducts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe("Inventory Value Calculation", () => {
    it("should calculate total inventory value", async () => {
      const productsList = [
        { ...mockProduct, currentStock: "100", unitPrice: "1.50" },
        {
          ...mockProduct,
          id: "product-2",
          currentStock: "50",
          unitPrice: "2.00"
        }
      ]

      mockDb.query.products.findMany.mockResolvedValue(productsList)

      const result = await products.calculateInventoryValue("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data.totalValue).toBe(250) // (100 * 1.50) + (50 * 2.00)
      expect(result.data.productCount).toBe(2)
    })
  })

  describe("Product Deletion", () => {
    it("should require manager role for deletion", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)

      const result = await products.deleteProduct("product-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can delete products")
    })

    it("should soft delete products (set isActive to false)", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                ...mockProduct,
                isActive: false
              }
            ])
          })
        })
      } as any)

      const result = await products.deleteProduct("product-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data.isActive).toBe(false)
    })
  })

  describe("Bulk Operations", () => {
    it("should allow bulk price updates for managers", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)

      const updates = [
        { productId: "product-1", newPrice: 2.0 },
        { productId: "product-2", newPrice: 3.0 }
      ]

      mockDb.transaction.mockImplementation(async callback => {
        const mockTx = {
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([mockProduct])
              })
            })
          })
        }
        return await callback(mockTx)
      })

      const result = await products.bulkUpdatePrices(updates)

      expect(result.isSuccess).toBe(true)
    })

    it("should prevent bulk updates for non-managers", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)

      const updates = [{ productId: "product-1", newPrice: 2.0 }]
      const result = await products.bulkUpdatePrices(updates)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update prices")
    })
  })
})
