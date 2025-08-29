"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { suppliers, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

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

// Helper function to get user role
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  })
  return user?.role || null
}

// Create a new supplier (Manager only)
export async function createSupplier(
  input: z.infer<typeof createSupplierSchema>
) {
  try {
    const validatedInput = createSupplierSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can create suppliers" }
    }

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

    return { isSuccess: true, data: supplier }
  } catch (error) {
    console.error("Error creating supplier:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to create supplier" }
  }
}

// Get all suppliers for a station
export async function getSuppliers(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const supplierList = await db.query.suppliers.findMany({
      where: and(
        eq(suppliers.stationId, stationId),
        eq(suppliers.isActive, true)
      ),
      orderBy: [suppliers.name]
    })

    return { isSuccess: true, data: supplierList }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return { isSuccess: false, error: "Failed to fetch suppliers" }
  }
}

// Get a single supplier by ID
export async function getSupplier(supplierId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId),
      with: {
        products: {
          where: eq(suppliers.isActive, true)
        }
      }
    })

    if (!supplier) {
      return { isSuccess: false, error: "Supplier not found" }
    }

    return { isSuccess: true, data: supplier }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return { isSuccess: false, error: "Failed to fetch supplier" }
  }
}

// Update supplier details (Manager only)
export async function updateSupplier(
  input: z.infer<typeof updateSupplierSchema>
) {
  try {
    const validatedInput = updateSupplierSchema.parse(input)

    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can update suppliers" }
    }

    const updateData: any = { updatedAt: new Date() }

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
      return { isSuccess: false, error: "Supplier not found" }
    }

    return { isSuccess: true, data: supplier }
  } catch (error) {
    console.error("Error updating supplier:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to update supplier" }
  }
}

// Delete/deactivate a supplier (Manager only)
export async function deleteSupplier(supplierId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userRole = await getUserRole(userId)
    if (userRole !== "manager") {
      return { isSuccess: false, error: "Only managers can delete suppliers" }
    }

    // Check if supplier has active products
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId),
      with: {
        products: {
          where: eq(suppliers.isActive, true)
        }
      }
    })

    if (!supplier) {
      return { isSuccess: false, error: "Supplier not found" }
    }

    if (supplier.products && supplier.products.length > 0) {
      return {
        isSuccess: false,
        error: "Cannot delete supplier with active products. Please reassign or deactivate products first."
      }
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

    return { isSuccess: true, data: deletedSupplier }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return { isSuccess: false, error: "Failed to delete supplier" }
  }
}

// Get suppliers with product counts
export async function getSuppliersWithProductCounts(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const supplierList = await db.query.suppliers.findMany({
      where: and(
        eq(suppliers.stationId, stationId),
        eq(suppliers.isActive, true)
      ),
      with: {
        products: {
          where: eq(suppliers.isActive, true)
        }
      },
      orderBy: [suppliers.name]
    })

    const suppliersWithCounts = supplierList.map(supplier => ({
      ...supplier,
      productCount: supplier.products?.length || 0,
      products: undefined // Remove products array to reduce payload size
    }))

    return { isSuccess: true, data: suppliersWithCounts }
  } catch (error) {
    console.error("Error fetching suppliers with counts:", error)
    return { isSuccess: false, error: "Failed to fetch suppliers" }
  }
}