"use server"

import { db } from "@/db"
import {
  pumpMeterReadings,
  pumpConfigurations,
  users,
  type SelectPumpMeterReading,
  type InsertPumpMeterReading
} from "@/db/schema"
import { eq, and, gte, lte, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { meterReadingSchemas } from "@/lib/utils"

/**
 * T023: Time window validation - check if reading can be modified
 */
export async function canModifyReading(
  recordedAt: Date,
  readingDate: string
): Promise<boolean> {
  const now = new Date()
  const reading = new Date(readingDate)

  // Find next business day at 6 AM
  const nextBusinessDay = new Date(reading)
  nextBusinessDay.setDate(nextBusinessDay.getDate() + 1)

  // Handle weekends - if reading is Friday, next business day is Monday
  if (reading.getDay() === 5) {
    // Friday
    nextBusinessDay.setDate(nextBusinessDay.getDate() + 2) // Monday
  } else if (reading.getDay() === 6) {
    // Saturday
    nextBusinessDay.setDate(nextBusinessDay.getDate() + 1) // Monday
  }

  // Set to 6 AM
  nextBusinessDay.setHours(6, 0, 0, 0)

  return now < nextBusinessDay
}

/**
 * Get meter readings for a date range
 */
export async function getMeterReadings(params: {
  stationId: string
  startDate: string
  endDate: string
  pumpId?: string
}): Promise<{
  isSuccess: boolean
  data?: SelectPumpMeterReading[]
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const query = db
      .select({
        id: pumpMeterReadings.id,
        pumpId: pumpMeterReadings.pumpId,
        readingDate: pumpMeterReadings.readingDate,
        readingType: pumpMeterReadings.readingType,
        meterValue: pumpMeterReadings.meterValue,
        recordedBy: pumpMeterReadings.recordedBy,
        recordedAt: pumpMeterReadings.recordedAt,
        isEstimated: pumpMeterReadings.isEstimated,
        estimationMethod: pumpMeterReadings.estimationMethod,
        notes: pumpMeterReadings.notes,
        isModified: pumpMeterReadings.isModified,
        originalValue: pumpMeterReadings.originalValue,
        modifiedBy: pumpMeterReadings.modifiedBy,
        modifiedAt: pumpMeterReadings.modifiedAt,
        createdAt: pumpMeterReadings.createdAt,
        pumpNumber: pumpConfigurations.pumpNumber
      })
      .from(pumpMeterReadings)
      .leftJoin(
        pumpConfigurations,
        eq(pumpMeterReadings.pumpId, pumpConfigurations.id)
      )

    // Build conditions array
    const conditions = [
      eq(pumpConfigurations.stationId, params.stationId),
      gte(pumpMeterReadings.readingDate, params.startDate),
      lte(pumpMeterReadings.readingDate, params.endDate)
    ]

    if (params.pumpId) {
      conditions.push(eq(pumpMeterReadings.pumpId, params.pumpId))
    }

    const readings = await query
      .where(and(...conditions))
      .orderBy(
        pumpMeterReadings.readingDate,
        pumpConfigurations.pumpNumber,
        pumpMeterReadings.readingType
      )

    return {
      isSuccess: true,
      data: readings
    }
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch meter readings"
    }
  }
}

/**
 * Record a single meter reading
 */
