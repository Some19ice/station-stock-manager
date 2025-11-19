import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getAllUsers, createStationUser, validateUserRole } from "@/actions/auth"
import { logPermissionFailure } from "@/actions/audit-logs"

const createUserSchema = z.object({
  stationId: z.string().uuid(),
  username: z.string().min(3).max(50),
  role: z.enum(["staff", "manager", "director"]),
  email: z.string().email(),
  sendInvitation: z.boolean().optional().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is a director
    const roleCheck = await validateUserRole("director")
    if (!roleCheck.isSuccess) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      await logPermissionFailure("user", "read", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Only directors can view all users" },
        { status: 403 }
      )
    }

    // Get all users
    const result = await getAllUsers()
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error getting all users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is a director
    const roleCheck = await validateUserRole("director")
    if (!roleCheck.isSuccess) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      await logPermissionFailure("user", "create", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Only directors can create users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Create user
    const result = await createStationUser(validatedData)
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
