import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import {
  getPmsCalculations,
  calculatePmsForDate
} from "@/actions/pms-calculations"

/**
 * GET /api/pms-calculations
 * Get PMS calculations for a date range
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

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { isSuccess: false, error: "Dates must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    const result = await getPmsCalculations({
      stationId,
      startDate,
      endDate
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
    console.error("Error in GET /api/pms-calculations:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pms-calculations
 * Calculate PMS sales for a specific date
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
    const requiredFields = ["stationId", "calculationDate"]
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

    // Validate UUID format for stationId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.stationId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid stationId format" },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.calculationDate)) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: "calculationDate must be in YYYY-MM-DD format"
        },
        { status: 400 }
      )
    }

    const result = await calculatePmsForDate({
      stationId: body.stationId,
      calculationDate: body.calculationDate,
      forceRecalculate: body.forceRecalculate || false
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
    console.error("Error in POST /api/pms-calculations:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
