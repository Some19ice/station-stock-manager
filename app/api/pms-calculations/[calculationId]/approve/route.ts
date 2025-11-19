import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { approveEstimatedCalculation } from "@/actions/pms-calculations"

interface RouteContext {
  params: Promise<{
    calculationId: string
  }>
}

/**
 * POST /api/pms-calculations/[calculationId]/approve
 * Approve or reject an estimated calculation
 */
export async function POST(
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

    const { calculationId } = await params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(calculationId)) {
      return NextResponse.json(
        { isSuccess: false, error: "Invalid calculationId format" },
        { status: 400 }
      )
    }

    // Validate required approved field
    if (body.approved === undefined) {
      return NextResponse.json(
        { isSuccess: false, error: "approved field is required" },
        { status: 400 }
      )
    }

    // Validate approved is boolean
    if (typeof body.approved !== "boolean") {
      return NextResponse.json(
        { isSuccess: false, error: "approved field must be a boolean" },
        { status: 400 }
      )
    }

    const result = await approveEstimatedCalculation(calculationId, {
      approved: body.approved,
      notes: body.notes
    })

    if (!result.isSuccess) {
      if (result.error === "Calculation not found") {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 404 }
        )
      }
      if (result.error?.includes("estimated")) {
        return NextResponse.json(
          { isSuccess: false, error: result.error },
          { status: 400 }
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
    console.error(
      "Error in POST /api/pms-calculations/[calculationId]/approve:",
      error
    )
    return NextResponse.json(
      { isSuccess: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
