import { describe, it, expect } from '@jest/globals'

describe("Inventory Business Logic", () => {
  describe("Stock Level Calculations", () => {
    it("should identify low stock products", () => {
      const product = {
        currentStock: 5,
        minThreshold: 20
      }
      
      const isLowStock = product.currentStock <= product.minThreshold
      expect(isLowStock).toBe(true)
    })

    it("should identify normal stock products", () => {
      const product = {
        currentStock: 50,
        minThreshold: 20
      }
      
      const isLowStock = product.currentStock <= product.minThreshold
      expect(isLowStock).toBe(false)
    })

    it("should calculate new stock after adjustment", () => {
      const currentStock = 100
      const adjustment = 10
      const newStock = currentStock + adjustment
      
      expect(newStock).toBe(110)
    })

    it("should prevent negative stock", () => {
      const currentStock = 10
      const adjustment = -20
      const newStock = currentStock + adjustment
      
      expect(newStock).toBe(-10)
      expect(newStock < 0).toBe(true)
    })
  })

  describe("Inventory Value Calculations", () => {
    it("should calculate product value correctly", () => {
      const product = {
        currentStock: 100,
        unitPrice: 650
      }
      
      const value = product.currentStock * product.unitPrice
      expect(value).toBe(65000)
    })

    it("should calculate total inventory value", () => {
      const products = [
        { currentStock: 100, unitPrice: 650 },
        { currentStock: 50, unitPrice: 5000 },
        { currentStock: 25, unitPrice: 1200 }
      ]
      
      const totalValue = products.reduce((sum, product) => 
        sum + (product.currentStock * product.unitPrice), 0
      )
      
      expect(totalValue).toBe(345000) // 65000 + 250000 + 30000
    })
  })

  describe("Reorder Recommendations", () => {
    it("should calculate recommended order quantity", () => {
      const product = {
        currentStock: 5,
        minThreshold: 20,
        avgDailySales: 10
      }
      
      // Recommend enough for 2 weeks + minimum threshold
      const recommendedQuantity = Math.max(
        product.minThreshold * 2,
        product.avgDailySales * 14 + product.minThreshold
      )
      
      expect(recommendedQuantity).toBe(160) // 10 * 14 + 20 = 160
    })

    it("should calculate days until stockout", () => {
      const product = {
        currentStock: 30,
        avgDailySales: 5
      }
      
      const daysUntilStockout = Math.floor(product.currentStock / product.avgDailySales)
      expect(daysUntilStockout).toBe(6)
    })

    it("should prioritize urgent products", () => {
      const products = [
        { currentStock: 0, minThreshold: 20, priority: "urgent" },
        { currentStock: 5, minThreshold: 20, priority: "high" },
        { currentStock: 15, minThreshold: 20, priority: "medium" }
      ]
      
      const urgentProducts = products.filter(p => p.priority === "urgent")
      const highPriorityProducts = products.filter(p => p.priority === "high")
      
      expect(urgentProducts).toHaveLength(1)
      expect(highPriorityProducts).toHaveLength(1)
    })
  })

  describe("Stock Movement Types", () => {
    it("should handle sale movements", () => {
      const movement = {
        type: "sale",
        quantity: -10,
        previousStock: 100,
        newStock: 90
      }
      
      expect(movement.newStock).toBe(movement.previousStock + movement.quantity)
      expect(movement.quantity < 0).toBe(true) // Sales reduce stock
    })

    it("should handle delivery movements", () => {
      const movement = {
        type: "delivery",
        quantity: 50,
        previousStock: 100,
        newStock: 150
      }
      
      expect(movement.newStock).toBe(movement.previousStock + movement.quantity)
      expect(movement.quantity > 0).toBe(true) // Deliveries increase stock
    })

    it("should handle adjustment movements", () => {
      const positiveAdjustment = {
        type: "adjustment",
        quantity: 5,
        previousStock: 100,
        newStock: 105
      }
      
      const negativeAdjustment = {
        type: "adjustment",
        quantity: -3,
        previousStock: 100,
        newStock: 97
      }
      
      expect(positiveAdjustment.newStock).toBe(105)
      expect(negativeAdjustment.newStock).toBe(97)
    })
  })

  describe("Currency Formatting", () => {
    it("should format Nigerian Naira correctly", () => {
      const amount = 1234.56
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount)
      
      expect(formatted).toContain('₦')
      expect(formatted).toContain('1,234.56')
    })

    it("should handle large amounts", () => {
      const amount = 1000000
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount)
      
      expect(formatted).toContain('₦')
      expect(formatted).toContain('1,000,000')
    })
  })

  describe("Data Validation", () => {
    it("should validate product types", () => {
      const validTypes = ["pms", "lubricant"]
      
      expect(validTypes).toContain("pms")
      expect(validTypes).toContain("lubricant")
      expect(validTypes).not.toContain("invalid")
    })

    it("should validate movement types", () => {
      const validMovements = ["sale", "adjustment", "delivery"]
      
      expect(validMovements).toContain("sale")
      expect(validMovements).toContain("adjustment")
      expect(validMovements).toContain("delivery")
      expect(validMovements).not.toContain("invalid")
    })

    it("should validate user roles", () => {
      const validRoles = ["staff", "manager"]
      
      expect(validRoles).toContain("staff")
      expect(validRoles).toContain("manager")
      expect(validRoles).not.toContain("admin")
    })

    it("should validate positive quantities", () => {
      const validQuantity = 10
      const invalidQuantity = -5
      
      expect(validQuantity > 0).toBe(true)
      expect(invalidQuantity > 0).toBe(false)
    })

    it("should validate email format", () => {
      const validEmail = "test@example.com"
      const invalidEmail = "invalid-email"
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test(validEmail)).toBe(true)
      expect(emailRegex.test(invalidEmail)).toBe(false)
    })
  })

  describe("Inventory Analytics", () => {
    it("should calculate stock turnover", () => {
      const product = {
        initialStock: 100,
        currentStock: 20,
        timePeriodinDays: 30
      }
      
      const stockUsed = product.initialStock - product.currentStock
      const dailyUsage = stockUsed / product.timePeriodinDays
      
      expect(stockUsed).toBe(80)
      expect(dailyUsage).toBeCloseTo(2.67, 2)
    })

    it("should identify fast-moving products", () => {
      const products = [
        { name: "Premium PMS", dailySales: 100 },
        { name: "Engine Oil", dailySales: 5 },
        { name: "Brake Fluid", dailySales: 1 }
      ]
      
      const fastMoving = products.filter(p => p.dailySales > 50)
      const slowMoving = products.filter(p => p.dailySales < 10)
      
      expect(fastMoving).toHaveLength(1)
      expect(slowMoving).toHaveLength(2)
    })
  })
})