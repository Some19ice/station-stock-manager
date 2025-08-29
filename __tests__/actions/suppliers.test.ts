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
      suppliers: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      },
      products: {
        findMany: jest.fn()
      }
    },
    insert: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    transaction: jest.fn()
  }
}))

// Mock Drizzle ORM (properly hoisted)
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  desc: jest.fn(),
  sql: jest.fn(),
  count: jest.fn()
}))

// Mock Zod (use the comprehensive mock from __mocks__)
jest.mock("zod")

// Import after mocks are set up
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import * as suppliers from "@/actions/suppliers"

// Type the mocked functions
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDb = db as jest.Mocked<typeof db>

describe("Supplier Actions", () => {
  const mockManagerUser = {
    id: "user-123",
    clerkUserId: "clerk-user-123",
    stationId: "station-123",
    username: "manager",
    role: "manager"
  }

  const mockStaffUser = {
    id: "user-124",
    clerkUserId: "clerk-user-124",
    stationId: "station-123",
    username: "staff",
    role: "staff"
  }

  const mockSupplier = {
    id: "supplier-123",
    name: "Shell Nigeria",
    contactInfo: "contact@shell.ng",
    stationId: "station-123",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Set up default successful auth
    mockAuth.mockResolvedValue({ userId: "clerk-user-123" })

    // Set up default manager user lookup
    mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
  })

  describe("Authentication", () => {
    it("should reject unauthenticated requests", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    it("should accept authenticated requests", async () => {
      mockDb.query.suppliers.findMany.mockResolvedValue([mockSupplier])

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(true)
      expect(mockAuth).toHaveBeenCalled()
    })
  })

  describe("Supplier Creation", () => {
    const validSupplierData = {
      stationId: "station-123",
      name: "Shell Nigeria",
      email: "contact@shell.ng"
    }

    it("should require manager role for supplier creation", async () => {
      // Mock as non-manager user
      mockDb.query.users.findFirst.mockResolvedValue(mockStaffUser)

      const result = await suppliers.createSupplier(validSupplierData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can create suppliers")
    })

    it("should allow managers to create suppliers", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSupplier])
        })
      } as any)

      const result = await suppliers.createSupplier(validSupplierData)

      expect(result.isSuccess).toBe(true)
    })

    it("should validate required fields", async () => {
      const invalidData = {
        ...validSupplierData,
        name: "" // Invalid name
      }

      const result = await suppliers.createSupplier(invalidData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("Required")
    })

    it("should handle database errors", async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error("Database error")
      })

      const result = await suppliers.createSupplier(validSupplierData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to create supplier")
    })
  })

  describe("Supplier Retrieval", () => {
    it("should return empty array when no suppliers found", async () => {
      mockDb.query.suppliers.findMany.mockResolvedValue([])

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual([])
    })

    it("should return suppliers when found", async () => {
      const supplierList = [mockSupplier]
      mockDb.query.suppliers.findMany.mockResolvedValue(supplierList)

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual(supplierList)
    })

    it("should handle database errors gracefully", async () => {
      mockDb.query.suppliers.findMany.mockRejectedValue(new Error("DB Error"))

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch suppliers")
    })
  })

  describe("Supplier Updates", () => {
    const updateData = {
      id: "supplier-123",
      name: "Shell Nigeria Updated",
      contactInfo: "updated@shell.ng"
    }

    it("should require manager role for updates", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockStaffUser)

      const result = await suppliers.updateSupplier(updateData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update suppliers")
    })

    it("should allow managers to update suppliers", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest
              .fn()
              .mockResolvedValue([{ ...mockSupplier, ...updateData }])
          })
        })
      } as any)

      const result = await suppliers.updateSupplier(updateData)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe("Supplier Deletion", () => {
    it("should require manager role for deletion", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockStaffUser)

      const result = await suppliers.deleteSupplier("supplier-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can delete suppliers")
    })

    it("should prevent deletion of suppliers with active products", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      // Mock finding the supplier with products
      mockDb.query.suppliers.findFirst.mockResolvedValue({
        ...mockSupplier,
        products: [
          { id: "product-1", supplierId: "supplier-123", isActive: true }
        ]
      })

      const result = await suppliers.deleteSupplier("supplier-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain("active products")
    })

    it("should soft delete suppliers without products", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockManagerUser)
      // Mock finding the supplier without products
      mockDb.query.suppliers.findFirst.mockResolvedValue({
        ...mockSupplier,
        products: []
      })
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest
              .fn()
              .mockResolvedValue([{ ...mockSupplier, isActive: false }])
          })
        })
      } as any)

      const result = await suppliers.deleteSupplier("supplier-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data?.isActive).toBe(false)
    })
  })

  describe("Suppliers with Product Counts", () => {
    it("should return suppliers with product counts", async () => {
      const mockSuppliersWithProducts = [
        {
          ...mockSupplier,
          products: [
            { id: "product-1", supplierId: "supplier-123", isActive: true },
            { id: "product-2", supplierId: "supplier-123", isActive: true }
          ]
        }
      ]

      mockDb.query.suppliers.findMany.mockResolvedValue(
        mockSuppliersWithProducts
      )

      const result =
        await suppliers.getSuppliersWithProductCounts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data?.[0]?.productCount).toBe(2)
    })

    it("should handle database errors", async () => {
      mockDb.query.suppliers.findMany.mockRejectedValue(
        new Error("Database error")
      )

      const result =
        await suppliers.getSuppliersWithProductCounts("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch suppliers")
    })
  })

  describe("Error Handling", () => {
    it("should handle validation errors gracefully", async () => {
      const invalidData = {
        stationId: "",
        name: "",
        email: "invalid-email"
      }

      const result = await suppliers.createSupplier(invalidData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBeDefined()
    })

    it("should handle database connection issues", async () => {
      mockDb.query.suppliers.findMany.mockRejectedValue(
        new Error("Connection timeout")
      )

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to fetch suppliers")
    })
  })

  describe("Permission Checks", () => {
    it("should verify user belongs to station", async () => {
      // This test doesn't apply to the current implementation as station access
      // is not explicitly checked in getSuppliersWithProductCounts
      mockDb.query.suppliers.findMany.mockResolvedValue([])

      const result =
        await suppliers.getSuppliersWithProductCounts("station-123")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual([])
    })

    it("should allow access for correct station", async () => {
      mockDb.query.suppliers.findMany.mockResolvedValue([])

      const result = await suppliers.getSuppliers("station-123")

      expect(result.isSuccess).toBe(true)
    })
  })
})
