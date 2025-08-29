"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { products, stockMovements, users, suppliers } from "@/db/schema"
import { eq, and, desc, gte, lte, sql } from "drizzle-orm"
import { z } from "zod"

// Input validation schemas
const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number(),
  reason: z.string().min(1, "Reason is required"),
  reference: z.string().optional()
})

const deliverySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  supplierId: z.string().optional(),
  deliveryNote: z.string().optional(),
  unitCost: z.number().min(0, "Unit cost cannot be negative").optional()
})

const bulkStockUpdateSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number(),
    movementType: z.enum(["adjustment", "delivery"]),
    reason: z.string().min(1, "Reason is required")
  }))
})

const stockAlertThresholdSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  newThreshold: z.number().min(0, "Threshold cannot be negative")
})

// Helper function to get user role
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })
  return user?.role || null
}

/**
 * Record a stock adjustment (Manager only)
 */
export async function recordStockAdjustment(
  input: z.infer<typeof stockAdjustmentSchema>
) {
  try {
    const validatedInput = stockAdjustmentSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can adjust stock" }
    }

    const result = await db.transaction(async tx => {
      // Get current product stock
      const product = await tx.query.products.findFirst({
        where: eq(products.id, validatedInput.productId)
      })

      if (!product) {
        throw new Error("Product not found")
      }

      const currentStock = parseFloat(product.currentStock)
      const adjustment = validatedInput.quantity
      const newStock = currentStock + adjustment

      // Validate stock levels
      if (newStock < 0) {
        throw new Error("Stock adjustment would result in negative stock")
      }

      // Update product stock
      const [updatedProduct] = await tx
        .update(products)
        .set({
          currentStock: newStock.toString(),
          updatedAt: new Date()
        })
        .where(eq(products.id, validatedInput.productId))
        .returning()

      // Record stock movement
      const [movement] = await tx.insert(stockMovements).values({
        productId: validatedInput.productId,
        movementType: "adjustment",
        quantity: adjustment.toString(),
        previousStock: currentStock.toString(),
        newStock: newStock.toString(),
        reference: `${validatedInput.reason}${validatedInput.reference ? ` - ${validatedInput.reference}` : ""}`
      }).returning()

      return {
        product: updatedProduct,
        movement,
        previousStock: currentStock,
        newStock,
        adjustment
      }
    })

    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error recording stock adjustment:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock"
    }
  }
}

/**
 * Record a delivery (Manager only)
 */
export async function recordDelivery(input: z.infer<typeof deliverySchema>) {
  try {
    const validatedInput = deliverySchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can record deliveries" }
    }

    const result = await db.transaction(async tx => {
      // Get current product stock
      const product = await tx.query.products.findFirst({
        where: eq(products.id, validatedInput.productId)
      })

      if (!product) {
        throw new Error("Product not found")
      }

      const currentStock = parseFloat(product.currentStock)
      const deliveryQuantity = validatedInput.quantity
      const newStock = currentStock + deliveryQuantity

      // Update product stock and optionally unit price if unit cost provided
      const updateData: any = {
        currentStock: newStock.toString(),
        updatedAt: new Date()
      }

      if (validatedInput.unitCost !== undefined) {
        updateData.unitPrice = validatedInput.unitCost.toString()
      }

      const [updatedProduct] = await tx
        .update(products)
        .set(updateData)
        .where(eq(products.id, validatedInput.productId))
        .returning()

      // Build reference string
      let reference = "Delivery"
      if (validatedInput.deliveryNote) {
        reference += ` - ${validatedInput.deliveryNote}`
      }
      if (validatedInput.supplierId) {
        const supplier = await tx.query.suppliers.findFirst({
          where: eq(suppliers.id, validatedInput.supplierId)
        })
        if (supplier) {
          reference += ` from ${supplier.name}`
        }
      }

      // Record stock movement
      const [movement] = await tx.insert(stockMovements).values({
        productId: validatedInput.productId,
        movementType: "delivery",
        quantity: deliveryQuantity.toString(),
        previousStock: currentStock.toString(),
        newStock: newStock.toString(),
        reference
      }).returning()

      return {
        product: updatedProduct,
        movement,
        previousStock: currentStock,
        newStock,
        deliveryQuantity,
        priceUpdated: validatedInput.unitCost !== undefined
      }
    })

    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error recording delivery:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to record delivery"
    }
  }
}

/**
 * Get comprehensive stock movement history with filters
 */
