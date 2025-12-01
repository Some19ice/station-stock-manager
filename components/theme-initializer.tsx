"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { getThemeSettings } from "@/actions/theme"

// Check if color is light or dark
function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return true
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

function applyThemeColor(hex: string) {
  const root = document.documentElement
  
  root.style.setProperty("--primary", hex)
  root.style.setProperty("--ring", hex)
  root.style.setProperty("--sidebar-primary", hex)
  root.style.setProperty("--sidebar-ring", hex)
  
  const foreground = isLightColor(hex) ? "#000000" : "#ffffff"
  root.style.setProperty("--primary-foreground", foreground)
  root.style.setProperty("--sidebar-primary-foreground", foreground)
}

export function ThemeInitializer() {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    const loadTheme = async () => {
      try {
        const settings = await getThemeSettings()
        if (settings?.primaryColor) {
          applyThemeColor(settings.primaryColor)
        }
      } catch (error) {
        // Silently fail - use default theme
        console.debug("Theme not loaded:", error)
      }
    }

    loadTheme()
  }, [isSignedIn])

  return null
}
