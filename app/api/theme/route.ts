import { NextRequest, NextResponse } from "next/server"
import { getThemeSettings, updateThemeSettings } from "@/actions/theme"
import type { ThemeSettings } from "@/db/schema/theme"

export async function GET() {
  try {
    const settings = await getThemeSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching theme settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch theme settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, primaryColor } = body as ThemeSettings

    if (!mode || !primaryColor) {
      return NextResponse.json(
        { error: "Missing required fields: mode and primaryColor" },
        { status: 400 }
      )
    }

    const updatedSettings = await updateThemeSettings({ mode, primaryColor })
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating theme settings:", error)
    return NextResponse.json(
      { error: "Failed to update theme settings" },
      { status: 500 }
    )
  }
}
