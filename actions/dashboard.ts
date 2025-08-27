"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { transactions, transactionItems, products, users } from "@/db/schema"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"
import { validateUserRole, getCurrentUserProfile } from "./auth"

export interface DashboardMetrics {
  todaysSales: {
    totalValue: string
    transactionCount: number
    averageTransaction: string
  }
  stockStatus: {
    lowStockCount: number
    totalProducts: number
    pmsLevel: string | null
  }
  staffActivity: {
    activeStaffCount: number
    totalStaff: number
  }
  topProducts: Array<{
    id: string
    name: string
    totalSold: string
    revenue: string
  }>
}

export interface LowStockAlert {
  id: string
  name: string
  type: string
  currentStock: string
  minThreshold: string
  unit: string
  brand?: string
}

export async function getDashboardMetrics(date?: Date): Promise<{
  isSuccess: boolean
  data?: DashboardMetrics
  error?: string
}> {
  try {
    // Check authentication and role
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const roleCheck = await validateUserRole("manager")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Insufficient permissions" }
    }

    const userProfileResult = await getCurrentUserProfile()
    if (!userProfileResult.isSuccess || !userProfileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = userProfileResult.data.user.stationId
    const targetDate = date || new Date()

    // Set date range for "today" (start and end of day)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get today's sales metrics
    const todaysSalesQuery = await db
      .select({
        totalValue: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startOfDay),
          lte(transactions.transactionDate, endOfDay)
        )
      )

    const todaysSales = todaysSalesQuery[0] || {
      totalValue: "0",
      transactionCount: 0
    }
    const averageTransaction =
      todaysSales.transactionCount > 0
        ? (
            parseFloat(todaysSales.totalValue) / todaysSales.transactionCount
          ).toFixed(2)
        : "0"

    // Get stock status
    const stockStatusQuery = await db
      .select({
        totalProducts: sql<number>`COUNT(*)`,
        lowStockCount: sql<number>`COUNT(CASE WHEN ${products.currentStock} <= ${products.minThreshold} THEN 1 END)`,
        pmsLevel: sql<string>`SUM(CASE WHEN ${products.type} = 'pms' THEN ${products.currentStock} ELSE 0 END)`
      })
      .from(products)
      .where(
        and(eq(products.stationId, stationId), eq(products.isActive, true))
      )

    const stockStatus = stockStatusQuery[0] || {
      totalProducts: 0,
      lowStockCount: 0,
      pmsLevel: "0"
    }

    // Get staff activity
    const staffActivityQuery = await db
      .select({
        totalStaff: sql<number>`COUNT(*)`,
        activeStaffCount: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`
      })
      .from(users)
      .where(eq(users.stationId, stationId))

    const staffActivity = staffActivityQuery[0] || {
      totalStaff: 0,
      activeStaffCount: 0
    }

    // Get top products for today
    const topProductsQuery = await db
      .select({
        id: products.id,
        name: products.name,
        totalSold: sql<string>`COALESCE(SUM(${transactionItems.quantity}), 0)`,
        revenue: sql<string>`COALESCE(SUM(${transactionItems.totalPrice}), 0)`
      })
      .from(transactionItems)
      .innerJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id)
      )
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.stationId, stationId),
          gte(transactions.transactionDate, startOfDay),
          lte(transactions.transactionDate, endOfDay)
        )
      )
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${transactionItems.totalPrice})`))
      .limit(5)

    const metrics: DashboardMetrics = {
      todaysSales: {
        totalValue: todaysSales.totalValue,
        transactionCount: todaysSales.transactionCount,
        averageTransaction
      },
      stockStatus: {
        lowStockCount: stockStatus.lowStockCount,
        totalProducts: stockStatus.totalProducts,
        pmsLevel: stockStatus.pmsLevel
      },
      staffActivity: {
        activeStaffCount: staffActivity.activeStaffCount,
        totalStaff: staffActivity.totalStaff
      },
      topProducts: topProductsQuery
    }

    return { isSuccess: true, data: metrics }
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return { isSuccess: false, error: "Failed to fetch dashboard metrics" }
  }
}

export async function getLowStockAlerts(): Promise<{
  isSuccess: boolean
  data?: LowStockAlert[]
  error?: string
}> {
  try {
    // Check authentication and role
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const roleCheck = await validateUserRole("manager")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Insufficient permissions" }
    }

    const userProfileResult = await getCurrentUserProfile()
    if (!userProfileResult.isSuccess || !userProfileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = userProfileResult.data.user.stationId

    // Get products with low stock
    const lowStockProductsRaw = await db
      .select({
        id: products.id,
        name: products.name,
        type: products.type,
        currentStock: products.currentStock,
        minThreshold: products.minThreshold,
        unit: products.unit,
        brand: products.brand
      })
      .from(products)
      .where(
        and(
          eq(products.stationId, stationId),
          eq(products.isActive, true),
          sql`${products.currentStock} <= ${products.minThreshold}`
        )
      )
      .orderBy(sql`(${products.currentStock} / ${products.minThreshold})`)

    // Transform null brand to undefined to match LowStockAlert interface
    const lowStockProducts: LowStockAlert[] = lowStockProductsRaw.map(
      product => ({
        ...product,
        brand: product.brand || undefined
      })
    )

    return { isSuccess: true, data: lowStockProducts }
  } catch (error) {
    console.error("Error fetching low stock alerts:", error)
    return { isSuccess: false, error: "Failed to fetch low stock alerts" }
  }
}

export async function getRecentTransactions(limit: number = 10): Promise<{
  isSuccess: boolean
  data?: Array<{
    id: string
    totalAmount: string
    transactionDate: Date
    userName: string
    itemCount: number
  }>
  error?: string
}> {
  try {
    // Check authentication and role
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const roleCheck = await validateUserRole("manager")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Insufficient permissions" }
    }

    const userProfileResult = await getCurrentUserProfile()
    if (!userProfileResult.isSuccess || !userProfileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = userProfileResult.data.user.stationId

    // Get recent transactions with user info and item count
    const recentTransactions = await db
      .select({
        id: transactions.id,
        totalAmount: transactions.totalAmount,
        transactionDate: transactions.transactionDate,
        userName: users.username,
        itemCount: sql<number>`COUNT(${transactionItems.id})`
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .leftJoin(
        transactionItems,
        eq(transactions.id, transactionItems.transactionId)
      )
      .where(eq(transactions.stationId, stationId))
      .groupBy(
        transactions.id,
        transactions.totalAmount,
        transactions.transactionDate,
        users.username
      )
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)

    return { isSuccess: true, data: recentTransactions }
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
    return { isSuccess: false, error: "Failed to fetch recent transactions" }
  }
}
