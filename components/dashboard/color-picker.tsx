"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
}

const PRESET_COLORS = [
  { color: "#3B82F6", name: "Blue" },
  { color: "#10B981", name: "Emerald" },
  { color: "#8B5CF6", name: "Violet" },
  { color: "#F59E0B", name: "Amber" },
  { color: "#EF4444", name: "Red" },
  { color: "#EC4899", name: "Pink" },
  { color: "#06B6D4", name: "Cyan" },
  { color: "#F97316", name: "Orange" },
  { color: "#84CC16", name: "Lime" },
  { color: "#6366F1", name: "Indigo" },
  { color: "#14B8A6", name: "Teal" },
  { color: "#A855F7", name: "Purple" }
]

export function ColorPicker({ value = "#3B82F6", onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(value)
  const [customColor, setCustomColor] = useState(value)

  useEffect(() => {
    setSelectedColor(value)
    setCustomColor(value)
  }, [value])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setCustomColor(color)
    onChange?.(color)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setSelectedColor(color)
      onChange?.(color)
    }
  }

  const isPresetSelected = PRESET_COLORS.some(p => p.color === selectedColor)

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Palette className="h-4 w-4" />
        Primary Color
      </Label>

      {/* Preset Colors Grid */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map(preset => {
          const isSelected = selectedColor === preset.color
          return (
            <button
              key={preset.color}
              onClick={() => handleColorChange(preset.color)}
              className={cn(
                "group relative flex h-10 w-full items-center justify-center rounded-lg transition-all",
                isSelected
                  ? "ring-2 ring-offset-2 ring-primary"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            >
              {isSelected && (
                <Check className="h-5 w-5 text-white drop-shadow-md" />
              )}
            </button>
          )
        })}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={customColor}
            onChange={e => handleColorChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border-2 border-border"
          />
        </div>
        <div className="flex-1">
          <Input
            value={customColor}
            onChange={e => handleCustomColorChange(e.target.value)}
            placeholder="#3B82F6"
            className="font-mono text-sm"
          />
        </div>
        {!isPresetSelected && (
          <span className="text-xs text-muted-foreground">Custom</span>
        )}
      </div>

      {/* Current Color Preview */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: selectedColor }}
        />
        <div>
          <p className="text-sm font-medium">
            {PRESET_COLORS.find(p => p.color === selectedColor)?.name || "Custom Color"}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{selectedColor}</p>
        </div>
      </div>
    </div>
  )
}
