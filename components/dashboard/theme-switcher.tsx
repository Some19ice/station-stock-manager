"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeSwitcherProps {
  value?: "light" | "dark"
  onChange?: (mode: "light" | "dark") => void
}

export function ThemeSwitcher({ value = "light", onChange }: ThemeSwitcherProps) {
  const options = [
    { mode: "light" as const, icon: Sun, label: "Light" },
    { mode: "dark" as const, icon: Moon, label: "Dark" }
  ]

  return (
    <div className="flex gap-2">
      {options.map(option => {
        const isSelected = value === option.mode
        return (
          <button
            key={option.mode}
            onClick={() => onChange?.(option.mode)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/50 hover:bg-muted"
            )}
          >
            <option.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
