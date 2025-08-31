"use server"

import { db } from "@/db"
import { transactions, stockMovements, products } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function getUserActivities(userId: string) {
  try {
    if (!userId) {
      return {
        isSuccess: false,
        error: "User ID is required",
        data: []
      }
    }

    // Get recent transactions
    const userTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.totalAmount,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(10)

    // Format activities with null checks
    const activities = (userTransactions || []).map(t => ({
      id: `tx_${t.id}`,
      action: getTransactionAction("sale"),
      details: `₦${Number(t.amount || 0).toLocaleString()}`,
      timestamp: t.createdAt || new Date(),
      type: "sale" as const,
      category: "sale",
      icon: "sale"
    }))

    // Sort by timestamp
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20)

    return {
      isSuccess: true,
      data: sortedActivities,
      totalCount: activities.length
    }
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch user activities",
      data: []
    }
  }
}

function getTransactionAction(type: string): string {
  switch (type) {
    case "sale":
      return "Recorded sale"
    case "refund":
      return "Processed refund"
    case "void":
      return "Voided transaction"
    default:
      return "Processed transaction"
  }
}

function getStockAction(type: string): string {
  switch (type) {
    case "delivery":
      return "Received delivery"
    case "adjustment":
      return "Adjusted inventory"
    case "sale":
      return "Stock sold"
    case "transfer":
      return "Transferred stock"
    default:
      return "Stock movement"
  }
}

function getStockIcon(type: string): string {
  switch (type) {
    case "delivery":
      return "truck"
    case "adjustment":
      return "settings"
    case "sale":
      return "minus"
    case "transfer":
      return "arrow-right"
    default:
      return "package"
  }
}
