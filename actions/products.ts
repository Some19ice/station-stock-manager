"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { products, stockMovements, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { z } from "zod"
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  handleDatabaseOperation,
  validateInput,
  ErrorCodes,
  type ApiResponse,
  productSchemas
} from "@/lib/utils"
import type { SelectProduct, SelectStockMovement } from "@/db/schema"

// Legacy schemas for backward compatibility - will be replaced with productSchemas
const createProductSchema = productSchemas.create
const updateProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  ...productSchemas.update.shape
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
): Promise<
  ApiResponse<{
    id: string
    stationId: string
    name: string
    type: "pms" | "lubricant"
    currentStock: string
    unitPrice: string
    minThreshold: string
    unit: string
    createdAt: Date
    updatedAt: Date
  }>
> {
  // Validate input
  const validation = validateInput(createProductSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const validatedInput = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  // Check authorization
  const userRole = await getUserRole(userId)
  if (userRole !== "manager") {
    return createErrorResponse("Manager access required", ErrorCodes.FORBIDDEN)
  }

  return handleDatabaseOperation(async () => {
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

    return product
  }, "Create product")
}

// Get all products for a station
export async function getProducts(
  stationId: string,
  type?: "pms" | "lubricant"
): Promise<ApiResponse<SelectProduct[]>> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
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

    return productList
  }, "Get products")
}

// Get a single product by ID
export async function getProduct(
  productId: string
): Promise<ApiResponse<SelectProduct | null>> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId)
    })

    if (!product) {
      throw new Error("Product not found")
    }

    return product
  }, "Get product")
}

// Update product details (Manager only)
export async function updateProduct(
  input: z.infer<typeof updateProductSchema>
): Promise<ApiResponse<SelectProduct>> {
  // Validate input
  const validation = validateInput(updateProductSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const validatedInput = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  // Check authorization
  const userRole = await getUserRole(userId)
  if (userRole !== "manager") {
    return createErrorResponse("Manager access required", ErrorCodes.FORBIDDEN)
  }

  return handleDatabaseOperation(async () => {
    // Build update data object with only defined fields
    const updateData: Partial<
      Omit<SelectProduct, "id" | "stationId" | "createdAt">
    > = {
      updatedAt: new Date()
    }

    // Only include fields that are provided in the input
    const { id, ...fieldsToUpdate } = validatedInput
    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert numeric fields to strings for database storage
        if (key === "unitPrice" || key === "minThreshold") {
          ;(updateData as Record<string, unknown>)[key] = value.toString()
        } else {
          ;(updateData as Record<string, unknown>)[key] = value
        }
      }
    })

    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    if (!product) {
      throw new Error("Product not found")
    }

    return product
  }, "Update product")
}

/**
 * Update stock levels with movement tracking
 */
export async function updateStock(
  input: z.infer<typeof updateStockSchema>
): Promise<
  ApiResponse<{
    product: SelectProduct
    previousStock: number
    newStock: number
    quantity: number
  }>
> {
  // Validate input
  const validation = validateInput(updateStockSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const validatedInput = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  return handleDatabaseOperation(async () => {
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

    return result
  }, "Update stock")
}

// Get stock movement history for a product
export async function getStockMovements(
  productId: string,
  limit: number = 50
): Promise<ApiResponse<SelectStockMovement[]>> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
    }

    const movements = await db.query.stockMovements.findMany({
      where: eq(stockMovements.productId, productId),
      orderBy: [desc(stockMovements.createdAt)],
      limit
    })

    return movements
  }, "Get stock movements")
}

// Get low stock products for a station
export async function getLowStockProducts(
  stationId: string
): Promise<ApiResponse<SelectProduct[]>> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
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

    return filteredProducts
  }, "Get low stock products")
}

// Delete/deactivate a product (Manager only)
export async function deleteProduct(
  productId: string
): Promise<ApiResponse<SelectProduct>> {
  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  // Check authorization
  const userRole = await getUserRole(userId)
  if (userRole !== "manager") {
    return createErrorResponse("Manager access required", ErrorCodes.FORBIDDEN)
  }

  return handleDatabaseOperation(async () => {
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
      throw new Error("Product not found")
    }

    return product
  }, "Delete product")
}

/**
 * Calculate total inventory value for a station
 */
export async function calculateInventoryValue(stationId: string): Promise<
  ApiResponse<{
    totalValue: number
    productValues: Array<{
      productId: string
      name: string
      currentStock: number
      unitPrice: number
      value: number
    }>
    productCount: number
  }>
> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
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
      totalValue,
      productValues,
      productCount: productList.length
    }
  }, "Calculate inventory value")
}

/**
 * Get products that need reordering (below minimum threshold)
 */
export async function getProductsNeedingReorder(stationId: string): Promise<
  ApiResponse<{
    products: Array<
      Omit<SelectProduct, "currentStock" | "minThreshold"> & {
        currentStock: number
        minThreshold: number
        suggestedReorderQuantity: number
      }
    >
    count: number
  }>
> {
  return handleDatabaseOperation(async () => {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Authentication required")
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
      products: reorderProducts,
      count: reorderProducts.length
    }
  }, "Get products needing reorder")
}

/**
 * Bulk update product prices (Manager only)
 */
export async function bulkUpdatePrices(
  updates: Array<{ productId: string; newPrice: number }>
): Promise<
  ApiResponse<{
    updatedProducts: SelectProduct[]
    count: number
  }>
> {
  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  // Check authorization
  const userRole = await getUserRole(userId)
  if (userRole !== "manager") {
    return createErrorResponse("Manager access required", ErrorCodes.FORBIDDEN)
  }

  return handleDatabaseOperation(async () => {
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
      updatedProducts: results,
      count: results.length
    }
  }, "Bulk update prices")
}
