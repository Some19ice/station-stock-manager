"use server"

import { db } from "@/db"
import {
  pumpConfigurations,
  type SelectPumpConfiguration,
  type InsertPumpConfiguration
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { pumpConfigurationSchemas } from "@/lib/utils"

/**
 * Get all pump configurations for a station
 */
export async function getPumpConfigurations(stationId: string): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration[]
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const configurations = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.stationId, stationId))
      .orderBy(pumpConfigurations.pumpNumber)

    return {
      isSuccess: true,
      data: configurations
    }
  } catch (error) {
    console.error("Error fetching pump configurations:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch pump configurations"
    }
  }
}

/**
 * Get a single pump configuration by ID
 */
export async function getPumpConfiguration(pumpId: string): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const [configuration] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, pumpId))

    if (!configuration) {
      return {
        isSuccess: false,
        error: "Pump configuration not found"
      }
    }

    return {
      isSuccess: true,
      data: configuration
    }
  } catch (error) {
    console.error("Error fetching pump configuration:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch pump configuration"
    }
  }
}

/**
 * Create a new pump configuration
 */
export async function createPumpConfiguration(data: {
  stationId: string
  pmsProductId: string
  pumpNumber: string
  meterCapacity: number
  installDate: string
}): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = pumpConfigurationSchemas.create.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid pump configuration data"
      }
    }

    // Check if pump number already exists for the station
    const existingPump = await db
      .select()
      .from(pumpConfigurations)
      .where(
        and(
          eq(pumpConfigurations.stationId, data.stationId),
          eq(pumpConfigurations.pumpNumber, data.pumpNumber)
        )
      )

    if (existingPump.length > 0) {
      return {
        isSuccess: false,
        error: "Pump number already exists for this station"
      }
    }

    const [newConfiguration] = await db
      .insert(pumpConfigurations)
      .values({
        stationId: data.stationId,
        pmsProductId: data.pmsProductId,
        pumpNumber: data.pumpNumber,
        meterCapacity: data.meterCapacity.toString(),
        installDate: data.installDate,
        status: "active"
      })
      .returning()

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: newConfiguration
    }
  } catch (error) {
    console.error("Error creating pump configuration:", error)
    return {
      isSuccess: false,
      error: "Failed to create pump configuration"
    }
  }
}

/**
 * Update an existing pump configuration
 */
export async function updatePumpConfiguration(
  pumpId: string,
  data: {
    pumpNumber?: string
    meterCapacity?: number
    lastCalibrationDate?: string
  }
): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult = pumpConfigurationSchemas.update.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid pump configuration data"
      }
    }

    // Check if pump exists
    const [existingPump] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, pumpId))

    if (!existingPump) {
      return {
        isSuccess: false,
        error: "Pump configuration not found"
      }
    }

    // If updating pump number, check for conflicts
    if (data.pumpNumber && data.pumpNumber !== existingPump.pumpNumber) {
      const conflictingPump = await db
        .select()
        .from(pumpConfigurations)
        .where(
          and(
            eq(pumpConfigurations.stationId, existingPump.stationId),
            eq(pumpConfigurations.pumpNumber, data.pumpNumber)
          )
        )

      if (conflictingPump.length > 0) {
        return {
          isSuccess: false,
          error: "Pump number already exists for this station"
        }
      }
    }

    const updateData: Partial<InsertPumpConfiguration> = {
      updatedAt: new Date()
    }

    if (data.pumpNumber) updateData.pumpNumber = data.pumpNumber
    if (data.meterCapacity)
      updateData.meterCapacity = data.meterCapacity.toString()
    if (data.lastCalibrationDate)
      updateData.lastCalibrationDate = data.lastCalibrationDate

    const [updatedConfiguration] = await db
      .update(pumpConfigurations)
      .set(updateData)
      .where(eq(pumpConfigurations.id, pumpId))
      .returning()

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: updatedConfiguration
    }
  } catch (error) {
    console.error("Error updating pump configuration:", error)
    return {
      isSuccess: false,
      error: "Failed to update pump configuration"
    }
  }
}

/**
 * Update pump status (active, maintenance, calibration, repair)
 */
export async function updatePumpStatus(
  pumpId: string,
  data: {
    status: "active" | "maintenance" | "calibration" | "repair"
    notes?: string
  }
): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Validate input data
    const validationResult =
      pumpConfigurationSchemas.statusUpdate.safeParse(data)
    if (!validationResult.success) {
      return {
        isSuccess: false,
        error: "Invalid status update data"
      }
    }

    // Check if pump exists
    const [existingPump] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, pumpId))

    if (!existingPump) {
      return {
        isSuccess: false,
        error: "Pump configuration not found"
      }
    }

    const [updatedConfiguration] = await db
      .update(pumpConfigurations)
      .set({
        status: data.status,
        isActive: data.status === "active",
        updatedAt: new Date()
      })
      .where(eq(pumpConfigurations.id, pumpId))
      .returning()

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true,
      data: updatedConfiguration
    }
  } catch (error) {
    console.error("Error updating pump status:", error)
    return {
      isSuccess: false,
      error: "Failed to update pump status"
    }
  }
}

/**
 * Get active pump configurations for a station (status = active)
 */
export async function getActivePumpConfigurations(stationId: string): Promise<{
  isSuccess: boolean
  data?: SelectPumpConfiguration[]
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    const configurations = await db
      .select()
      .from(pumpConfigurations)
      .where(
        and(
          eq(pumpConfigurations.stationId, stationId),
          eq(pumpConfigurations.status, "active")
        )
      )
      .orderBy(pumpConfigurations.pumpNumber)

    return {
      isSuccess: true,
      data: configurations
    }
  } catch (error) {
    console.error("Error fetching active pump configurations:", error)
    return {
      isSuccess: false,
      error: "Failed to fetch active pump configurations"
    }
  }
}

/**
 * Delete a pump configuration (soft delete by setting isActive to false)
 */
export async function deletePumpConfiguration(pumpId: string): Promise<{
  isSuccess: boolean
  error?: string
}> {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/login")
    }

    // Check if pump exists
    const [existingPump] = await db
      .select()
      .from(pumpConfigurations)
      .where(eq(pumpConfigurations.id, pumpId))

    if (!existingPump) {
      return {
        isSuccess: false,
        error: "Pump configuration not found"
      }
    }

    // Soft delete by setting isActive to false
    await db
      .update(pumpConfigurations)
      .set({
        isActive: false,
        status: "repair", // Mark as repair to indicate it's not in use
        updatedAt: new Date()
      })
      .where(eq(pumpConfigurations.id, pumpId))

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/reports")

    return {
      isSuccess: true
    }
  } catch (error) {
    console.error("Error deleting pump configuration:", error)
    return {
      isSuccess: false,
      error: "Failed to delete pump configuration"
    }
  }
}