export async function recordMeterReading(data: {
  pumpId: string
  readingDate: string
  readingType: "opening" | "closing"
  meterValue: number
  notes?: string
  isEstimated?: boolean
  estimationMethod?: "transaction_based" | "historical_average" | "manual"
}): Promise<{
  isSuccess: boolean
  data?: SelectPumpMeterReading
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Get database user record by Clerk user ID
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, user.id))

    if (!dbUser) {
      return {
        isSuccess: false,
        error: "User not found in database"
      }
    }

    // Block Directors from recording meter readings
    if (dbUser.role === "director") {
      return {
        isSuccess: false,
        error: "Directors cannot record meter readings"
      }
    }

    // Validate input data
    const validationResult = meterReadingSchemas.create.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid meter reading data"
      }
    }

    // Check if pump exists and is active
    const [pump] = await db
      .select()
      .from(pumpConfigurations)
      .where(
        and(
          eq(pumpConfigurations.id, data.pumpId),
          eq(pumpConfigurations.isActive, true)
        )
      )

    if (!pump) {
      return {
        isSuccess: false,
        error: "Pump not found or not active"
      }
    }

    // Check for duplicate reading (same pump, date, and type)
    const existingReading = await db
      .select()
      .from(pumpMeterReadings)
      .where(
        and(
          eq(pumpMeterReadings.pumpId, data.pumpId),
          eq(pumpMeterReadings.readingDate, data.readingDate),
          eq(pumpMeterReadings.readingType, data.readingType)
        )
      )

    if (existingReading.length > 0) {
      return {
        isSuccess: false,
        error: "Reading already exists for this pump, date, and type"
      }
    }

    // Validate meter value is within capacity
    const meterCapacity = parseFloat(pump.meterCapacity)
    if (data.meterValue > meterCapacity) {
      return {
        isSuccess: false,
        error: `Meter value exceeds pump capacity of ${meterCapacity}`
      }
    }

    const [newReading] = await db
      .insert(pumpMeterReadings)
      .values({
        pumpId: data.pumpId,
        readingDate: data.readingDate,
        readingType: data.readingType,
        meterValue: data.meterValue.toString(),
        recordedBy: dbUser.id,
        isEstimated: data.isEstimated || false,
        estimationMethod: data.estimationMethod,
        notes: data.notes
      })
      .returning()

    // Trigger automatic calculation if both opening and closing readings exist
    await triggerCalculationIfComplete(data.pumpId, data.readingDate)

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: newReading
    }
  } catch (error) {
    console.error("Error recording meter reading:", error)
    return {
      isSuccess: false,
      error: "Failed to record meter reading"
    }
  }
}

/**
 * Update an existing meter reading (within time window)
 */
export async function updateMeterReading(
  readingId: string,
  data: {
    meterValue: number
    notes?: string
  },
  managerOverride?: {
    isManager: boolean
    managerId: string
    reason: string
  }
): Promise<{
  isSuccess: boolean
  data?: SelectPumpMeterReading
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Get database user record by Clerk user ID
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, user.id))

    if (!dbUser) {
      return {
        isSuccess: false,
        error: "User not found in database"
      }
    }

    // Block Directors from modifying meter readings (unless manager override)
    if (dbUser.role === "director" && !managerOverride?.isManager) {
      return {
        isSuccess: false,
        error: "Directors cannot modify meter readings"
      }
    }

    // Validate input data
    const validationResult = meterReadingSchemas.update.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid meter reading data"
      }
    }

    // Get existing reading
    const [existingReading] = await db
      .select()
      .from(pumpMeterReadings)
      .where(eq(pumpMeterReadings.id, readingId))

    if (!existingReading) {
      return {
        isSuccess: false,
        error: "Meter reading not found"
      }
    }

    // Check modification time window (unless manager override)
    if (!managerOverride?.isManager) {
      const canModify = await canModifyReading(
        existingReading.recordedAt,
        existingReading.readingDate
      )
      if (!canModify) {
        return {
          isSuccess: false,
          error:
            "Modification window expired. Readings can only be modified until 6 AM next business day."
        }
      }
    }

    // Get pump for capacity validation
    const [pump] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, existingReading.pumpId))

    if (!pump) {
      return {
        isSuccess: false,
        error: "Associated pump not found"
      }
    }

    // Validate meter value is within capacity
    const meterCapacity = parseFloat(pump.meterCapacity)
    if (data.meterValue > meterCapacity) {
      return {
        isSuccess: false,
        error: `Meter value exceeds pump capacity of ${meterCapacity}`
      }
    }

    // Prepare update data
    const updateData: Partial<InsertPumpMeterReading> = {
      meterValue: data.meterValue.toString(),
      notes: data.notes || existingReading.notes,
      isModified: true,
      modifiedBy: managerOverride?.managerId || dbUser.id,
      modifiedAt: new Date()
    }

    // Store original value if this is the first modification
    if (!existingReading.isModified) {
      updateData.originalValue = existingReading.meterValue
    }

    // Add manager override note if applicable
    if (managerOverride?.isManager) {
      updateData.notes =
        `${updateData.notes || ""}\n[MANAGER OVERRIDE: ${managerOverride.reason}]`.trim()
    }

    const [updatedReading] = await db
      .update(pumpMeterReadings)
      .set(updateData)
      .where(eq(pumpMeterReadings.id, readingId))
      .returning()

    // Trigger recalculation
    await triggerCalculationIfComplete(
      existingReading.pumpId,
      existingReading.readingDate
    )

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: updatedReading
    }
  } catch (error) {
    console.error("Error updating meter reading:", error)
    return {
      isSuccess: false,
      error: "Failed to update meter reading"
    }
  }
}

