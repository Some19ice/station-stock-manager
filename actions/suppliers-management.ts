"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { suppliers, products } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { z } from "zod"
import { getCurrentUserProfile } from "./auth"

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  isActive: z.boolean().default(true)
})

export async function getSuppliers() {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    const suppliersWithCounts = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        contactPerson: suppliers.contactPerson,
        email: suppliers.email,
        phone: suppliers.phone,
        address: suppliers.address,
        isActive: suppliers.isActive,
        createdAt: suppliers.createdAt,
        productsCount: sql<number>`COALESCE(COUNT(${products.id}), 0)`
      })
      .from(suppliers)
      .leftJoin(products, eq(suppliers.id, products.supplierId))
      .where(eq(suppliers.stationId, stationId))
      .groupBy(suppliers.id)

    return { isSuccess: true, data: suppliersWithCounts }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return { isSuccess: false, error: "Failed to fetch suppliers" }
  }
}

export async function createSupplier(data: z.infer<typeof supplierSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const validation = supplierSchema.safeParse(data)
    if (!validation.success) {
      return { isSuccess: false, error: validation.error.errors[0].message }
    }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        stationId,
        ...validation.data
      })
      .returning()

    return { isSuccess: true, data: newSupplier }
  } catch (error) {
    console.error("Error creating supplier:", error)
    return { isSuccess: false, error: "Failed to create supplier" }
  }
}

export async function updateSupplier(id: string, data: Partial<z.infer<typeof supplierSchema>>) {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.stationId, stationId)))
      .returning()

    if (!updatedSupplier) {
      return { isSuccess: false, error: "Supplier not found" }
    }

    return { isSuccess: true, data: updatedSupplier }
  } catch (error) {
    console.error("Error updating supplier:", error)
    return { isSuccess: false, error: "Failed to update supplier" }
  }
}

export async function deleteSupplier(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    // Check if supplier has products
    const productsCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.supplierId, id))

    if (productsCount[0]?.count > 0) {
      return { isSuccess: false, error: "Cannot delete supplier with existing products" }
    }

    await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.stationId, stationId)))

    return { isSuccess: true, data: null }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return { isSuccess: false, error: "Failed to delete supplier" }
  }
}
