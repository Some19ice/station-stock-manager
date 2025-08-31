"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { suppliers, users, products } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  handleDatabaseOperation,
  validateInput,
  ErrorCodes,
  type ApiResponse
} from "@/lib/utils"

// Input validation schemas
const createSupplierSchema = z.object({
  stationId: z.string().min(1, "Station ID is required"),
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional()
})

const updateSupplierSchema = z.object({
  id: z.string().min(1, "Supplier ID is required"),
  name: z.string().min(1, "Supplier name is required").optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
})

const getSupplierSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required")
})

const getSuppliersSchema = z.object({
  stationId: z.string().min(1, "Station ID is required")
})

const deleteSupplierSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required")
})

// Type definitions for responses
type ProductData = typeof products.$inferSelect

type SupplierWithProducts = typeof suppliers.$inferSelect & {
  products?: ProductData[]
}

type SupplierWithProductCount = typeof suppliers.$inferSelect & {
  productCount: number
}

// Helper function to get user role
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })
  return user?.role || null
}

/**
 * Create a new supplier (Manager only)
 */
export async function createSupplier(
  input: z.infer<typeof createSupplierSchema>
): Promise<ApiResponse<typeof suppliers.$inferSelect>> {
  // Validate input
  const validation = validateInput(createSupplierSchema, input)
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
    const [supplier] = await db
      .insert(suppliers)
      .values({
        ...validatedInput,
        email: validatedInput.email || null,
        contactPerson: validatedInput.contactPerson || null,
        phone: validatedInput.phone || null,
        address: validatedInput.address || null,
        notes: validatedInput.notes || null
      })
      .returning()

    return supplier
  }, "Create supplier")
}

/**
 * Get all suppliers for a station
 */
export async function getSuppliers(
  input: z.infer<typeof getSuppliersSchema>
): Promise<ApiResponse<Array<typeof suppliers.$inferSelect>>> {
  // Validate input
  const validation = validateInput(getSuppliersSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const { stationId } = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  return handleDatabaseOperation(async () => {
    const supplierList = await db.query.suppliers.findMany({
      where: and(
        eq(suppliers.stationId, stationId),
        eq(suppliers.isActive, true)
      ),
      orderBy: [suppliers.name]
    })

    return supplierList
  }, "Fetch suppliers")
}

/**
 * Get a single supplier by ID
 */
export async function getSupplier(
  input: z.infer<typeof getSupplierSchema>
): Promise<ApiResponse<SupplierWithProducts>> {
  // Validate input
  const validation = validateInput(getSupplierSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const { supplierId } = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  return handleDatabaseOperation(async () => {
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId),
      with: {
        products: {
          where: eq(products.isActive, true)
        }
      }
    })

    if (!supplier) {
      throw new Error("Supplier not found")
    }

    return supplier as SupplierWithProducts
  }, "Fetch supplier")
}

/**
 * Update supplier details (Manager only)
 */
export async function updateSupplier(
  input: z.infer<typeof updateSupplierSchema>
): Promise<ApiResponse<typeof suppliers.$inferSelect>> {
  // Validate input
  const validation = validateInput(updateSupplierSchema, input)
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
    const updateData: Partial<typeof suppliers.$inferInsert> = {
      updatedAt: new Date()
    }

    if (validatedInput.name !== undefined) updateData.name = validatedInput.name
    if (validatedInput.contactPerson !== undefined)
      updateData.contactPerson = validatedInput.contactPerson || null
    if (validatedInput.phone !== undefined)
      updateData.phone = validatedInput.phone || null
    if (validatedInput.email !== undefined)
      updateData.email = validatedInput.email || null
    if (validatedInput.address !== undefined)
      updateData.address = validatedInput.address || null
    if (validatedInput.notes !== undefined)
      updateData.notes = validatedInput.notes || null
    if (validatedInput.isActive !== undefined)
      updateData.isActive = validatedInput.isActive

    const [supplier] = await db
      .update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, validatedInput.id))
      .returning()

    if (!supplier) {
      throw new Error("Supplier not found")
    }

    return supplier
  }, "Update supplier")
}

/**
 * Delete/deactivate a supplier (Manager only)
 */
export async function deleteSupplier(
  input: z.infer<typeof deleteSupplierSchema>
): Promise<ApiResponse<typeof suppliers.$inferSelect>> {
  // Validate input
  const validation = validateInput(deleteSupplierSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const { supplierId } = validation.data

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
    // Check if supplier has active products
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId),
      with: {
        products: {
          where: eq(products.isActive, true)
        }
      }
    })

    if (!supplier) {
      throw new Error("Supplier not found")
    }

    const activeProducts = (supplier.products as ProductData[]) || []
    if (activeProducts.length > 0) {
      throw new Error(
        "Cannot delete supplier with active products. Please reassign or deactivate products first."
      )
    }

    // Soft delete by setting isActive to false
    const [deletedSupplier] = await db
      .update(suppliers)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, supplierId))
      .returning()

    return deletedSupplier
  }, "Delete supplier")
}

/**
 * Get suppliers with product counts
 */
export async function getSuppliersWithProductCounts(
  input: z.infer<typeof getSuppliersSchema>
): Promise<ApiResponse<Array<SupplierWithProductCount>>> {
  // Validate input
  const validation = validateInput(getSuppliersSchema, input)
  if (!validation.isValid) {
    return validation.error
  }

  const { stationId } = validation.data

  // Check authentication
  const { userId } = await auth()
  if (!userId) {
    return createErrorResponse(
      "Authentication required",
      ErrorCodes.UNAUTHORIZED
    )
  }

  return handleDatabaseOperation(async () => {
    const supplierList = await db.query.suppliers.findMany({
      where: and(
        eq(suppliers.stationId, stationId),
        eq(suppliers.isActive, true)
      ),
      with: {
        products: {
          where: eq(products.isActive, true)
        }
      },
      orderBy: [suppliers.name]
    })

    const suppliersWithCounts: Array<SupplierWithProductCount> =
      supplierList.map(supplier => ({
        ...supplier,
        productCount: ((supplier.products as ProductData[]) || []).length,
        // Remove products array to reduce payload size
        products: undefined
      }))

    return suppliersWithCounts
  }, "Fetch suppliers with product counts")
}
