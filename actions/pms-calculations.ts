"use server"

import { db } from "@/db"
import {
  dailyPmsCalculations,
  pumpMeterReadings,
  pumpConfigurations,
  products,
  pmsSalesRecords,
  type SelectDailyPmsCalculation,
  type InsertDailyPmsCalculation
} from "@/db/schema"
import { eq, and, gte, lte, desc, sql, avg } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { pmsCalculationSchemas } from "@/lib/utils"

/**
 * Calculate PMS sales for a specific date
 */
export async function calculatePmsForDate(data: {
  stationId: string
  calculationDate: string
  forceRecalculate?: boolean
}): Promise<{
  isSuccess: boolean
  data?: {
    calculatedCount: number
    totalVolume: number
    totalRevenue: number
    calculations: SelectDailyPmsCalculation[]
  }
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = pmsCalculationSchemas.create.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid calculation data"
      }
    }

    // Get all active pumps for the station
    const pumps = await db
      .select({
        pumpId: pumpConfigurations.id,
        pumpNumber: pumpConfigurations.pumpNumber,
        meterCapacity: pumpConfigurations.meterCapacity,
        pmsProductId: pumpConfigurations.pmsProductId
      })
      .from(pumpConfigurations)
      .where(
        and(
          eq(pumpConfigurations.stationId, data.stationId),
          eq(pumpConfigurations.isActive, true),
          eq(pumpConfigurations.status, "active")
        )
      )

    if (pumps.length === 0) {
      return {
        isSuccess: false,
        error: "No active pumps found for this station"
      }
    }

    const results = {
      calculatedCount: 0,
      totalVolume: 0,
      totalRevenue: 0,
      calculations: [] as SelectDailyPmsCalculation[]
    }

    // Delete existing calculations if force recalculate
    if (data.forceRecalculate) {
      await db
        .delete(dailyPmsCalculations)
        .where(
          and(
            eq(dailyPmsCalculations.calculationDate, data.calculationDate),
            sql`pump_id IN (SELECT id FROM pump_configurations WHERE station_id = ${data.stationId})`
          )
        )
    }

    // Process each pump
    for (const pump of pumps) {
      try {
        const calculation = await calculatePumpForDate(
          pump.pumpId,
          data.calculationDate,
          user.id
        )

        if (calculation.isSuccess && calculation.data) {
          results.calculatedCount++
          results.totalVolume += parseFloat(calculation.data.volumeDispensed)
          results.totalRevenue += parseFloat(calculation.data.totalRevenue)
          results.calculations.push(calculation.data)
        }
      } catch (error) {
        console.error(`Error calculating pump ${pump.pumpId}:`, error)
        // Continue with other pumps
      }
    }

    // Create or update station-wide PMS sales record
    await updateStationPmsSalesRecord(
      data.stationId,
      data.calculationDate,
      results
    )

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: results
    }
  } catch (error) {
    console.error("Error calculating PMS for date:", error)
    return {
      isSuccess: false,
      error: "Failed to calculate PMS sales"
    }
  }
}

/**
 * Calculate PMS sales for a single pump on a specific date
 */
