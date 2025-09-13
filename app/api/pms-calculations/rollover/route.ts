import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { confirmRollover } from "@/actions/pms-calculations"

/**
 * POST /api/pms-calculations/rollover
 * Handle manual rollover confirmation
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
      "calculationDate",
      "rolloverValue",
      "newReading"
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

    // Validate rolloverValue is positive number
    if (typeof body.rolloverValue !== "number" || body.rolloverValue <= 0) {
      return NextResponse.json(
        { isSuccess: false, error: "rolloverValue must be a positive number" },
        { status: 400 }
      )
    }

    // Validate newReading is non-negative number
    if (typeof body.newReading !== "number" || body.newReading < 0) {
      return NextResponse.json(
        { isSuccess: false, error: "newReading must be a non-negative number" },
        { status: 400 }
      )
    }

    const result = await confirmRollover({
      pumpId: body.pumpId,
      calculationDate: body.calculationDate,
      rolloverValue: body.rolloverValue,
      newReading: body.newReading
    })

    if (!result.isSuccess) {
      if (
        result.error === "Calculation not found" ||
        result.error === "Pump not found"
      ) {
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
    console.error("Error in POST /api/pms-calculations/rollover:", error)
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
