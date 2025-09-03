import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { like } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find the pending user record
    const pendingUser = await db.query.users.findFirst({
      where: like(users.clerkUserId, `temp_%_${email}`)
    })

    if (!pendingUser) {
      return NextResponse.json(
        { error: "No pending invitation found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      username: pendingUser.username,
      role: pendingUser.role,
      stationId: pendingUser.stationId
    })
  } catch (error) {
    console.error("Error fetching pending user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
