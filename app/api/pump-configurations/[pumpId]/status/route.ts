import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { updatePumpStatus } from "@/actions/pump-configurations"

interface RouteContext {
  params: Promise<{
    pumpId: string
  }>
}

/**
 * PATCH /api/pump-configurations/[pumpId]/status
 * Update pump status (active, maintenance, calibration, repair)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { isSuccess: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { pumpId } = await params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(pumpId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid pumpId format" },
        { status: 400 }
      )
    }

    // Validate required status field
    if (!body.status) {
      return NextResponse.json(
        { isSuccess: false, error: "Status field is required" },
        { status: 400 }
      )
    }

    // Validate status enum values
    const validStatuses = ["active", "maintenance", "calibration", "repair"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        },
        { status: 400 }
      )
    }

    const result = await updatePumpStatus(pumpId, {
      status: body.status,
      notes: body.notes
    })

    if (!result.isSuccess) {
      if (result.error === "Pump configuration not found") {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 404 }
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
    console.error(
      "Error in PATCH /api/pump-configurations/[pumpId]/status:",
      error
    )
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
