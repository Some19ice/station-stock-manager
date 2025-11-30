"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users, transactions, transactionItems, products } from "@/db/schema"
import { eq, and, gte, lte, sql, desc } from "drizzle-orm"
import { getCurrentUserProfile } from "./auth"

export async function getStaffPerformanceReports(timeRange: string = "30") {
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

    // Get all staff members for this station
    const staffMembers = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.stationId, stationId))

    // Get performance data for each staff member
    const staffPerformanceData = await Promise.all(
      staffMembers.map(async (staff) => {
        // Get sales data
        const salesData = await db
          .select({
            totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
            transactionCount: sql<number>`COUNT(${transactions.id})`
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, staff.id),
              gte(transactions.transactionDate, startDate)
            )
          )

        const totalSales = parseFloat(salesData[0]?.totalSales || "0")
        const transactionCount = salesData[0]?.transactionCount || 0
        const avgTransactionValue = transactionCount > 0 ? totalSales / transactionCount : 0

        // Calculate efficiency (transactions per day)
        const efficiency = Math.min(100, Math.round((transactionCount / days) * 10))

        // Determine performance level
        let performance: "excellent" | "good" | "average" | "needs_improvement"
        if (efficiency >= 90) performance = "excellent"
        else if (efficiency >= 75) performance = "good"
        else if (efficiency >= 60) performance = "average"
        else performance = "needs_improvement"

        return {
          id: staff.id,
          name: staff.username.replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          role: staff.role === "manager" ? "Manager" : "Sales Staff",
          totalSales,
          transactionCount,
          avgTransactionValue,
          hoursWorked: days * 8, // Assume 8 hours per day
          efficiency,
          customerRating: parseFloat((4.0 + (efficiency / 100) * 1.0).toFixed(1)), // Mock rating based on efficiency
          lastActive: new Date(),
          performance
        }
      })
    )

    // Get weekly performance trends
    const weeklyData = []
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (week + 1) * 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - week * 7)

      const weekSales = await db
        .select({
          totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
          transactionCount: sql<number>`COUNT(${transactions.id})`
        })
        .from(transactions)
        .innerJoin(users, eq(transactions.userId, users.id))
        .where(
          and(
            eq(users.stationId, stationId),
            gte(transactions.transactionDate, weekStart),
            lte(transactions.transactionDate, weekEnd)
          )
        )

      const totalSales = parseFloat(weekSales[0]?.totalSales || "0")
      const transactionCount = weekSales[0]?.transactionCount || 0
      const efficiency = Math.min(100, Math.round((transactionCount / 7) * 10))

      weeklyData.unshift({
        date: `Week ${4 - week}`,
        sales: totalSales,
        transactions: transactionCount,
        efficiency
      })
    }

    return {
      isSuccess: true,
      data: {
        staffData: staffPerformanceData,
        performanceData: weeklyData
      }
    }
  } catch (error) {
    console.error("Error fetching staff performance reports:", error)
    return { isSuccess: false, error: "Failed to fetch staff performance reports" }
  }
}

export async function getStaffStats() {
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
        totalStaff: sql<number>`COUNT(*)`,
        activeStaff: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
        managers: sql<number>`COUNT(CASE WHEN ${users.role} = 'manager' THEN 1 END)`,
        staff: sql<number>`COUNT(CASE WHEN ${users.role} = 'staff' THEN 1 END)`
      })
      .from(users)
      .where(eq(users.stationId, stationId))

    return { isSuccess: true, data: stats[0] }
  } catch (error) {
    console.error("Error fetching staff stats:", error)
    return { isSuccess: false, error: "Failed to fetch staff stats" }
  }
}
