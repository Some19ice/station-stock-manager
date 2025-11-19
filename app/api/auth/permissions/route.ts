import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserRole } from "@/actions/auth"
import { getRolePermissions } from "@/lib/role-permissions"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get user role
    const roleResult = await getUserRole()
    if (!roleResult.isSuccess || !roleResult.data) {
      return NextResponse.json(
        { error: "Failed to get user role" },
        { status: 400 }
      )
    }

    const role = roleResult.data
    const permissions = getRolePermissions(role)

    return NextResponse.json({
      userId,
      role,
      permissions
    })
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
