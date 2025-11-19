import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { assignUserRole, getUserRole } from "@/actions/auth"
import { logPermissionFailure } from "@/actions/audit-logs"

const updateRoleSchema = z.object({
  role: z.enum(["staff", "manager", "director"])
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get current user role for permission check
    const currentUserRole = await getUserRole()
    if (!currentUserRole.isSuccess || !currentUserRole.data) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      await logPermissionFailure("user", "read", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    // Get target user role
    const targetUserRole = await getUserRole(userId)
    if (!targetUserRole.isSuccess || !targetUserRole.data) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user permissions based on role
    const { getRolePermissions } = await import("@/lib/role-permissions")
    const permissions = getRolePermissions(targetUserRole.data)

    return NextResponse.json({
      userId: userId,
      role: targetUserRole.data,
      permissions
    })
  } catch (error) {
    console.error("Error getting user role:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)

    // Assign the role using server action
    const result = await assignUserRole({
      userId: userId,
      newRole: validatedData.role
    })

    if (!result.isSuccess || !result.data) {
      const statusCode = result.error?.includes("minimum") ? 409 : 
                        result.error?.includes("permission") ? 403 : 400
      
      if (statusCode === 403) {
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
        await logPermissionFailure("user", "role_assign", ip, request.headers.get("user-agent") || undefined)
      }
      
      return NextResponse.json(
        { error: result.error || "Operation failed" },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      id: result.data.id,
      role: result.data.role,
      updatedAt: result.data.updatedAt
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid role value" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