/**
 * Record multiple meter readings in bulk
 */
export async function recordBulkMeterReadings(data: {
  stationId: string
  readingDate: string
  readingType: "opening" | "closing"
  readings: Array<{
    pumpId: string
    meterValue: number
    notes?: string
  }>
}): Promise<{
  isSuccess: boolean
  data?: {
    recordedCount: number
    errors: Array<{ pumpId: string; error: string }>
  }
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = meterReadingSchemas.bulk.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid bulk reading data"
      }
    }

    const results = {
      recordedCount: 0,
      errors: [] as Array<{ pumpId: string; error: string }>
    }

    // Process each reading
    for (const reading of data.readings) {
      try {
        const result = await recordMeterReading({
          pumpId: reading.pumpId,
          readingDate: data.readingDate,
          readingType: data.readingType,
          meterValue: reading.meterValue,
          notes: reading.notes
        })

        if (result.isSuccess) {
          results.recordedCount++
        } else {
          results.errors.push({
            pumpId: reading.pumpId,
            error: result.error || "Unknown error"
          })
        }
      } catch (error) {
        results.errors.push({
          pumpId: reading.pumpId,
          error: "Failed to process reading"
        })
      }
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: results
    }
  } catch (error) {
    console.error("Error recording bulk meter readings:", error)
    return {
      isSuccess: false,
      error: "Failed to record bulk meter readings"
    }
  }
}

/**
 * Get daily reading status for a station
 */
export async function getDailyReadingStatus(
  stationId: string,
  date: string
): Promise<{
  isSuccess: boolean
  data?: {
    date: string
    pumps: Array<{
      pumpId: string
      pumpNumber: string
      hasOpening: boolean
      hasClosing: boolean
      openingValue?: number
      closingValue?: number
      openingTime?: Date
      closingTime?: Date
    }>
  }
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Get all active pumps for the station
    const pumps = await db
      .select()
      .from(pumpConfigurations)
      .where(
        and(
          eq(pumpConfigurations.stationId, stationId),
          eq(pumpConfigurations.isActive, true)
        )
      )
      .orderBy(pumpConfigurations.pumpNumber)

    // Get readings for the date
    const readings = await db
      .select()
      .from(pumpMeterReadings)
      .where(eq(pumpMeterReadings.readingDate, date))

    // Build status for each pump
    const pumpStatuses = pumps.map(pump => {
      const pumpReadings = readings.filter(r => r.pumpId === pump.id)
      const openingReading = pumpReadings.find(r => r.readingType === "opening")
      const closingReading = pumpReadings.find(r => r.readingType === "closing")

      return {
        pumpId: pump.id,
        pumpNumber: pump.pumpNumber,
        hasOpening: !!openingReading,
        hasClosing: !!closingReading,
        openingValue: openingReading
          ? parseFloat(openingReading.meterValue)
          : undefined,
        closingValue: closingReading
          ? parseFloat(closingReading.meterValue)
          : undefined,
        openingTime: openingReading?.recordedAt,
        closingTime: closingReading?.recordedAt
      }
    })

    return {
      isSuccess: true,
      data: {
        date,
        pumps: pumpStatuses
      }
    }
  } catch (error) {
    console.error("Error fetching daily reading status:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch daily reading status"
    }
  }
}

/**
 * Helper function to trigger calculation when both readings exist
 */
async function triggerCalculationIfComplete(
  pumpId: string,
  readingDate: string
): Promise<void> {
  try {
    // Check if both opening and closing readings exist
    const readings = await db
      .select()
      .from(pumpMeterReadings)
      .where(
        and(
          eq(pumpMeterReadings.pumpId, pumpId),
          eq(pumpMeterReadings.readingDate, readingDate)
        )
      )

    const hasOpening = readings.some(r => r.readingType === "opening")
    const hasClosing = readings.some(r => r.readingType === "closing")

    if (hasOpening && hasClosing) {
      // Import and call the calculation function (will be implemented in T020)
      const { calculatePmsForDate } = await import("./pms-calculations")

      // Get station ID from pump configuration
      const [pump] = await db
        .select()
        .from(pumpConfigurations)
        .where(eq(pumpConfigurations.id, pumpId))

      if (pump) {
        await calculatePmsForDate({
          stationId: pump.stationId,
          calculationDate: readingDate
        })
      }
    }
  } catch (error) {
    // Don't throw - this is a background operation
    console.error("Error triggering automatic calculation:", error)
  }
}
