"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { auditLogs, users, stations } from "@/db/schema"
import { eq, and, desc, gte, lte, sql } from "drizzle-orm"
import { z } from "zod"
import { validateUserRole, getCurrentUserProfile } from "./auth"

// Input validation schemas
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
  details: z.record(z.string(), z.any()).default({}),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
})

const getAuditLogsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  actionType: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional()
})

const exportAuditLogsSchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  actionType: z.string().optional()
})

// Response type for consistent API responses
type ActionResponse<T = unknown> = {
  isSuccess: boolean
  data?: T
  error?: string
}

/**
 * Create audit log entry
 */
export async function createAuditLog(input: z.infer<typeof createAuditLogSchema>): Promise<ActionResponse<typeof auditLogs.$inferSelect>> {
  try {
    const validatedInput = createAuditLogSchema.parse(input)
    
    // Get current user profile
    const currentUserProfile = await getCurrentUserProfile()
    if (!currentUserProfile.isSuccess || !currentUserProfile.data) {
      return { isSuccess: false, error: "Authentication required" }
    }

    // Create audit log entry
    const [auditLog] = await db.insert(auditLogs).values({
      userId: currentUserProfile.data.user.id,
      actionType: validatedInput.actionType,
      resourceType: validatedInput.resourceType,
      resourceId: validatedInput.resourceId,
      details: validatedInput.details,
      ipAddress: validatedInput.ipAddress,
      userAgent: validatedInput.userAgent,
      stationId: currentUserProfile.data.user.stationId,
      createdAt: new Date()
    }).returning()

    return { isSuccess: true, data: auditLog }
  } catch (error) {
    console.error("Error creating audit log:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: `Invalid input: ${error.issues.map(e => e.message).join(", ")}` }
    }
    return { isSuccess: false, error: "Failed to create audit log" }
  }
}

/**
 * Get audit logs with pagination and filtering (Director only)
 */
export async function getAuditLogs(input: z.infer<typeof getAuditLogsSchema>): Promise<ActionResponse<{
  logs: (typeof auditLogs.$inferSelect & { user: { username: string, role: string } })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}>> {
  try {
    const validatedInput = getAuditLogsSchema.parse(input)
    
    // Check if current user is a director
    const roleCheck = await validateUserRole("director")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Only directors can view audit logs" }
    }

    // Build where conditions
    const whereConditions = []
    
    if (validatedInput.actionType) {
      whereConditions.push(eq(auditLogs.actionType, validatedInput.actionType as any))
    }
    
    if (validatedInput.resourceType) {
      whereConditions.push(eq(auditLogs.resourceType, validatedInput.resourceType as any))
    }
    
    if (validatedInput.startDate) {
      whereConditions.push(gte(auditLogs.createdAt, new Date(validatedInput.startDate)))
    }
    
    if (validatedInput.endDate) {
      whereConditions.push(lte(auditLogs.createdAt, new Date(validatedInput.endDate)))
    }
    
    if (validatedInput.userId) {
      whereConditions.push(eq(auditLogs.userId, validatedInput.userId))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause)

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / validatedInput.limit)
    const offset = (validatedInput.page - 1) * validatedInput.limit

    // Get paginated logs with user information
    const logs = await db
      .select({
        auditLog: auditLogs,
        user: {
          username: users.username,
          role: users.role
        }
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(validatedInput.limit)
      .offset(offset)

    const formattedLogs = logs.map(({ auditLog, user }) => ({
      ...auditLog,
      user
    }))

    return {
      isSuccess: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page: validatedInput.page,
          limit: validatedInput.limit,
          total,
          totalPages
        }
      }
    }
  } catch (error) {
    console.error("Error getting audit logs:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: `Invalid input: ${error.issues.map(e => e.message).join(", ")}` }
    }
    return { isSuccess: false, error: "Failed to get audit logs" }
  }
}

/**
 * Get specific audit log by ID (Director only)
 */