async function calculatePumpForDate(
  pumpId: string,
  calculationDate: string,
  userId: string
): Promise<{
  isSuccess: boolean
  data?: SelectDailyPmsCalculation
  error?: string
}> {
  try {
    // Check if calculation already exists
    const [existingCalculation] = await db
      .select()
      .from(dailyPmsCalculations)
      .where(
        and(
          eq(dailyPmsCalculations.pumpId, pumpId),
          eq(dailyPmsCalculations.calculationDate, calculationDate)
        )
      )

    if (existingCalculation) {
      return {
        isSuccess: true,
        data: existingCalculation
      }
    }

    // Get pump configuration and product info
    const [pumpInfo] = await db
      .select({
        pumpId: pumpConfigurations.id,
        meterCapacity: pumpConfigurations.meterCapacity,
        pmsProductId: pumpConfigurations.pmsProductId,
        unitPrice: products.unitPrice
      })
      .from(pumpConfigurations)
      .leftJoin(products, eq(pumpConfigurations.pmsProductId, products.id))
      .where(eq(pumpConfigurations.id, pumpId))

    if (!pumpInfo) {
      return {
        isSuccess: false,
        error: "Pump or product information not found"
      }
    }

    // Get meter readings for the date
    const readings = await db
      .select()
      .from(pumpMeterReadings)
      .where(
        and(
          eq(pumpMeterReadings.pumpId, pumpId),
          eq(pumpMeterReadings.readingDate, calculationDate)
        )
      )

    const openingReading = readings.find(r => r.readingType === "opening")
    const closingReading = readings.find(r => r.readingType === "closing")

    let calculationMethod: "meter_readings" | "estimated" | "manual_override" =
      "meter_readings"
    let isEstimated = false
    let openingValue: number
    let closingValue: number

    // Handle missing readings with estimation
    if (!openingReading || !closingReading) {
      const estimation = await estimateMissingReadings(
        pumpId,
        calculationDate,
        openingReading,
        closingReading
      )

      openingValue = estimation.openingValue
      closingValue = estimation.closingValue
      calculationMethod = "estimated"
      isEstimated = true
    } else {
      openingValue = parseFloat(openingReading.meterValue)
      closingValue = parseFloat(closingReading.meterValue)

      // Check if either reading is estimated
      if (openingReading.isEstimated || closingReading.isEstimated) {
        isEstimated = true
        calculationMethod = "estimated"
      }
    }

    // T021: Rollover detection logic
    const rolloverInfo = detectRollover(
      openingValue,
      closingValue,
      parseFloat(pumpInfo.meterCapacity)
    )

    let volumeDispensed = rolloverInfo.volumeDispensed
    const hasRollover = rolloverInfo.hasRollover
    const rolloverValue = rolloverInfo.rolloverValue

    // Calculate revenue
    const unitPrice = parseFloat(pumpInfo.unitPrice)
    const totalRevenue = volumeDispensed * unitPrice

    // T022: Deviation detection - calculate deviation from average
    const deviationPercent = await calculateDeviationFromAverage(
      pumpId,
      volumeDispensed,
      calculationDate
    )

    // Create calculation record
    const [newCalculation] = await db
      .insert(dailyPmsCalculations)
      .values({
        pumpId: pumpId,
        calculationDate: calculationDate,
        openingReading: openingValue.toString(),
        closingReading: closingValue.toString(),
        volumeDispensed: volumeDispensed.toString(),
        unitPrice: unitPrice.toString(),
        totalRevenue: totalRevenue.toString(),
        hasRollover: hasRollover,
        rolloverValue: rolloverValue ? rolloverValue.toString() : null,
        deviationFromAverage: deviationPercent.toString(),
        isEstimated: isEstimated,
        calculationMethod: calculationMethod,
        calculatedBy: userId
      })
      .returning()

    return {
      isSuccess: true,
      data: newCalculation
    }
  } catch (error) {
    console.error("Error calculating pump for date:", error)
    return {
      isSuccess: false,
      error: "Failed to calculate pump data"
    }
  }
}

/**
 * T021: Rollover detection business logic
 */
function detectRollover(
  openingValue: number,
  closingValue: number,
  meterCapacity: number
): {
  volumeDispensed: number
  hasRollover: boolean
  rolloverValue?: number
} {
  // If closing is greater than opening, no rollover
  if (closingValue >= openingValue) {
    return {
      volumeDispensed: closingValue - openingValue,
      hasRollover: false
    }
  }

  // Potential rollover - closing is less than opening
  // Calculate assuming rollover occurred at meter capacity
  const volumeBeforeRollover = meterCapacity - openingValue
  const volumeAfterRollover = closingValue
  const totalVolume = volumeBeforeRollover + volumeAfterRollover

  // Validate that this makes sense (total volume should be reasonable)
  // If total volume is > 50% of capacity, assume rollover
  // Otherwise, might be an error
  if (totalVolume <= meterCapacity * 0.5) {
    return {
      volumeDispensed: totalVolume,
      hasRollover: true,
      rolloverValue: meterCapacity
    }
  }

  // If volume seems unreasonable, return direct difference (might be corrected later)
  return {
    volumeDispensed: Math.abs(closingValue - openingValue),
    hasRollover: false
  }
}

/**
 * T022: Deviation detection business logic
 */
