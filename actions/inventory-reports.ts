"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { products } from "@/db/schema/products"
import { stockMovements } from "@/db/schema/stock-movements"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"
import { getCurrentUserProfile } from "./auth"

export async function getInventoryReports(timeRange: string = "30") {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id
    const days = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get basic inventory data
    const inventoryData = await db
      .select({
        id: products.id,
        productName: products.name,
        category: products.type,
        currentStock: products.currentStock,
        minLevel: products.minThreshold,
        unitPrice: products.unitPrice,
        unit: products.unit,
        isActive: products.isActive,
        updatedAt: products.updatedAt
      })
      .from(products)
      .where(and(eq(products.stationId, stationId), eq(products.isActive, true)))

    // Create enriched data with mock calculations for now
    const enrichedInventoryData = inventoryData.map((product) => {
      const currentStockNum = parseFloat(product.currentStock)
      const minLevelNum = parseFloat(product.minLevel)
      const maxLevel = minLevelNum * 5
      const avgDailyUsage = Math.random() * 50 + 10 // Mock daily usage
      const daysRemaining = avgDailyUsage > 0 ? Math.floor(currentStockNum / avgDailyUsage) : 999

      let status: "healthy" | "low" | "critical" | "overstock"
      if (currentStockNum === 0) status = "critical"
      else if (currentStockNum <= minLevelNum) status = "low"
      else if (currentStockNum > maxLevel) status = "overstock"
      else status = "healthy"

      return {
        id: product.id,
        productName: product.productName,
        category: product.category,
        currentStock: currentStockNum,
        minLevel: minLevelNum,
        maxLevel,
        avgDailyUsage,
        daysRemaining,
        status,
        lastRestocked: product.updatedAt,
        totalValue: currentStockNum * parseFloat(product.unitPrice)
      }
    })

    // Mock stock movements data
    const stockMovements = [
      { date: "Nov 1", inbound: 15000, outbound: 12000, net: 3000 },
      { date: "Nov 8", inbound: 8000, outbound: 14000, net: -6000 },
      { date: "Nov 15", inbound: 20000, outbound: 11000, net: 9000 },
      { date: "Nov 22", inbound: 5000, outbound: 13000, net: -8000 },
      { date: "Nov 29", inbound: 12000, outbound: 10000, net: 2000 }
    ]

    return {
      isSuccess: true,
      data: {
        inventoryData: enrichedInventoryData,
        stockMovements
      }
    }
  } catch (error) {
    console.error("Error fetching inventory reports:", error)
    return { isSuccess: false, error: "Failed to fetch inventory reports" }
  }
}

export async function getInventoryStats() {
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
        totalValue: sql<number>`COALESCE(SUM(${products.currentStock} * ${products.unitPrice}), 0)`,
        lowStockCount: sql<number>`COUNT(CASE WHEN ${products.currentStock} <= ${products.minThreshold} THEN 1 END)`,
        criticalStockCount: sql<number>`COUNT(CASE WHEN ${products.currentStock} = 0 THEN 1 END)`
      })
      .from(products)
      .where(and(eq(products.stationId, stationId), eq(products.isActive, true)))

    return { isSuccess: true, data: stats[0] }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return { isSuccess: false, error: "Failed to fetch inventory stats" }
  }
}
