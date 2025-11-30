"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { products } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { z } from "zod"
import { getCurrentUserProfile } from "./auth"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
})

// Since categories are based on product types, we'll work with the existing product types
const PRODUCT_CATEGORIES = [
  { id: "pms", name: "Fuel Products", description: "Petrol, diesel, and other fuel products" },
  { id: "lubricant", name: "Lubricants", description: "Engine oils, gear oils, and lubricants" },
  { id: "accessory", name: "Accessories", description: "Car accessories and maintenance items" }
] as const

export async function getCategories() {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    // Get product counts by category for this station
    const productCounts = await db
      .select({
        type: products.type,
        count: sql<number>`COUNT(*)`
      })
      .from(products)
      .where(and(eq(products.stationId, stationId), eq(products.isActive, true)))
      .groupBy(products.type)

    const categoriesWithCounts = PRODUCT_CATEGORIES.map(category => {
      const productCount = productCounts.find(pc => pc.type === category.id)?.count || 0
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: true,
        createdAt: new Date("2024-01-01"), // Static date for system categories
        productsCount: productCount
      }
    })

    return { isSuccess: true, data: categoriesWithCounts }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { isSuccess: false, error: "Failed to fetch categories" }
  }
}

export async function getCategoryStats() {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    const stats = await db
      .select({
        totalProducts: sql<number>`COUNT(*)`,
        activeProducts: sql<number>`COUNT(CASE WHEN ${products.isActive} = true THEN 1 END)`,
        totalValue: sql<number>`COALESCE(SUM(${products.currentStock} * ${products.unitPrice}), 0)`
      })
      .from(products)
      .where(eq(products.stationId, stationId))

    return { isSuccess: true, data: stats[0] }
  } catch (error) {
    console.error("Error fetching category stats:", error)
    return { isSuccess: false, error: "Failed to fetch category stats" }
  }
}
