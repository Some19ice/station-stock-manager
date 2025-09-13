import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDailyReadingStatus } from "@/actions/meter-readings"

/**
 * GET /api/meter-readings/daily-status
 * Get daily reading status for a station showing which pumps have readings recorded
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
    const date = searchParams.get("date")

    // Validate required parameters
    if (!stationId || !date) {
      return NextResponse.json(
        {
          isSuccess: false,
          error: "stationId and date parameters are required"
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
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { isSuccess: false, error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    const result = await getDailyReadingStatus(stationId, date)

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
    console.error("Error in GET /api/meter-readings/daily-status:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
