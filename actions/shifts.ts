"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { shifts, transactions, transactionItems, users } from "@/db/schema"
import { eq, and, desc, sql, sum, count, isNull } from "drizzle-orm"
import { z } from "zod"

const startShiftSchema = z.object({
  stationId: z.string().uuid(),
  openingCash: z.number().min(0).optional()
})

const endShiftSchema = z.object({
  shiftId: z.string().uuid(),
  closingCash: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  handoverNotes: z.string().max(1000).optional()
})

async function getUserByClerkId(clerkUserId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId)
  })
}

export async function startShift(input: z.infer<typeof startShiftSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = startShiftSchema.parse(input)

    const userInfo = await getUserByClerkId(userId)
    if (!userInfo) {
      return { isSuccess: false, error: "User not found" }
    }

    if (userInfo.stationId !== validatedInput.stationId) {
      return { isSuccess: false, error: "Access denied for this station" }
    }

    const activeShift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.userId, userInfo.id),
        eq(shifts.status, "active")
      )
    })

    if (activeShift) {
      return { isSuccess: false, error: "You already have an active shift. End it before starting a new one." }
    }

    const [newShift] = await db
      .insert(shifts)
      .values({
        stationId: validatedInput.stationId,
        userId: userInfo.id,
        status: "active",
        openingCash: validatedInput.openingCash?.toString()
      })
      .returning()

    return { isSuccess: true, data: newShift }
  } catch (error) {
    console.error("Error starting shift:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to start shift" }
  }
}

export async function endShift(input: z.infer<typeof endShiftSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const validatedInput = endShiftSchema.parse(input)

    const userInfo = await getUserByClerkId(userId)
    if (!userInfo) {
      return { isSuccess: false, error: "User not found" }
    }

    const shift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.id, validatedInput.shiftId),
        eq(shifts.userId, userInfo.id),
        eq(shifts.status, "active")
      )
    })

    if (!shift) {
      return { isSuccess: false, error: "Active shift not found" }
    }

    const shiftSales = await db
      .select({
        totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`
      })
      .from(transactions)
      .where(eq(transactions.shiftId, shift.id))

    const totalSales = shiftSales[0]?.totalSales || "0"
    const transactionCount = shiftSales[0]?.transactionCount || 0

    const openingCash = parseFloat(shift.openingCash || "0")
    const expectedCash = openingCash + parseFloat(totalSales)

    const [updatedShift] = await db
      .update(shifts)
      .set({
        status: "completed",
        endedAt: new Date(),
        closingCash: validatedInput.closingCash?.toString(),
        expectedCash: expectedCash.toString(),
        totalSales,
        transactionCount: transactionCount.toString(),
        notes: validatedInput.notes,
        handoverNotes: validatedInput.handoverNotes
      })
      .where(eq(shifts.id, shift.id))
      .returning()

    return { isSuccess: true, data: updatedShift }
  } catch (error) {
    console.error("Error ending shift:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.issues[0].message }
    }
    return { isSuccess: false, error: "Failed to end shift" }
  }
}

export async function getActiveShift(stationId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userInfo = await getUserByClerkId(userId)
    if (!userInfo) {
      return { isSuccess: false, error: "User not found" }
    }

    if (userInfo.stationId !== stationId) {
      return { isSuccess: false, error: "Access denied for this station" }
    }

    const activeShift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.userId, userInfo.id),
        eq(shifts.status, "active")
      )
    })

    if (!activeShift) {
      return { isSuccess: true, data: null }
    }

    const shiftSales = await db
      .select({
        totalSales: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`
      })
      .from(transactions)
      .where(eq(transactions.shiftId, activeShift.id))

    return {
      isSuccess: true,
      data: {
        ...activeShift,
        currentTotalSales: shiftSales[0]?.totalSales || "0",
        currentTransactionCount: shiftSales[0]?.transactionCount || 0
      }
    }
  } catch (error) {
    console.error("Error fetching active shift:", error)
    return { isSuccess: false, error: "Failed to fetch active shift" }
  }
}

export async function getShiftHistory(
  stationId: string,
  limit: number = 20
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userInfo = await getUserByClerkId(userId)
    if (!userInfo) {
      return { isSuccess: false, error: "User not found" }
    }

    if (userInfo.stationId !== stationId) {
      return { isSuccess: false, error: "Access denied for this station" }
    }

    const whereClause =
      userInfo.role === "manager"
        ? eq(shifts.stationId, stationId)
        : and(eq(shifts.stationId, stationId), eq(shifts.userId, userInfo.id))

    const shiftHistory = await db.query.shifts.findMany({
      where: whereClause,
      orderBy: [desc(shifts.startedAt)],
      limit,
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    })

    return { isSuccess: true, data: shiftHistory }
  } catch (error) {
    console.error("Error fetching shift history:", error)
    return { isSuccess: false, error: "Failed to fetch shift history" }
  }
}

export async function getShiftDetails(shiftId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }

    const userInfo = await getUserByClerkId(userId)
    if (!userInfo) {
      return { isSuccess: false, error: "User not found" }
    }

    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            role: true
          }
        },
        transactions: {
          with: {
            items: {
              with: {
                product: {
                  columns: {
                    id: true,
                    name: true,
                    type: true,
                    unit: true
                  }
                }
              }
            }
          },
          orderBy: [desc(transactions.transactionDate)]
        }
      }
    })

    if (!shift) {
      return { isSuccess: false, error: "Shift not found" }
    }

    if (
      userInfo.role !== "manager" &&
      shift.userId !== userInfo.id
    ) {
      return { isSuccess: false, error: "Access denied" }
    }

    return { isSuccess: true, data: shift }
  } catch (error) {
    console.error("Error fetching shift details:", error)
    return { isSuccess: false, error: "Failed to fetch shift details" }
  }
}