export async function getStockMovementHistory(
  stationId: string,
  filters?: {
    productId?: string
    movementType?: "sale" | "adjustment" | "delivery"
    startDate?: Date
    endDate?: Date
    limit?: number
  }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const limit = filters?.limit || 100

    // Build where conditions
    let whereConditions = []

    if (filters?.productId) {
      whereConditions.push(eq(stockMovements.productId, filters.productId))
    }

    if (filters?.movementType) {
      whereConditions.push(eq(stockMovements.movementType, filters.movementType))
    }

    if (filters?.startDate) {
      whereConditions.push(gte(stockMovements.createdAt, filters.startDate))
    }

    if (filters?.endDate) {
      whereConditions.push(lte(stockMovements.createdAt, filters.endDate))
    }

    const movements = await db.query.stockMovements.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        product: {
          where: eq(products.stationId, stationId)
        }
      },
      orderBy: [desc(stockMovements.createdAt)],
      limit
    })

    // Filter out movements for products not in this station
    const filteredMovements = movements.filter(movement => movement.product)

    return { isSuccess: true, data: filteredMovements }
  } catch (error) {
    console.error("Error fetching stock movement history:", error)
    return { isSuccess: false, error: "Failed to fetch stock movement history" }
  }
}

/**
 * Get real-time inventory status with low stock alerts
 */
export async function getInventoryStatus(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const productList = await db.query.products.findMany({
      where: and(eq(products.stationId, stationId), eq(products.isActive, true)),
      with: {
        supplier: true
      },
      orderBy: [products.name]
    })

    let totalValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    const inventoryItems = productList.map(product => {
      const currentStock = parseFloat(product.currentStock)
      const minThreshold = parseFloat(product.minThreshold)
      const unitPrice = parseFloat(product.unitPrice)
      const value = currentStock * unitPrice

      totalValue += value

      const isLowStock = currentStock <= minThreshold
      const isOutOfStock = currentStock === 0

      if (isLowStock) lowStockCount++
      if (isOutOfStock) outOfStockCount++

      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        type: product.type,
        currentStock,
        minThreshold,
        unitPrice,
        value,
        unit: product.unit,
        isLowStock,
        isOutOfStock,
        supplier: product.supplier ? {
          id: product.supplier.id,
          name: product.supplier.name
        } : null,
        stockStatus: isOutOfStock ? "out_of_stock" : isLowStock ? "low_stock" : "normal"
      }
    })

    return {
      isSuccess: true,
      data: {
        items: inventoryItems,
        summary: {
          totalProducts: productList.length,
          totalValue,
          lowStockCount,
          outOfStockCount,
          normalStockCount: productList.length - lowStockCount
        }
      }
    }
  } catch (error) {
    console.error("Error fetching inventory status:", error)
    return { isSuccess: false, error: "Failed to fetch inventory status" }
  }
}

/**
 * Update stock alert threshold (Manager only)
 */
export async function updateStockAlertThreshold(
  input: z.infer<typeof stockAlertThresholdSchema>
) {
  try {
    const validatedInput = stockAlertThresholdSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can update thresholds" }
    }

    const [product] = await db
      .update(products)
      .set({
        minThreshold: validatedInput.newThreshold.toString(),
        updatedAt: new Date()
      })
      .where(eq(products.id, validatedInput.productId))
      .returning()

    if (!product) {
      return { isSuccess: false, error: "Product not found" }
    }

    return { isSuccess: true, data: product }
  } catch (error) {
    console.error("Error updating stock threshold:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to update threshold" }
  }
}

/**
 * Bulk stock update (Manager only)
 */
export async function bulkStockUpdate(
  input: z.infer<typeof bulkStockUpdateSchema>
) {
  try {
    const validatedInput = bulkStockUpdateSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can perform bulk updates" }
    }

    const results = await db.transaction(async tx => {
      const updateResults = []

      for (const update of validatedInput.updates) {
        // Get current product stock
        const product = await tx.query.products.findFirst({
          where: eq(products.id, update.productId)
        })

        if (!product) {
          throw new Error(`Product not found: ${update.productId}`)
        }

        const currentStock = parseFloat(product.currentStock)
        const newStock = currentStock + update.quantity

        if (newStock < 0) {
          throw new Error(`Invalid stock update for ${product.name}: would result in negative stock`)
        }

        // Update product stock
        const [updatedProduct] = await tx
          .update(products)
          .set({
            currentStock: newStock.toString(),
            updatedAt: new Date()
          })
          .where(eq(products.id, update.productId))
          .returning()

        // Record stock movement
        await tx.insert(stockMovements).values({
          productId: update.productId,
          movementType: update.movementType,
          quantity: update.quantity.toString(),
          previousStock: currentStock.toString(),
          newStock: newStock.toString(),
          reference: update.reason
        })

        updateResults.push({
          productId: update.productId,
          productName: product.name,
          previousStock: currentStock,
          newStock,
          quantity: update.quantity
        })
      }

      return updateResults
    })

    return {
      isSuccess: true,
      data: {
        updates: results,
        count: results.length
      }
    }
  } catch (error) {
    console.error("Error performing bulk stock update:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to perform bulk update"
    }
  }
}

/**
 * Get inventory analytics and insights
 */
