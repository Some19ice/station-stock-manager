"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

interface CursorWrapperProps {
  size?: number
  magneticStrength?: number
  blendMode?: string
  className?: string
  disabled?: boolean
}

const CustomCursor = dynamic(
  () => import("./custom-cursor").then(mod => ({ default: mod.CustomCursor })),
  {
    ssr: false,
    loading: () => null
  }
)

export function CursorWrapper({
  size = 24,
  magneticStrength = 0.3,
  blendMode = "difference",
  className = "",
  disabled = false
}: CursorWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <CustomCursor
      size={size}
      magneticStrength={magneticStrength}
      blendMode={blendMode}
      className={className}
      disabled={disabled}
    />
  )
}
