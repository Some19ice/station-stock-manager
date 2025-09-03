"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

interface CursorWrapperProps {
  size?: number
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
  size = 20,
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

  return <CustomCursor size={size} className={className} disabled={disabled} />
}
