"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { products, stockMovements, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { z } from "zod"

// Input validation schemas
const createProductSchema = z.object({
  stationId: z.string().min(1, "Station ID is required"),
  name: z.string().min(1, "Product name is required"),
  brand: z.string().optional(),
  type: z.enum(["pms", "lubricant"]),
  viscosity: z.string().optional(),
  containerSize: z.string().optional(),
  currentStock: z.number().min(0, "Stock cannot be negative"),
  unitPrice: z.number().min(0, "Price must be positive"),
  minThreshold: z.number().min(0, "Threshold must be positive"),
  unit: z.string().min(1, "Unit is required")
})

const updateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required").optional(),
  brand: z.string().optional(),
  viscosity: z.string().optional(),
  containerSize: z.string().optional(),
  unitPrice: z.number().min(0, "Price must be positive").optional(),
  minThreshold: z.number().min(0, "Threshold must be positive").optional(),
  isActive: z.boolean().optional()
})

const updateStockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number(),
  movementType: z.enum(["sale", "adjustment", "delivery"]),
  reference: z.string().optional()
})

// Helper function to get user role
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })
  return user?.role || null
}

// Create a new product (Manager only)
export async function createProduct(
  input: z.infer<typeof createProductSchema>
) {
  try {
    const validatedInput = createProductSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can create products" }
    }

    const [product] = await db
      .insert(products)
      .values({
        ...validatedInput,
        currentStock: validatedInput.currentStock.toString(),
        unitPrice: validatedInput.unitPrice.toString(),
        minThreshold: validatedInput.minThreshold.toString()
      })
      .returning()

    // Record initial stock movement if stock > 0
    if (validatedInput.currentStock > 0) {
      await db.insert(stockMovements).values({
        productId: product.id,
        movementType: "adjustment",
        quantity: validatedInput.currentStock.toString(),
        previousStock: "0",
        newStock: validatedInput.currentStock.toString(),
        reference: "Initial stock"
      })
    }

    return { isSuccess: true, data: product }
  } catch (error) {
    console.error("Error creating product:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to create product" }
  }
}

// Get all products for a station
export async function getProducts(
  stationId: string,
  type?: "pms" | "lubricant"
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    let whereClause = and(
      eq(products.stationId, stationId),
      eq(products.isActive, true)
    )

    if (type) {
      whereClause = and(whereClause, eq(products.type, type))
    }

    const productList = await db.query.products.findMany({
      where: whereClause,
      orderBy: [products.name]
    })

    return { isSuccess: true, data: productList }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { isSuccess: false, error: "Failed to fetch products" }
  }
}

// Get a single product by ID
export async function getProduct(productId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId)
    })

    if (!product) {
      return { isSuccess: false, error: "Product not found" }
    }

    return { isSuccess: true, data: product }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { isSuccess: false, error: "Failed to fetch product" }
  }
}

// Update product details (Manager only)
export async function updateProduct(
  input: z.infer<typeof updateProductSchema>
) {
  try {
    const validatedInput = updateProductSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can update products" }
    }

    const updateData: any = { updatedAt: new Date() }

    if (validatedInput.name !== undefined) updateData.name = validatedInput.name
    if (validatedInput.brand !== undefined)
      updateData.brand = validatedInput.brand
    if (validatedInput.viscosity !== undefined)
      updateData.viscosity = validatedInput.viscosity
    if (validatedInput.containerSize !== undefined)
      updateData.containerSize = validatedInput.containerSize
    if (validatedInput.unitPrice !== undefined)
      updateData.unitPrice = validatedInput.unitPrice.toString()
    if (validatedInput.minThreshold !== undefined)
      updateData.minThreshold = validatedInput.minThreshold.toString()
    if (validatedInput.isActive !== undefined)
      updateData.isActive = validatedInput.isActive

    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, validatedInput.id))
      .returning()

    if (!product) {
      return { isSuccess: false, error: "Product not found" }
    }

    return { isSuccess: true, data: product }
  } catch (error) {
    console.error("Error updating product:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to update product" }
  }
}

/**
 * Update stock levels with movement tracking
 */
export async function updateStock(input: z.infer<typeof updateStockSchema>) {
  try {
    const validatedInput = updateStockSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
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
      const quantity = validatedInput.quantity
      const newStock = currentStock + quantity

      // Validate stock levels (prevent negative stock for sales)
      if (validatedInput.movementType === "sale" && newStock < 0) {
        throw new Error("Insufficient stock available")
      }

      if (newStock < 0) {
        throw new Error("Stock cannot be negative")
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
      await tx.insert(stockMovements).values({
        productId: validatedInput.productId,
        movementType: validatedInput.movementType,
        quantity: quantity.toString(),
        previousStock: currentStock.toString(),
        newStock: newStock.toString(),
        reference: validatedInput.reference
      })

      return {
        product: updatedProduct,
        previousStock: currentStock,
        newStock,
        quantity
      }
    })

    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error updating stock:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to update stock"
    }
  }
}

