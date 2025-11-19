import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getAuditLogs, createAuditLog } from "@/actions/audit-logs"
import { validateUserRole } from "@/actions/auth"
import { logPermissionFailure } from "@/actions/audit-logs"

const getAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  actionType: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional()
})

const createAuditLogSchema = z.object({
  actionType: z.enum([
    "user_create", "user_update", "user_deactivate", "role_assign",
    "report_generate", "report_export",
    "supplier_create", "supplier_update",
    "customer_create", "customer_update",
    "permission_check_fail"
  ]),
  resourceType: z.enum(["user", "report", "supplier", "customer", "permission"]),
  resourceId: z.string().uuid().optional(),
  details: z.record(z.string(), z.any()).default({})
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
      await logPermissionFailure("audit", "read", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Only directors can view audit logs" },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = getAuditLogsSchema.parse(queryParams)

    // Get audit logs
    const result = await getAuditLogs(validatedParams)
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error getting audit logs:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      )
    }

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
      await logPermissionFailure("audit", "create", ip, request.headers.get("user-agent") || undefined)
      return NextResponse.json(
        { error: "Only directors can create audit logs" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAuditLogSchema.parse(body)

    // Add IP and user agent from request
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const auditLogData = {
      ...validatedData,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined
    }

    // Create audit log
    const result = await createAuditLog(auditLogData)
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error creating audit log:", error)
    
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