async function calculateDeviationFromAverage(
  pumpId: string,
  currentVolume: number,
  currentDate: string,
  days: number = 7
): Promise<number> {
  try {
    // Get historical data for the past N days (excluding current date)
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - days)

    const endDate = new Date(currentDate)
    endDate.setDate(endDate.getDate() - 1) // Exclude current date

    const historicalData = await db
      .select({
        avgVolume: avg(sql`CAST(volume_dispensed AS DECIMAL)`)
      })
      .from(dailyPmsCalculations)
      .where(
        and(
          eq(dailyPmsCalculations.pumpId, pumpId),
          gte(
            dailyPmsCalculations.calculationDate,
            startDate.toISOString().split("T")[0]
          ),
          lte(
            dailyPmsCalculations.calculationDate,
            endDate.toISOString().split("T")[0]
          ),
          eq(dailyPmsCalculations.isEstimated, false) // Only use actual readings for baseline
        )
      )

    const averageVolume = historicalData[0]?.avgVolume

    if (!averageVolume || averageVolume === 0) {
      return 0 // No historical data or zero average
    }

    const avgVol = parseFloat(averageVolume.toString())
    const deviationPercent = ((currentVolume - avgVol) / avgVol) * 100

    return Math.round(deviationPercent * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    console.error("Error calculating deviation:", error)
    return 0
  }
}

/**
 * Estimate missing readings using various methods
 */
async function estimateMissingReadings(
  pumpId: string,
  calculationDate: string,
  openingReading?: any,
  closingReading?: any
): Promise<{
  openingValue: number
  closingValue: number
  estimationMethod: "transaction_based" | "historical_average" | "manual"
}> {
  try {
    // If we have one reading, estimate the other based on historical average volume
    const historicalVolume = await getHistoricalAverageVolume(pumpId)

    if (openingReading && !closingReading) {
      // Estimate closing = opening + average volume
      return {
        openingValue: parseFloat(openingReading.meterValue),
        closingValue: parseFloat(openingReading.meterValue) + historicalVolume,
        estimationMethod: "historical_average"
      }
    } else if (closingReading && !openingReading) {
      // Estimate opening = closing - average volume
      return {
        openingValue: parseFloat(closingReading.meterValue) - historicalVolume,
        closingValue: parseFloat(closingReading.meterValue),
        estimationMethod: "historical_average"
      }
    } else {
      // Both missing - use previous day's closing + average volume
      const previousClosing = await getPreviousDayClosing(
        pumpId,
        calculationDate
      )

      return {
        openingValue: previousClosing,
        closingValue: previousClosing + historicalVolume,
        estimationMethod: "historical_average"
      }
    }
  } catch (error) {
    console.error("Error estimating readings:", error)
    // Fallback to default values
    return {
      openingValue: 0,
      closingValue: 100, // Default 100L
      estimationMethod: "manual"
    }
  }
}

/**
 * Get historical average volume for a pump
 */
async function getHistoricalAverageVolume(pumpId: string): Promise<number> {
  try {
    // Get average volume from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [result] = await db
      .select({
        avgVolume: avg(sql`CAST(volume_dispensed AS DECIMAL)`)
      })
      .from(dailyPmsCalculations)
      .where(
        and(
          eq(dailyPmsCalculations.pumpId, pumpId),
          gte(
            dailyPmsCalculations.calculationDate,
            thirtyDaysAgo.toISOString().split("T")[0]
          ),
          eq(dailyPmsCalculations.isEstimated, false)
        )
      )

    return result?.avgVolume ? parseFloat(result.avgVolume.toString()) : 120 // Default 120L
  } catch (error) {
    console.error("Error getting historical average:", error)
    return 120 // Default fallback
  }
}

/**
 * Get previous day's closing reading
 */
async function getPreviousDayClosing(
  pumpId: string,
  currentDate: string
): Promise<number> {
  try {
    const previousDate = new Date(currentDate)
    previousDate.setDate(previousDate.getDate() - 1)
    const prevDateStr = previousDate.toISOString().split("T")[0]

    const [reading] = await db
      .select()
      .from(pumpMeterReadings)
      .where(
        and(
          eq(pumpMeterReadings.pumpId, pumpId),
          eq(pumpMeterReadings.readingDate, prevDateStr),
          eq(pumpMeterReadings.readingType, "closing")
        )
      )

    return reading ? parseFloat(reading.meterValue) : 10000 // Default starting value
  } catch (error) {
    console.error("Error getting previous day closing:", error)
    return 10000 // Default fallback
  }
}

/**
 * Handle manual rollover confirmation
 */
