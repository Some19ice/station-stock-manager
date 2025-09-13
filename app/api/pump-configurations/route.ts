import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import {
  getPumpConfigurations,
  createPumpConfiguration
} from "@/actions/pump-configurations"

/**
 * GET /api/pump-configurations
 * Get pump configurations for a station
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { isSuccess: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const stationId = searchParams.get("stationId")

    if (!stationId) {
      return NextResponse.json(
        { isSuccess: false, error: "stationId parameter is required" },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(stationId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid stationId format" },
        { status: 400 }
      )
    }

    const result = await getPumpConfigurations(stationId)

    if (!result.isSuccess) {
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
    console.error("Error in GET /api/pump-configurations:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pump-configurations
 * Create a new pump configuration
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { isSuccess: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "stationId",
      "pumpNumber",
      "pmsProductId",
      "meterCapacity",
      "installDate"
    ]
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: `Missing required fields: ${missingFields.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Validate meterCapacity is positive
    if (body.meterCapacity <= 0) {
      return NextResponse.json(
        { isSuccess: false, error: "Meter capacity must be positive" },
        { status: 400 }
      )
    }

    const result = await createPumpConfiguration({
      stationId: body.stationId,
      pmsProductId: body.pmsProductId,
      pumpNumber: body.pumpNumber,
      meterCapacity: body.meterCapacity,
      installDate: body.installDate
    })

    if (!result.isSuccess) {
      return NextResponse.json(
        { isSuccess: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        isSuccess: true,
        data: result.data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/pump-configurations:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
