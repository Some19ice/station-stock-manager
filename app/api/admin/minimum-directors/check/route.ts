import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { checkMinimumDirectorPolicy, validateUserRole } from "@/actions/auth"
import { logPermissionFailure } from "@/actions/audit-logs"

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
      await logPermissionFailure("permission", "check", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Only directors can check minimum director policy" },
        { status: 403 }
      )
    }

    // Check minimum director policy
    const result = await checkMinimumDirectorPolicy()
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error checking minimum director policy:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