export async function confirmRollover(data: {
  pumpId: string
  calculationDate: string
  rolloverValue: number
  newReading: number
}): Promise<{
  isSuccess: boolean
  data?: SelectDailyPmsCalculation
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = pmsCalculationSchemas.rollover.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid rollover data"
      }
    }

    // Get existing calculation
    const [existingCalculation] = await db
      .select()
      .from(dailyPmsCalculations)
      .where(
        and(
          eq(dailyPmsCalculations.pumpId, data.pumpId),
          eq(dailyPmsCalculations.calculationDate, data.calculationDate)
        )
      )

    if (!existingCalculation) {
      return {
        isSuccess: false,
        error: "Calculation not found"
      }
    }

    // Get pump info for capacity validation
    const [pump] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, data.pumpId))

    if (!pump) {
      return {
        isSuccess: false,
        error: "Pump not found"
      }
    }

    const meterCapacity = parseFloat(pump.meterCapacity)

    // Validate rollover value doesn't exceed capacity
    if (data.rolloverValue > meterCapacity) {
      return {
        isSuccess: false,
        error: `Rollover value exceeds pump capacity of ${meterCapacity}`
      }
    }

    // Recalculate volume with confirmed rollover
    const openingValue = parseFloat(existingCalculation.openingReading)
    const volumeBeforeRollover = data.rolloverValue - openingValue
    const volumeAfterRollover = data.newReading
    const totalVolume = volumeBeforeRollover + volumeAfterRollover

    // Recalculate revenue
    const unitPrice = parseFloat(existingCalculation.unitPrice)
    const totalRevenue = totalVolume * unitPrice

    // Update calculation
    const [updatedCalculation] = await db
      .update(dailyPmsCalculations)
      .set({
        closingReading: data.newReading.toString(),
        volumeDispensed: totalVolume.toString(),
        totalRevenue: totalRevenue.toString(),
        hasRollover: true,
        rolloverValue: data.rolloverValue.toString(),
        calculationMethod: "meter_readings", // Changed from estimated to confirmed
        updatedAt: new Date()
      })
      .where(eq(dailyPmsCalculations.id, existingCalculation.id))
      .returning()

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: updatedCalculation
    }
  } catch (error) {
    console.error("Error confirming rollover:", error)
    return {
      isSuccess: false,
      error: "Failed to confirm rollover"
    }
  }
}

/**
 * Approve or reject estimated calculations
 */
export async function approveEstimatedCalculation(
  calculationId: string,
  data: {
    approved: boolean
    notes?: string
  }
): Promise<{
  isSuccess: boolean
  data?: SelectDailyPmsCalculation
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = pmsCalculationSchemas.approve.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid approval data"
      }
    }

    // Get existing calculation
    const [existingCalculation] = await db
      .select()
      .from(dailyPmsCalculations)
      .where(eq(dailyPmsCalculations.id, calculationId))

    if (!existingCalculation) {
      return {
        isSuccess: false,
        error: "Calculation not found"
      }
    }

    // Verify it's an estimated calculation
    if (!existingCalculation.isEstimated) {
      return {
        isSuccess: false,
        error: "Only estimated calculations can be approved"
      }
    }

    // Update calculation with approval status
    const [updatedCalculation] = await db
      .update(dailyPmsCalculations)
      .set({
        approvedBy: user.id,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(dailyPmsCalculations.id, calculationId))
      .returning()

    if (!data.approved) {
      // If rejected, could trigger re-estimation or manual entry
      // For now, just mark as approved with rejection note
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: updatedCalculation
    }
  } catch (error) {
    console.error("Error approving calculation:", error)
    return {
      isSuccess: false,
      error: "Failed to approve calculation"
    }
  }
}

/**
 * Get calculations with significant deviations
 */
export async function getCalculationsWithDeviations(params: {
  stationId: string
  thresholdPercent?: number
  days?: number
}): Promise<{
  isSuccess: boolean
  data?: Array<
    SelectDailyPmsCalculation & {
      averageVolume: number
      deviationPercent: number
      pumpNumber: string
    }
  >
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const threshold = params.thresholdPercent || 20
    const days = params.days || 7

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const deviations = await db
      .select({
        calculation: dailyPmsCalculations,
        pumpNumber: pumpConfigurations.pumpNumber
      })
      .from(dailyPmsCalculations)
      .leftJoin(
        pumpConfigurations,
        eq(dailyPmsCalculations.pumpId, pumpConfigurations.id)
      )
      .where(
        and(
          eq(pumpConfigurations.stationId, params.stationId),
          gte(
            dailyPmsCalculations.calculationDate,
            startDate.toISOString().split("T")[0]
          ),
          lte(
            dailyPmsCalculations.calculationDate,
            endDate.toISOString().split("T")[0]
          ),
          sql`ABS(CAST(deviation_from_average AS DECIMAL)) >= ${threshold}`
        )
      )
      .orderBy(desc(sql`ABS(CAST(deviation_from_average AS DECIMAL))`))

    // Enhance with additional calculation data
    const enhancedDeviations = await Promise.all(
      deviations.map(async item => {
        const calc = item.calculation
        const avgVolume = await getHistoricalAverageVolume(calc.pumpId)

        return {
          ...calc,
          averageVolume: avgVolume,
          deviationPercent: parseFloat(calc.deviationFromAverage),
          pumpNumber: item.pumpNumber
        }
      })
    )

    return {
      isSuccess: true,
      data: enhancedDeviations
    }
  } catch (error) {
    console.error("Error fetching deviation calculations:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch deviation calculations"
    }
  }
}

