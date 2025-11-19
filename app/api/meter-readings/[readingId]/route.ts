import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { updateMeterReading } from "@/actions/meter-readings"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

interface RouteContext {
  params: Promise<{
    readingId: string
  }>
}

/**
 * PUT /api/meter-readings/[readingId]
 * Update a meter reading (within time window or with manager override)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { readingId } = await params
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { isSuccess: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(readingId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid readingId format" },
        { status: 400 }
      )
    }

    // Validate required meterValue
    if (body.meterValue === undefined) {
      return NextResponse.json(
        { isSuccess: false, error: "meterValue is required" },
        { status: 400 }
      )
    }

    // Validate meterValue is non-negative number
    if (typeof body.meterValue !== "number" || body.meterValue < 0) {
      return NextResponse.json(
        { isSuccess: false, error: "meterValue must be a non-negative number" },
        { status: 400 }
      )
    }

    // Check for manager override headers
    const managerOverride = request.headers.get("X-Manager-Override")
    const managerId = request.headers.get("X-Manager-Id")

    let managerOverrideData: { isManager: boolean; managerId: string; reason: string } | undefined = undefined

    if (managerOverride === "true" && managerId) {
      // Validate manager ID is UUID
      if (!uuidRegex.test(managerId)) {
        return NextResponse.json(
          { isSuccess: false, error: "Invalid manager ID format" },
          { status: 400 }
        )
      }

      if (!body.overrideReason) {
        return NextResponse.json(
          {
            isSuccess: false,
            error: "Override reason is required for manager override"
          },
          { status: 400 }
        )
      }

      // Validate that managerId has manager role
      const [manager] = await db
        .select()
        .from(users)
        .where(eq(users.id, managerId))

      if (!manager) {
        return NextResponse.json(
          { isSuccess: false, error: "Manager not found" },
          { status: 404 }
        )
      }

      if (manager.role !== "manager") {
        return NextResponse.json(
          { isSuccess: false, error: "Only managers can override modification window" },
          { status: 403 }
        )
      }

      managerOverrideData = {
        isManager: true,
        managerId: managerId,
        reason: body.overrideReason
      }
    }

    const result = await updateMeterReading(
      readingId,
      {
        meterValue: body.meterValue,
        notes: body.notes
      },
      managerOverrideData
    )

    if (!result.isSuccess) {
      if (result.error === "Meter reading not found") {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 404 }
        )
      }
      if (result.error?.includes("Modification window expired")) {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { isSuccess: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      isSuccess: true,
      data: result.data
    })
  } catch (error) {
    console.error("Error in PUT /api/meter-readings/[readingId]:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