export async function getAuditLogById(logId: string): Promise<ActionResponse<typeof auditLogs.$inferSelect & { user: { username: string, role: string } }>> {
  try {
    // Check if current user is a director
    const roleCheck = await validateUserRole("director")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Only directors can view audit logs" }
    }

    const logResult = await db
      .select({
        auditLog: auditLogs,
        user: {
          username: users.username,
          role: users.role
        }
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, logId))
      .limit(1)

    if (logResult.length === 0) {
      return { isSuccess: false, error: "Audit log not found" }
    }

    const { auditLog, user } = logResult[0]

    return {
      isSuccess: true,
      data: {
        ...auditLog,
        user
      }
    }
  } catch (error) {
    console.error("Error getting audit log:", error)
    return { isSuccess: false, error: "Failed to get audit log" }
  }
}

/**
 * Export audit logs (Director only)
 */
export async function exportAuditLogs(input: z.infer<typeof exportAuditLogsSchema>): Promise<ActionResponse<{
  data: string
  filename: string
  contentType: string
}>> {
  try {
    const validatedInput = exportAuditLogsSchema.parse(input)
    
    // Check if current user is a director
    const roleCheck = await validateUserRole("director")
    if (!roleCheck.isSuccess) {
      return { isSuccess: false, error: "Only directors can export audit logs" }
    }

    // Build where conditions
    const whereConditions = []
    
    if (validatedInput.startDate) {
      whereConditions.push(gte(auditLogs.createdAt, new Date(validatedInput.startDate)))
    }
    
    if (validatedInput.endDate) {
      whereConditions.push(lte(auditLogs.createdAt, new Date(validatedInput.endDate)))
    }
    
    if (validatedInput.actionType) {
      whereConditions.push(eq(auditLogs.actionType, validatedInput.actionType as any))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get all matching logs
    const logs = await db
      .select({
        auditLog: auditLogs,
        user: {
          username: users.username,
          role: users.role
        }
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))

    const timestamp = new Date().toISOString().split('T')[0]
    
    if (validatedInput.format === "csv") {
      // Generate CSV
      const headers = ["Date", "User", "Role", "Action", "Resource", "Resource ID", "Details", "IP Address"]
      const csvRows = [
        headers.join(","),
        ...logs.map(({ auditLog, user }) => [
          auditLog.createdAt.toISOString(),
          user.username,
          user.role,
          auditLog.actionType,
          auditLog.resourceType,
          auditLog.resourceId || "",
          JSON.stringify(auditLog.details).replace(/"/g, '""'),
          auditLog.ipAddress || ""
        ].map(field => `"${field}"`).join(","))
      ]

      return {
        isSuccess: true,
        data: {
          data: csvRows.join("\n"),
          filename: `audit-logs-${timestamp}.csv`,
          contentType: "text/csv"
        }
      }
    } else {
      // Generate JSON
      const jsonData = logs.map(({ auditLog, user }) => ({
        ...auditLog,
        user
      }))

      return {
        isSuccess: true,
        data: {
          data: JSON.stringify(jsonData, null, 2),
          filename: `audit-logs-${timestamp}.json`,
          contentType: "application/json"
        }
      }
    }
  } catch (error) {
    console.error("Error exporting audit logs:", error)
    if (error instanceof z.ZodError) {
      return { isSuccess: false, error: `Invalid input: ${error.issues.map(e => e.message).join(", ")}` }
    }
    return { isSuccess: false, error: "Failed to export audit logs" }
  }
}

/**
 * Helper function to log user actions automatically
 */
export async function logUserAction(
  actionType: "user_create" | "user_update" | "user_deactivate" | "role_assign",
  resourceId: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await createAuditLog({
      actionType,
      resourceType: "user",
      resourceId,
      details,
      ipAddress,
      userAgent
    })
  } catch (error) {
    console.error("Error logging user action:", error)
    // Don't throw - audit logging failure shouldn't break main functionality
  }
}

/**
 * Helper function to log report actions automatically
 */
export async function logReportAction(
  actionType: "report_generate" | "report_export",
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await createAuditLog({
      actionType,
      resourceType: "report",
      details,
      ipAddress,
      userAgent
    })
  } catch (error) {
    console.error("Error logging report action:", error)
    // Don't throw - audit logging failure shouldn't break main functionality
  }
}

/**
 * Helper function to log permission check failures
 */
export async function logPermissionFailure(
  resource: string,
  action: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await createAuditLog({
      actionType: "permission_check_fail",
      resourceType: "permission",
      details: {
        resource,
        action,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent
    })
  } catch (error) {
    console.error("Error logging permission failure:", error)
    // Don't throw - audit logging failure shouldn't break main functionality
  }
}
