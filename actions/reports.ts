"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { 
  transactions, 
  transactionItems, 
  products, 
  users, 
  stockMovements 
} from "@/db/schema"
import { eq, and, gte, lte, desc, sql, sum, count } from "drizzle-orm"
import { z } from "zod"

// Input validation schemas
const dateRangeSchema = z.object({
  startDate: z.union([z.string(), z.date()]).transform(val => val instanceof Date ? val : new Date(val)),
  endDate: z.union([z.string(), z.date()]).transform(val => val instanceof Date ? val : new Date(val))
})

const reportFiltersSchema = z.object({
  stationId: z.string().uuid(),
  startDate: z.union([z.string(), z.date()]).transform(val => val instanceof Date ? val : new Date(val)),
  endDate: z.union([z.string(), z.date()]).transform(val => val instanceof Date ? val : new Date(val)),
  userId: z.string().uuid().optional()
})

// Types for report data
export interface DailyReportData {
  salesOverview: {
    totalSales: string
    totalTransactions: number
    averageTransaction: string
    topSellingProduct: string
  }
  pmsReport: {
    openingStock: string
    litresSold: string
    closingStock: string
    revenue: string
  }
  lubricantBreakdown: Array<{
    productName: string
    brand: string
    openingStock: string
    unitsSold: string
    closingStock: string
    revenue: string
  }>
}

export interface StaffPerformanceData {
  staffId: string
  username: string
  transactionCount: number
  totalSales: string
  averageTransaction: string
  topProduct: string
}

export interface LowStockAlert {
  productId: string
  productName: string
  brand: string
  type: string
  currentStock: string
  minThreshold: string
  reorderQuantity: string
  unit: string
}

/**
 * Generate end-of-day report with sales overview, PMS report, and lubricant breakdown
 */
export async function generateDailyReport(input: z.infer<typeof reportFiltersSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = reportFiltersSchema.parse(input)
    const { stationId, startDate, endDate } = validatedInput

    // Set end date to end of day
    const endOfDay = new Date(endDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get sales overview
    const salesOverview = await db
      .select({
        totalSales: sum(transactions.totalAmount),
        totalTransactions: count(transactions.id)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endOfDay)
        )
      )

    // Get top selling product
    const topProduct = await db
      .select({
        productName: products.name,
        totalQuantity: sum(transactionItems.quantity)
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endOfDay)
        )
      )
      .groupBy(products.id, products.name)
      .orderBy(desc(sum(transactionItems.quantity)))
      .limit(1)

    // Get PMS data
    const pmsProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.stationId, stationId),
          eq(products.type, "pms"),
          eq(products.isActive, true)
        )
      )

    // Calculate PMS sales for the day
    const pmsSales = await db
      .select({
        totalQuantity: sum(transactionItems.quantity),
        totalRevenue: sum(transactionItems.totalPrice)
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.stationId, stationId),
          eq(products.type, "pms"),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endOfDay)
        )
      )

    // Get lubricant breakdown
    const lubricantSales = await db
      .select({
        productId: products.id,
        productName: products.name,
        brand: products.brand,
        currentStock: products.currentStock,
        totalQuantity: sum(transactionItems.quantity),
        totalRevenue: sum(transactionItems.totalPrice)
      })
      .from(products)
      .leftJoin(transactionItems, eq(products.id, transactionItems.productId))
      .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(products.stationId, stationId),
          eq(products.type, "lubricant"),
          eq(products.isActive, true)
        )
      )
      .groupBy(products.id, products.name, products.brand, products.currentStock)

    // Calculate averages and format data
    const totalSales = salesOverview[0]?.totalSales || "0"
    const totalTransactions = salesOverview[0]?.totalTransactions || 0
    const averageTransaction = totalTransactions > 0 
      ? (parseFloat(totalSales) / totalTransactions).toFixed(2)
      : "0"

    const reportData: DailyReportData = {
      salesOverview: {
        totalSales,
        totalTransactions,
        averageTransaction,
        topSellingProduct: topProduct[0]?.productName || "N/A"
      },
      pmsReport: {
        openingStock: pmsProducts[0]?.currentStock || "0",
        litresSold: pmsSales[0]?.totalQuantity || "0",
        closingStock: pmsProducts[0] 
          ? (parseFloat(pmsProducts[0].currentStock) - parseFloat(pmsSales[0]?.totalQuantity || "0")).toString()
          : "0",
        revenue: pmsSales[0]?.totalRevenue || "0"
      },
      lubricantBreakdown: lubricantSales.map(item => ({
        productName: item.productName,
        brand: item.brand || "N/A",
        openingStock: item.currentStock,
        unitsSold: item.totalQuantity || "0",
        closingStock: (parseFloat(item.currentStock) - parseFloat(item.totalQuantity || "0")).toString(),
        revenue: item.totalRevenue || "0"
      }))
    }

    return { isSuccess: true, data: reportData }

  } catch (error) {
    console.error("Error generating daily report:", error)
    return { isSuccess: false, error: "Failed to generate daily report" }
  }
}

/**
 * Get staff performance report with individual transaction tracking
 */
