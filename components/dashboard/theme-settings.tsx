"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "./theme-switcher"
import { ColorPicker } from "./color-picker"
import { getThemeSettings, updateThemeSettings } from "@/actions/theme"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Settings, Save, RotateCcw } from "lucide-react"
import type { ThemeSettings as ThemeSettingsType } from "@/db/schema/theme"

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadThemeSettings = async () => {
    try {
      const themeSettings = await getThemeSettings()

      // Defensive programming: ensure themeSettings is valid
      if (!themeSettings || typeof themeSettings !== "object") {
        throw new Error("Invalid theme settings received")
      }

      // Validate required properties with fallbacks
      const validSettings = {
        mode:
          themeSettings.mode === "dark"
            ? ("dark" as const)
            : ("light" as const),
        primaryColor:
          typeof themeSettings.primaryColor === "string" &&
          themeSettings.primaryColor.length > 0
            ? themeSettings.primaryColor
            : "#3B82F6"
      }

      setSettings(validSettings)
      setOriginalSettings(validSettings)

      // Apply the theme immediately
      setTheme(validSettings.mode)
      applyPrimaryColor(validSettings.primaryColor)
    } catch (error) {
      console.error("Failed to load theme settings:", error)
      toast.error("Failed to load theme settings")

      // Use default settings as fallback
      const defaultSettings = {
        mode: "light" as const,
        primaryColor: "#3B82F6"
      }
      setSettings(defaultSettings)
      setOriginalSettings(defaultSettings)
      setTheme(defaultSettings.mode)
      applyPrimaryColor(defaultSettings.primaryColor)
    } finally {
      setLoading(false)
    }
  }

  const applyPrimaryColor = (color: string) => {
    // Apply the primary color to CSS custom properties
    document.documentElement.style.setProperty('--primary', color)
  }

  const handleModeChange = (mode: "light" | "dark") => {
    setSettings(prev => ({ ...prev, mode }))
    setTheme(mode)
  }

  const handleColorChange = (primaryColor: string) => {
    setSettings(prev => ({ ...prev, primaryColor }))
    applyPrimaryColor(primaryColor)
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
    applyPrimaryColor(originalSettings.primaryColor)
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
            <Settings className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Loading theme settings...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of your station interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ThemeSwitcher 
          value={settings.mode}
          onChange={handleModeChange}
        />
        
        <ColorPicker 
          value={settings.primaryColor}
          onChange={handleColorChange}
        />

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
