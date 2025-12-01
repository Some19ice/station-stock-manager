"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users, transactions } from "@/db/schema"
import { eq, and, gte, sql } from "drizzle-orm"
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

    // Single aggregated query instead of N+1 queries
    const staffPerformanceData = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(DISTINCT ${transactions.id})`,
        avgTransactionValue: sql<string>`
          CASE 
            WHEN COUNT(DISTINCT ${transactions.id}) > 0 
            THEN COALESCE(SUM(${transactions.totalAmount}), 0) / COUNT(DISTINCT ${transactions.id})
            ELSE 0 
          END
        `,
        lastTransaction: sql<Date>`MAX(${transactions.transactionDate})`
      })
      .from(users)
      .leftJoin(
        transactions,
        and(
          eq(transactions.userId, users.id),
          gte(transactions.transactionDate, startDate)
        )
      )
      .where(eq(users.stationId, stationId))
      .groupBy(
        users.id,
        users.username,
        users.role,
        users.isActive,
        users.createdAt
      )

    const formattedStaffData = staffPerformanceData.map(staff => {
      const totalSales = parseFloat(staff.totalSales || "0")
      const transactionCount = staff.transactionCount || 0
      const avgTransactionValue = parseFloat(staff.avgTransactionValue || "0")
      const efficiency = Math.min(100, Math.round((transactionCount / days) * 10))

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
        hoursWorked: days * 8,
        efficiency,
        customerRating: parseFloat((4.0 + (efficiency / 100) * 1.0).toFixed(1)),
        lastActive: staff.lastTransaction ? new Date(staff.lastTransaction) : new Date(),
        performance
      }
    })

    // Single query with date bucketing for weekly data
    const weeklyDataRaw = await db
      .select({
        week: sql<number>`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${transactions.transactionDate})) / 604800)::integer`,
        totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .where(
        and(
          eq(users.stationId, stationId),
          gte(transactions.transactionDate, sql`NOW() - INTERVAL '4 weeks'`)
        )
      )
      .groupBy(sql`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${transactions.transactionDate})) / 604800)::integer`)
      .having(sql`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${transactions.transactionDate})) / 604800)::integer < 4`)
      .orderBy(sql`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${transactions.transactionDate})) / 604800)::integer`)

    const weeklyDataMap = new Map(
      weeklyDataRaw.map(row => [row.week, row])
    )

    const weeklyData = []
    for (let week = 0; week < 4; week++) {
      const data = weeklyDataMap.get(week)
      const totalSales = parseFloat(data?.totalSales || "0")
      const transactionCount = data?.transactionCount || 0
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
        staffData: formattedStaffData,
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
