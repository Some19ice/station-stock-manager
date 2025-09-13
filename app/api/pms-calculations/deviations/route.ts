import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getCalculationsWithDeviations } from "@/actions/pms-calculations"

/**
 * GET /api/pms-calculations/deviations
 * Get calculations with significant deviations from average
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
    const thresholdPercent = searchParams.get("thresholdPercent")
    const days = searchParams.get("days")

    // Validate required stationId parameter
    if (!stationId) {
      return NextResponse.json(
        { isSuccess: false, error: "stationId parameter is required" },
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

    // Validate and parse optional parameters
    let thresholdValue: number | undefined
    let daysValue: number | undefined

    if (thresholdPercent) {
      thresholdValue = parseFloat(thresholdPercent)
      if (isNaN(thresholdValue) || thresholdValue <= 0) {
        return NextResponse.json(
          {
            isSuccess: false,
            error: "thresholdPercent must be a positive number"
          },
          { status: 400 }
        )
      }
    }

    if (days) {
      daysValue = parseInt(days, 10)
      if (isNaN(daysValue) || daysValue <= 0) {
        return NextResponse.json(
          { isSuccess: false, error: "days must be a positive integer" },
          { status: 400 }
        )
      }
    }

    const result = await getCalculationsWithDeviations({
      stationId,
      thresholdPercent: thresholdValue,
      days: daysValue
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
    console.error("Error in GET /api/pms-calculations/deviations:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
