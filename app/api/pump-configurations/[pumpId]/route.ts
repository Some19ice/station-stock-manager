import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import {
  getPumpConfiguration,
  updatePumpConfiguration
} from "@/actions/pump-configurations"

interface RouteContext {
  params: {
    pumpId: string
  }
}

/**
 * GET /api/pump-configurations/[pumpId]
 * Get a specific pump configuration
 */
export async function GET(
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

    const { pumpId } = params

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(pumpId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid pumpId format" },
        { status: 400 }
      )
    }

    const result = await getPumpConfiguration(pumpId)

    if (!result.isSuccess) {
      if (result.error === "Pump configuration not found") {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { isSuccess: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isSuccess: true,
      data: result.data
    })
  } catch (error) {
    console.error("Error in GET /api/pump-configurations/[pumpId]:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pump-configurations/[pumpId]
 * Update a pump configuration
 */
export async function PUT(
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

    const { pumpId } = params
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

    // Validate meterCapacity if provided
    if (body.meterCapacity !== undefined && body.meterCapacity <= 0) {
      return NextResponse.json(
        { isSuccess: false, error: "Meter capacity must be positive" },
        { status: 400 }
      )
    }

    const result = await updatePumpConfiguration(pumpId, {
      pumpNumber: body.pumpNumber,
      meterCapacity: body.meterCapacity,
      lastCalibrationDate: body.lastCalibrationDate
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
    console.error("Error in PUT /api/pump-configurations/[pumpId]:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
