import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { recordBulkMeterReadings } from "@/actions/meter-readings"

/**
 * POST /api/meter-readings/bulk
 * Record multiple meter readings at once
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
      "readingDate",
      "readingType",
      "readings"
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

    // Validate UUID format for stationId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.stationId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid stationId format" },
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

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.readingDate)) {
      return NextResponse.json(
        { isSuccess: false, error: "readingDate must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    // Validate readings array
    if (!Array.isArray(body.readings) || body.readings.length === 0) {
      return NextResponse.json(
        { isSuccess: false, error: "readings must be a non-empty array" },
        { status: 400 }
      )
    }

    // Validate each reading
    for (let i = 0; i < body.readings.length; i++) {
      const reading = body.readings[i]

      if (!reading.pumpId || !uuidRegex.test(reading.pumpId)) {
        return NextResponse.json(
          {
            isSuccess: false,
            error: `Invalid pumpId format in reading ${i + 1}`
          },
          { status: 400 }
        )
      }

      if (typeof reading.meterValue !== "number" || reading.meterValue < 0) {
        return NextResponse.json(
          { isSuccess: false, error: `Invalid meterValue in reading ${i + 1}` },
          { status: 400 }
        )
      }
    }

    const result = await recordBulkMeterReadings({
      stationId: body.stationId,
      readingDate: body.readingDate,
      readingType: body.readingType,
      readings: body.readings
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
    console.error("Error in POST /api/meter-readings/bulk:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