/**
 * Update station-wide PMS sales record
 */
async function updateStationPmsSalesRecord(
  stationId: string,
  recordDate: string,
  calculationResults: {
    totalVolume: number
    totalRevenue: number
    calculations: SelectDailyPmsCalculation[]
  }
): Promise<void> {
  try {
    const pumpCalculations = calculationResults.calculations.map(calc => ({
      pumpId: calc.pumpId,
      pumpNumber: "", // Will be filled from pump config
      volume: parseFloat(calc.volumeDispensed),
      revenue: parseFloat(calc.totalRevenue),
      isEstimated: calc.isEstimated
    }))

    // Get pump numbers
    for (const pumpCalc of pumpCalculations) {
      const [pump] = await db
        .select({ pumpNumber: pumpConfigurations.pumpNumber })
        .from(pumpConfigurations)
        .where(eq(pumpConfigurations.id, pumpCalc.pumpId))

      if (pump) {
        pumpCalc.pumpNumber = pump.pumpNumber
      }
    }

    const averageUnitPrice =
      calculationResults.totalRevenue / calculationResults.totalVolume || 0
    const estimatedVolumeCount = pumpCalculations
      .filter(p => p.isEstimated)
      .reduce((sum, p) => sum + p.volume, 0)

    // Insert or update PMS sales record
    await db
      .insert(pmsSalesRecords)
      .values({
        stationId: stationId,
        recordDate: recordDate,
        totalVolumeDispensed: calculationResults.totalVolume.toString(),
        totalRevenue: calculationResults.totalRevenue.toString(),
        averageUnitPrice: averageUnitPrice.toString(),
        pumpCount: calculationResults.calculations.length,
        estimatedVolumeCount: estimatedVolumeCount.toString(),
        calculationDetails: {
          pumpCalculations: pumpCalculations
        }
      })
      .onConflictDoUpdate({
        target: [pmsSalesRecords.stationId, pmsSalesRecords.recordDate],
        set: {
          totalVolumeDispensed: calculationResults.totalVolume.toString(),
          totalRevenue: calculationResults.totalRevenue.toString(),
          averageUnitPrice: averageUnitPrice.toString(),
          pumpCount: calculationResults.calculations.length,
          estimatedVolumeCount: estimatedVolumeCount.toString(),
          calculationDetails: {
            pumpCalculations: pumpCalculations
          },
          updatedAt: new Date()
        }
      })
  } catch (error) {
    console.error("Error updating station PMS sales record:", error)
    // Don't throw - this is a secondary operation
  }
}

/**
 * Get PMS calculations for a date range
 */
export async function getPmsCalculations(params: {
  stationId: string
  startDate: string
  endDate: string
}): Promise<{
  isSuccess: boolean
  data?: SelectDailyPmsCalculation[]
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const calculations = await db
      .select({
        calculation: dailyPmsCalculations,
        pumpNumber: pumpConfigurations.pumpNumber
      })
      .from(dailyPmsCalculations)
      .leftJoin(
        pumpConfigurations,
        eq(dailyPmsCalculations.pumpId, pumpConfigurations.id)
      )
      .where(
        and(
          eq(pumpConfigurations.stationId, params.stationId),
          gte(dailyPmsCalculations.calculationDate, params.startDate),
          lte(dailyPmsCalculations.calculationDate, params.endDate)
        )
      )
      .orderBy(
        dailyPmsCalculations.calculationDate,
        pumpConfigurations.pumpNumber
      )

    const enhancedCalculations = calculations.map(item => ({
      ...item.calculation,
      pumpNumber: item.pumpNumber
    }))

    return {
      isSuccess: true,
      data: enhancedCalculations
    }
  } catch (error) {
    console.error("Error fetching PMS calculations:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch PMS calculations"
    }
  }
}
