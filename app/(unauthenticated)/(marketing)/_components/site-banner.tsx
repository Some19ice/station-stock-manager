"use client"

import { useState } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SiteBannerProps {
  message?: string
  action?: {
    label: string
    href: string
  }
  dismissible?: boolean
  variant?: "default" | "announcement" | "warning"
}

export function SiteBanner({
  message = "🎉 New features available! Check out our latest updates.",
  action,
  dismissible = true,
  variant = "default"
}: SiteBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const variants = {
    default: "bg-primary text-primary-foreground",
    announcement: "bg-blue-600 text-white",
    warning: "bg-orange-600 text-white"
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-300",
        variants[variant],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span>{message}</span>
        {action && (
          <Button
            variant="secondary"
            size="sm"
            className="ml-2 h-7 px-3 text-xs"
            asChild
          >
            <a href={action.href}>{action.label}</a>
          </Button>
        )}
      </div>

      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 h-6 w-6 p-0 hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
