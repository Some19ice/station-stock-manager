"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { themeSettings, type ThemeSettings } from "@/db/schema/theme"
import { eq } from "drizzle-orm"
import { getCurrentUserProfile } from "./auth"

export async function getThemeSettings(): Promise<ThemeSettings> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const userProfileResponse = await getCurrentUserProfile()
  if (!userProfileResponse.isSuccess || !userProfileResponse.data?.user.stationId) {
    throw new Error("No station associated with user")
  }

  const result = await db
    .select()
    .from(themeSettings)
    .where(eq(themeSettings.stationId, userProfileResponse.data.user.stationId))
    .limit(1)

  if (result.length === 0) {
    // Return default theme if no settings found
    return {
      mode: "light",
      primaryColor: "#3B82F6"
    }
  }

  return result[0].settings
}

export async function updateThemeSettings(settings: ThemeSettings): Promise<ThemeSettings> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const userProfileResponse = await getCurrentUserProfile()
  if (!userProfileResponse.isSuccess || !userProfileResponse.data?.user.stationId) {
    throw new Error("No station associated with user")
  }

  // Check if user is a manager
  if (userProfileResponse.data.user.role !== "manager") {
    throw new Error("Only managers can update theme settings")
  }

  // Validate settings
  if (!settings.mode || !settings.primaryColor) {
    throw new Error("Invalid theme settings")
  }

  if (!["light", "dark"].includes(settings.mode)) {
    throw new Error("Invalid theme mode")
  }

  // Check if settings exist for this station
  const existing = await db
    .select()
    .from(themeSettings)
    .where(eq(themeSettings.stationId, userProfileResponse.data.user.stationId))
    .limit(1)

  if (existing.length === 0) {
    // Create new settings
    await db.insert(themeSettings).values({
      stationId: userProfileResponse.data.user.stationId,
      settings
    })
  } else {
    // Update existing settings
    await db
      .update(themeSettings)
      .set({ settings })
      .where(eq(themeSettings.stationId, userProfileResponse.data.user.stationId))
  }

  return settings
}
