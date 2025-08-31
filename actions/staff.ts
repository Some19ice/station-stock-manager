"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { transactions, transactionItems, products, users } from "@/db/schema"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"
import { getCurrentUserProfile } from "./auth"

export interface StaffDashboardStats {
  todaysSales: {
    totalAmount: number
    transactionCount: number
    fuelSales: number
    productSales: number
  }
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    time: string
  }>
}

export async function getStaffDashboardStats(): Promise<{
  isSuccess: boolean
  data?: StaffDashboardStats
  error?: string
}> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userProfileResult = await getCurrentUserProfile()
    if (!userProfileResult.isSuccess || !userProfileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const { user } = userProfileResult.data
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Get today's sales for current user
    const todaysSalesQuery = await db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`,
        fuelSales: sql<string>`COALESCE(SUM(CASE WHEN ${products.type} = 'pms' THEN ${transactionItems.totalPrice} ELSE 0 END), 0)`,
        productSales: sql<string>`COALESCE(SUM(CASE WHEN ${products.type} = 'lubricant' THEN ${transactionItems.totalPrice} ELSE 0 END), 0)`
      })
      .from(transactions)
      .leftJoin(transactionItems, eq(transactions.id, transactionItems.transactionId))
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.transactionDate, startOfDay),
          lte(transactions.transactionDate, endOfDay)
        )
      )

    const salesData = todaysSalesQuery[0]
    const todaysSales = {
      totalAmount: parseFloat(salesData?.totalAmount || "0"),
      transactionCount: salesData?.transactionCount || 0,
      fuelSales: parseFloat(salesData?.fuelSales || "0"),
      productSales: parseFloat(salesData?.productSales || "0")
    }

    // Get recent transactions for current user
    const recentTransactionsQuery = await db
      .select({
        id: transactions.id,
        totalAmount: transactions.totalAmount,
        transactionDate: transactions.transactionDate,
        productType: products.type,
        productName: products.name
      })
      .from(transactions)
      .leftJoin(transactionItems, eq(transactions.id, transactionItems.transactionId))
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.transactionDate))
      .limit(5)

    const recentTransactions = recentTransactionsQuery.map(tx => ({
      id: tx.id,
      type: tx.productName || (tx.productType === 'pms' ? 'PMS' : 'Lubricant'),
      amount: parseFloat(tx.totalAmount),
      time: getTimeAgo(tx.transactionDate)
    }))

    return {
      isSuccess: true,
      data: {
        todaysSales,
        recentTransactions
      }
    }
  } catch (error) {
    console.error("Error fetching staff dashboard stats:", error)
    return { isSuccess: false, error: "Failed to fetch dashboard stats" }
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}
