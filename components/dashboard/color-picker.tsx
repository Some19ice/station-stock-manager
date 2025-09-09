"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
]

export function ColorPicker({ value = "#3B82F6", onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(value)

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    onChange?.(color)
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Primary Color
      </Label>
      
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-12 h-8 rounded border border-border cursor-pointer"
        />
        <span className="text-sm text-muted-foreground font-mono">
          {selectedColor}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <Button
            key={color}
            variant="outline"
            size="sm"
            className="h-8 p-0 border-2"
            style={{ 
              backgroundColor: color,
              borderColor: selectedColor === color ? color : "transparent"
            }}
            onClick={() => handleColorChange(color)}
            aria-label={`Select color ${color}`}
          >
            <span className="sr-only">{color}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
