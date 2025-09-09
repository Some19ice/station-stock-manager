"use client"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Moon, Sun } from "lucide-react"

interface ThemeSwitcherProps {
  value?: "light" | "dark"
  onChange?: (mode: "light" | "dark") => void
}

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  
  const currentTheme = value || theme
  const isDark = currentTheme === "dark"

  const handleToggle = (checked: boolean) => {
    const newMode = checked ? "dark" : "light"
    if (onChange) {
      onChange(newMode)
    } else {
      setTheme(newMode)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Sun className="h-4 w-4" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4" />
      <Label htmlFor="theme-switch" className="text-sm font-medium">
        {isDark ? "Dark" : "Light"} Mode
      </Label>
    </div>
  )
}