export async function getInventoryAnalytics(
  stationId: string,
  days: number = 30
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get stock movements for the period
    const movements = await db.query.stockMovements.findMany({
      where: and(
        gte(stockMovements.createdAt, startDate)
      ),
      with: {
        product: {
          where: eq(products.stationId, stationId)
        }
      }
    })

    // Filter movements for this station's products
    const stationMovements = movements.filter(movement => movement.product)

    // Calculate analytics
    const analytics = {
      totalMovements: stationMovements.length,
      salesCount: stationMovements.filter(m => m.movementType === "sale").length,
      deliveriesCount: stationMovements.filter(m => m.movementType === "delivery").length,
      adjustmentsCount: stationMovements.filter(m => m.movementType === "adjustment").length,
      
      // Most active products
      productActivity: {} as Record<string, { name: string; movements: number; totalQuantity: number }>,
      
      // Daily movement trends
      dailyTrends: {} as Record<string, { sales: number; deliveries: number; adjustments: number }>
    }

    // Calculate product activity
    stationMovements.forEach(movement => {
      if (movement.product) {
        const productId = movement.product.id
        if (!analytics.productActivity[productId]) {
          analytics.productActivity[productId] = {
            name: movement.product.name,
            movements: 0,
            totalQuantity: 0
          }
        }
        analytics.productActivity[productId].movements++
        analytics.productActivity[productId].totalQuantity += Math.abs(parseFloat(movement.quantity))
      }
    })

    // Calculate daily trends
    stationMovements.forEach(movement => {
      const date = movement.createdAt.toISOString().split('T')[0]
      if (!analytics.dailyTrends[date]) {
        analytics.dailyTrends[date] = { sales: 0, deliveries: 0, adjustments: 0 }
      }
      analytics.dailyTrends[date][movement.movementType]++
    })

    return { isSuccess: true, data: analytics }
  } catch (error) {
    console.error("Error fetching inventory analytics:", error)
    return { isSuccess: false, error: "Failed to fetch inventory analytics" }
  }
}

/**
 * Generate reorder recommendations
 */
export async function generateReorderRecommendations(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    // Get products that need reordering
    const productList = await db.query.products.findMany({
      where: and(eq(products.stationId, stationId), eq(products.isActive, true)),
      with: {
        supplier: true,
        stockMovements: {
          where: eq(stockMovements.movementType, "sale"),
          orderBy: [desc(stockMovements.createdAt)],
          limit: 30 // Last 30 sales movements for trend analysis
        }
      }
    })

    const recommendations = productList
      .filter(product => {
        const currentStock = parseFloat(product.currentStock)
        const minThreshold = parseFloat(product.minThreshold)
        return currentStock <= minThreshold
      })
      .map(product => {
        const currentStock = parseFloat(product.currentStock)
        const minThreshold = parseFloat(product.minThreshold)
        
        // Calculate average daily sales from recent movements
        const salesMovements = product.stockMovements || []
        const totalSold = salesMovements.reduce((sum, movement) => 
          sum + Math.abs(parseFloat(movement.quantity)), 0
        )
        const avgDailySales = salesMovements.length > 0 ? totalSold / Math.min(salesMovements.length, 30) : 0
        
        // Calculate recommended order quantity (enough for 2 weeks + buffer)
        const recommendedQuantity = Math.max(
          minThreshold * 2, // At least double the minimum threshold
          avgDailySales * 14 + minThreshold // 2 weeks of sales + minimum threshold
        )

        return {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          type: product.type,
          currentStock,
          minThreshold,
          recommendedQuantity: Math.ceil(recommendedQuantity),
          avgDailySales: Math.round(avgDailySales * 100) / 100,
          daysUntilStockout: avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : null,
          supplier: product.supplier ? {
            id: product.supplier.id,
            name: product.supplier.name,
            contactPerson: product.supplier.contactPerson,
            phone: product.supplier.phone
          } : null,
          priority: currentStock === 0 ? "urgent" : currentStock <= minThreshold * 0.5 ? "high" : "medium"
        }
      })
      .sort((a, b) => {
        // Sort by priority: urgent > high > medium, then by days until stockout
        const priorityOrder = { urgent: 3, high: 2, medium: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return (a.daysUntilStockout || 0) - (b.daysUntilStockout || 0)
      })

    return {
      isSuccess: true,
      data: {
        recommendations,
        summary: {
          totalProducts: recommendations.length,
          urgentCount: recommendations.filter(r => r.priority === "urgent").length,
          highPriorityCount: recommendations.filter(r => r.priority === "high").length,
          mediumPriorityCount: recommendations.filter(r => r.priority === "medium").length
        }
      }
    }
  } catch (error) {
    console.error("Error generating reorder recommendations:", error)
    return { isSuccess: false, error: "Failed to generate recommendations" }
  }
}