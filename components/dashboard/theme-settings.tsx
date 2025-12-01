"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "./theme-switcher"
import { ColorPicker } from "./color-picker"
import { getThemeSettings, updateThemeSettings } from "@/actions/theme"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Palette, Save, RotateCcw } from "lucide-react"
import type { ThemeSettings as ThemeSettingsType } from "@/db/schema/theme"

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

// Check if color is light or dark
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return true
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

function applyThemeColor(hex: string) {
  const root = document.documentElement
  
  // Apply primary color directly as hex - browsers handle conversion
  root.style.setProperty("--primary", hex)
  root.style.setProperty("--ring", hex)
  root.style.setProperty("--sidebar-primary", hex)
  root.style.setProperty("--sidebar-ring", hex)
  
  // Set foreground based on primary color brightness
  const foreground = isLightColor(hex) ? "#000000" : "#ffffff"
  root.style.setProperty("--primary-foreground", foreground)
  root.style.setProperty("--sidebar-primary-foreground", foreground)
}

export function ThemeSettings() {
  const { setTheme } = useTheme()
  const [settings, setSettings] = useState<ThemeSettingsType>({
    mode: "light",
    primaryColor: "#3B82F6"
  })
  const [originalSettings, setOriginalSettings] = useState<ThemeSettingsType>({
    mode: "light",
    primaryColor: "#3B82F6"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadThemeSettings()
  }, [])

  const loadThemeSettings = async () => {
    try {
      const themeSettings = await getThemeSettings()

      if (!themeSettings || typeof themeSettings !== "object") {
        throw new Error("Invalid theme settings received")
      }

      const validSettings = {
        mode:
          themeSettings.mode === "dark" ? ("dark" as const) : ("light" as const),
        primaryColor:
          typeof themeSettings.primaryColor === "string" &&
          themeSettings.primaryColor.length > 0
            ? themeSettings.primaryColor
            : "#3B82F6"
      }

      setSettings(validSettings)
      setOriginalSettings(validSettings)
      setTheme(validSettings.mode)
      applyThemeColor(validSettings.primaryColor)
    } catch (error) {
      console.error("Failed to load theme settings:", error)

      const defaultSettings = {
        mode: "light" as const,
        primaryColor: "#3B82F6"
      }
      setSettings(defaultSettings)
      setOriginalSettings(defaultSettings)
      setTheme(defaultSettings.mode)
      applyThemeColor(defaultSettings.primaryColor)
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (mode: "light" | "dark") => {
    setSettings(prev => ({ ...prev, mode }))
    setTheme(mode)
  }

  const handleColorChange = (primaryColor: string) => {
    setSettings(prev => ({ ...prev, primaryColor }))
    applyThemeColor(primaryColor)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateThemeSettings(settings)
      setOriginalSettings(settings)
      toast.success("Theme settings saved successfully")
    } catch (error) {
      console.error("Failed to save theme settings:", error)
      toast.error("Failed to save theme settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setTheme(originalSettings.mode)
    applyThemeColor(originalSettings.primaryColor)
    toast.info("Theme settings reset")
  }

  const hasChanges =
    settings.mode !== originalSettings.mode ||
    settings.primaryColor !== originalSettings.primaryColor

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>Loading theme settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 rounded-lg bg-muted"></div>
            <div className="h-24 rounded-lg bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance of your station interface
            </CardDescription>
          </div>
          {hasChanges && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Unsaved changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Appearance</label>
          <ThemeSwitcher value={settings.mode} onChange={handleModeChange} />
        </div>

        <Separator />

        {/* Color Picker */}
        <ColorPicker value={settings.primaryColor} onChange={handleColorChange} />

        <Separator />

        {/* Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Preview</label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" style={{ backgroundColor: settings.primaryColor, color: isLightColor(settings.primaryColor) ? "#000" : "#fff" }}>
              Primary
            </Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Badge style={{ backgroundColor: settings.primaryColor, color: isLightColor(settings.primaryColor) ? "#000" : "#fff" }}>
              Badge
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1"
            style={{ 
              backgroundColor: settings.primaryColor, 
              color: isLightColor(settings.primaryColor) ? "#000" : "#fff" 
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
