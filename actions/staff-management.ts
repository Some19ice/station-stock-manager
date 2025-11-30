"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { getCurrentUserProfile } from "./auth"

const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["staff", "manager"], {
    required_error: "Please select a role"
  }),
  isActive: z.boolean().default(true),
  canManageInventory: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
  canManageUsers: z.boolean().default(false)
})

export async function createStaffMember(data: z.infer<typeof staffSchema>) {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const validation = staffSchema.safeParse(data)
    if (!validation.success) {
      return { isSuccess: false, error: validation.error.errors[0].message }
    }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    // Check if current user is manager
    if (profileResult.data.user.role !== "manager") {
      return { isSuccess: false, error: "Only managers can add staff members" }
    }

    const stationId = profileResult.data.station.id

    // For now, we'll create a placeholder entry since Clerk integration would be needed
    // In a real implementation, you'd create the Clerk user first, then the database record
    const username = `${validation.data.firstName.toLowerCase()}.${validation.data.lastName.toLowerCase()}`
    
    const [newStaff] = await db
      .insert(users)
      .values({
        stationId,
        clerkUserId: `temp_${Date.now()}`, // Temporary - would be from Clerk
        username,
        role: validation.data.role,
        isActive: validation.data.isActive
      })
      .returning()

    return { isSuccess: true, data: newStaff }
  } catch (error) {
    console.error("Error creating staff member:", error)
    return { isSuccess: false, error: "Failed to create staff member" }
  }
}

export async function getStaffMembers() {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    const stationId = profileResult.data.station.id

    const staffMembers = await db
      .select()
      .from(users)
      .where(eq(users.stationId, stationId))

    return { isSuccess: true, data: staffMembers }
  } catch (error) {
    console.error("Error fetching staff members:", error)
    return { isSuccess: false, error: "Failed to fetch staff members" }
  }
}

export async function updateStaffMember(id: string, data: Partial<z.infer<typeof staffSchema>>) {
  try {
    const { userId } = await auth()
    if (!userId) return { isSuccess: false, error: "Unauthorized" }

    const profileResult = await getCurrentUserProfile()
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, error: "User profile not found" }
    }

    // Check if current user is manager
    if (profileResult.data.user.role !== "manager") {
      return { isSuccess: false, error: "Only managers can update staff members" }
    }

    const stationId = profileResult.data.station.id

    const [updatedStaff] = await db
      .update(users)
      .set({ 
        role: data.role,
        isActive: data.isActive,
        updatedAt: new Date() 
      })
      .where(and(eq(users.id, id), eq(users.stationId, stationId)))
      .returning()

    if (!updatedStaff) {
      return { isSuccess: false, error: "Staff member not found" }
    }

    return { isSuccess: true, data: updatedStaff }
  } catch (error) {
    console.error("Error updating staff member:", error)
    return { isSuccess: false, error: "Failed to update staff member" }
  }
}
