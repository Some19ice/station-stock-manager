import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getMeterReadings, recordMeterReading } from "@/actions/meter-readings"

/**
 * GET /api/meter-readings
 * Get meter readings for a date range
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const pumpId = searchParams.get("pumpId")

    // Validate required parameters
    if (!stationId || !startDate || !endDate) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: "stationId, startDate, and endDate parameters are required"
        },
        { status: 400 }
      )
    }

    // Validate UUID format for stationId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(stationId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid stationId format" },
        { status: 400 }
      )
    }

    // Validate pumpId if provided
    if (pumpId && !uuidRegex.test(pumpId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid pumpId format" },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { isSuccess: false, error: "Dates must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    const result = await getMeterReadings({
      stationId,
      startDate,
      endDate,
      pumpId: pumpId || undefined
    })

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
    console.error("Error in GET /api/meter-readings:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/meter-readings
 * Record a meter reading
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
      "pumpId",
      "readingDate",
      "readingType",
      "meterValue"
    ]
    const missingFields = requiredFields.filter(
      field => body[field] === undefined
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: `Missing required fields: ${missingFields.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Validate UUID format for pumpId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.pumpId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid pumpId format" },
        { status: 400 }
      )
    }

    // Validate readingType enum
    if (!["opening", "closing"].includes(body.readingType)) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: "readingType must be 'opening' or 'closing'"
        },
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

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.readingDate)) {
      return NextResponse.json(
        { isSuccess: false, error: "readingDate must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    // Validate estimationMethod if provided
    if (
      body.estimationMethod &&
      !["transaction_based", "historical_average", "manual"].includes(
        body.estimationMethod
      )
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          error:
            "estimationMethod must be 'transaction_based', 'historical_average', or 'manual'"
        },
        { status: 400 }
      )
    }

    const result = await recordMeterReading({
      pumpId: body.pumpId,
      readingDate: body.readingDate,
      readingType: body.readingType,
      meterValue: body.meterValue,
      notes: body.notes,
      isEstimated: body.isEstimated,
      estimationMethod: body.estimationMethod
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
    console.error("Error in POST /api/meter-readings:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