// Get stock movement history for a product
export async function getStockMovements(productId: string, limit: number = 50) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const movements = await db.query.stockMovements.findMany({
      where: eq(stockMovements.productId, productId),
      orderBy: [desc(stockMovements.createdAt)],
      limit
    })

    return { isSuccess: true, data: movements }
  } catch (error) {
    console.error("Error fetching stock movements:", error)
    return { isSuccess: false, error: "Failed to fetch stock movements" }
  }
}

// Get low stock products for a station
export async function getLowStockProducts(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const lowStockProducts = await db.query.products.findMany({
      where: and(eq(products.stationId, stationId), eq(products.isActive, true))
    })

    // Filter products where current stock is below minimum threshold
    const filteredProducts = lowStockProducts.filter(product => {
      const currentStock = parseFloat(product.currentStock)
      const minThreshold = parseFloat(product.minThreshold)
      return currentStock <= minThreshold
    })

    return { isSuccess: true, data: filteredProducts }
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return { isSuccess: false, error: "Failed to fetch low stock products" }
  }
}

// Delete/deactivate a product (Manager only)
export async function deleteProduct(productId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can delete products" }
    }

    // Soft delete by setting isActive to false
    const [product] = await db
      .update(products)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
      .returning()

    if (!product) {
      return { isSuccess: false, error: "Product not found" }
    }

    return { isSuccess: true, data: product }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { isSuccess: false, error: "Failed to delete product" }
  }
}

/**
 * Calculate total inventory value for a station
 */
export async function calculateInventoryValue(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const productList = await db.query.products.findMany({
      where: and(eq(products.stationId, stationId), eq(products.isActive, true))
    })

    let totalValue = 0
    const productValues = productList.map(product => {
      const currentStock = parseFloat(product.currentStock)
      const unitPrice = parseFloat(product.unitPrice)
      const value = currentStock * unitPrice
      totalValue += value

      return {
        productId: product.id,
        name: product.name,
        currentStock,
        unitPrice,
        value
      }
    })

    return {
      isSuccess: true,
      data: {
        totalValue,
        productValues,
        productCount: productList.length
      }
    }
  } catch (error) {
    console.error("Error calculating inventory value:", error)
    return { isSuccess: false, error: "Failed to calculate inventory value" }
  }
}

/**
 * Get products that need reordering (below minimum threshold)
 */
export async function getProductsNeedingReorder(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const productList = await db.query.products.findMany({
      where: and(eq(products.stationId, stationId), eq(products.isActive, true))
    })

    const reorderProducts = productList
      .filter(product => {
        const currentStock = parseFloat(product.currentStock)
        const minThreshold = parseFloat(product.minThreshold)
        return currentStock <= minThreshold
      })
      .map(product => ({
        ...product,
        currentStock: parseFloat(product.currentStock),
        minThreshold: parseFloat(product.minThreshold),
        suggestedReorderQuantity: parseFloat(product.minThreshold) * 2 // Suggest double the minimum threshold
      }))

    return {
      isSuccess: true,
      data: {
        products: reorderProducts,
        count: reorderProducts.length
      }
    }
  } catch (error) {
    console.error("Error getting products needing reorder:", error)
    return { isSuccess: false, error: "Failed to get reorder products" }
  }
}

/**
 * Bulk update product prices (Manager only)
 */
export async function bulkUpdatePrices(
  updates: Array<{ productId: string; newPrice: number }>
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can update prices" }
    }

    const results = await db.transaction(async tx => {
      const updatedProducts = []

      for (const update of updates) {
        if (update.newPrice < 0) {
          throw new Error(`Invalid price for product ${update.productId}`)
        }

        const [product] = await tx
          .update(products)
          .set({
            unitPrice: update.newPrice.toString(),
            updatedAt: new Date()
          })
          .where(eq(products.id, update.productId))
          .returning()

        if (product) {
          updatedProducts.push(product)
        }
      }

      return updatedProducts
    })

    return {
      isSuccess: true,
      data: {
        updatedProducts: results,
        count: results.length
      }
    }
  } catch (error) {
    console.error("Error bulk updating prices:", error)
    return {
      isSuccess: false,
      error: error instanceof Error ? error.message : "Failed to update prices"
    }
  }
}