export async function getStaffPerformanceReport(input: z.infer<typeof reportFiltersSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = reportFiltersSchema.parse(input)
    const { stationId, startDate, endDate, userId: targetUserId } = validatedInput

    const endOfDay = new Date(endDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Build where conditions
    const whereConditions = [
      eq(transactions.stationId, stationId),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endOfDay)
    ]

    if (targetUserId) {
      whereConditions.push(eq(transactions.userId, targetUserId))
    }

    // Get staff performance data
    const staffPerformance = await db
      .select({
        staffId: users.id,
        username: users.username,
        transactionCount: count(transactions.id),
        totalSales: sum(transactions.totalAmount)
      })
      .from(users)
      .innerJoin(transactions, eq(users.id, transactions.userId))
      .where(and(...whereConditions))
      .groupBy(users.id, users.username)
      .orderBy(desc(sum(transactions.totalAmount)))

    // Get top product for each staff member
    const staffData: StaffPerformanceData[] = []
    
    for (const staff of staffPerformance) {
      const topProduct = await db
        .select({
          productName: products.name,
          totalQuantity: sum(transactionItems.quantity)
        })
        .from(transactionItems)
        .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
        .innerJoin(products, eq(transactionItems.productId, products.id))
        .where(
          and(
            eq(transactions.userId, staff.staffId),
            eq(transactions.stationId, stationId),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endOfDay)
          )
        )
        .groupBy(products.id, products.name)
        .orderBy(desc(sum(transactionItems.quantity)))
        .limit(1)

      const totalSales = staff.totalSales || "0"
      const transactionCount = staff.transactionCount || 0
      const averageTransaction = transactionCount > 0 
        ? (parseFloat(totalSales) / transactionCount).toFixed(2)
        : "0"

      staffData.push({
        staffId: staff.staffId,
        username: staff.username,
        transactionCount,
        totalSales,
        averageTransaction,
        topProduct: topProduct[0]?.productName || "N/A"
      })
    }

    return { isSuccess: true, data: staffData }

  } catch (error) {
    console.error("Error generating staff performance report:", error)
    return { isSuccess: false, error: "Failed to generate staff performance report" }
  }
}

/**
 * Get low stock alerts with reorder recommendations
 */
export async function getLowStockAlerts(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    // Get products where current stock is at or below minimum threshold
    const lowStockProducts = await db
      .select({
        productId: products.id,
        productName: products.name,
        brand: products.brand,
        type: products.type,
        currentStock: products.currentStock,
        minThreshold: products.minThreshold,
        unit: products.unit
      })
      .from(products)
      .where(
        and(
          eq(products.stationId, stationId),
          eq(products.isActive, true),
          sql`${products.currentStock}::numeric <= ${products.minThreshold}::numeric`
        )
      )
      .orderBy(sql`(${products.currentStock}::numeric - ${products.minThreshold}::numeric)`)

    const alerts: LowStockAlert[] = lowStockProducts.map(product => {
      const currentStock = parseFloat(product.currentStock)
      const minThreshold = parseFloat(product.minThreshold)
      
      // Calculate recommended reorder quantity (2x minimum threshold)
      const reorderQuantity = (minThreshold * 2 - currentStock).toFixed(2)

      return {
        productId: product.productId,
        productName: product.productName,
        brand: product.brand || "N/A",
        type: product.type,
        currentStock: product.currentStock,
        minThreshold: product.minThreshold,
        reorderQuantity: reorderQuantity,
        unit: product.unit
      }
    })

    return { isSuccess: true, data: alerts }

  } catch (error) {
    console.error("Error getting low stock alerts:", error)
    return { isSuccess: false, error: "Failed to get low stock alerts" }
  }
}

/**
 * Generate weekly report summary
 */
export async function generateWeeklyReport(input: z.infer<typeof reportFiltersSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = reportFiltersSchema.parse(input)
    const { stationId, startDate, endDate } = validatedInput

    // Get daily sales for the week
    const dailySales = await db
      .select({
        date: sql<string>`DATE(${transactions.transactionDate})`,
        totalSales: sum(transactions.totalAmount),
        transactionCount: count(transactions.id)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .groupBy(sql`DATE(${transactions.transactionDate})`)
      .orderBy(sql`DATE(${transactions.transactionDate})`)

    // Get week totals
    const weekTotals = await db
      .select({
        totalSales: sum(transactions.totalAmount),
        totalTransactions: count(transactions.id)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )

    return { 
      isSuccess: true, 
      data: {
        dailyBreakdown: dailySales,
        weekTotals: weekTotals[0] || { totalSales: "0", totalTransactions: 0 }
      }
    }

  } catch (error) {
    console.error("Error generating weekly report:", error)
    return { isSuccess: false, error: "Failed to generate weekly report" }
  }
}

/**
 * Generate monthly report summary
 */
export async function generateMonthlyReport(input: z.infer<typeof reportFiltersSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = reportFiltersSchema.parse(input)
    const { stationId, startDate, endDate } = validatedInput

    // Get weekly sales for the month
    const weeklySales = await db
      .select({
        week: sql<string>`EXTRACT(WEEK FROM ${transactions.transactionDate})`,
        totalSales: sum(transactions.totalAmount),
        transactionCount: count(transactions.id)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .groupBy(sql`EXTRACT(WEEK FROM ${transactions.transactionDate})`)
      .orderBy(sql`EXTRACT(WEEK FROM ${transactions.transactionDate})`)

    // Get month totals
    const monthTotals = await db
      .select({
        totalSales: sum(transactions.totalAmount),
        totalTransactions: count(transactions.id)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )

    // Get product performance for the month
    const productPerformance = await db
      .select({
        productName: products.name,
        type: products.type,
        totalQuantity: sum(transactionItems.quantity),
        totalRevenue: sum(transactionItems.totalPrice)
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .groupBy(products.id, products.name, products.type)
      .orderBy(desc(sum(transactionItems.totalPrice)))

    return { 
      isSuccess: true, 
      data: {
        weeklyBreakdown: weeklySales,
        monthTotals: monthTotals[0] || { totalSales: "0", totalTransactions: 0 },
        productPerformance
      }
    }

  } catch (error) {
    console.error("Error generating monthly report:", error)
    return { isSuccess: false, error: "Failed to generate monthly report" }
  }
}