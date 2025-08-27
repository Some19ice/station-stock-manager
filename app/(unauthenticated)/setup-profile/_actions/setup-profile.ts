"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users, stations, customers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const setupProfileSchema = z.object({
  clerkUserId: z.string(),
  stationName: z.string().min(1, "Station name is required"),
  stationAddress: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(["staff", "manager"])
})

type ActionResponse<T = any> = {
  isSuccess: boolean
  data?: T
  error?: string
}

export async function setupUserProfile(
  input: z.infer<typeof setupProfileSchema>
): Promise<ActionResponse<{ user: typeof users.$inferSelect; station: typeof stations.$inferSelect }>> {
  try {
    // Validate input
    const validatedInput = setupProfileSchema.parse(input)
    
    // Verify authentication
    const { userId } = await auth()
    if (!userId || userId !== validatedInput.clerkUserId) {
      return { isSuccess: false, error: "Authentication failed" }
    }

    // Check if user already has a profile
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, validatedInput.clerkUserId)
    })

    if (existingUser) {
      return { isSuccess: false, error: "User profile already exists" }
    }

    // Check if username is already taken
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, validatedInput.username)
    })

    if (existingUsername) {
      return { isSuccess: false, error: "Username already exists" }
    }

    // Create the profile in a transaction
    const result = await db.transaction(async (tx) => {
      // First, create a customer record (required for station)
      const [customer] = await tx.insert(customers).values({
        userId: validatedInput.clerkUserId,
        membership: "free", // Default membership
        stripeCustomerId: null // Will be set up later if needed
      }).returning()

      // Create the station
      const [station] = await tx.insert(stations).values({
        customerId: customer.id,
        name: validatedInput.stationName,
        address: validatedInput.stationAddress || null
      }).returning()

      // Create the user
      const [user] = await tx.insert(users).values({
        stationId: station.id,
        clerkUserId: validatedInput.clerkUserId,
        username: validatedInput.username,
        role: validatedInput.role
      }).returning()

      return { user, station }
    })

    console.log("About to return success with result:", result)
    return { isSuccess: true, data: result }
  } catch (error) {
    console.error("Error setting up user profile:", error)

    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: error.errors[0].message }
    }

    return { isSuccess: false, error: "Failed to setup profile" }
  }
}