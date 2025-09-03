"use client"

import { useEffect, useRef, useState } from "react"

interface CustomCursorProps {
  className?: string
  disabled?: boolean
  size?: number
}

export function CustomCursor({
  className = "",
  disabled = false,
  size = 20
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || disabled || typeof window === "undefined") return

    const cursor = cursorRef.current
    if (!cursor) return

    if (window.innerWidth >= 1024) {
      document.body.style.cursor = "none"
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      cursor.style.left = e.clientX + "px"
      cursor.style.top = e.clientY + "px"
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleInteractiveEnter = () => setIsHovering(true)
    const handleInteractiveLeave = () => setIsHovering(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)

    const interactiveElements = document.querySelectorAll(
      "button, a, input, textarea, select, [data-cursor]"
    )

    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", handleInteractiveEnter)
      el.addEventListener("mouseleave", handleInteractiveLeave)
    })

    return () => {
      document.body.style.cursor = "auto"
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)

      interactiveElements.forEach(el => {
        el.removeEventListener("mouseenter", handleInteractiveEnter)
        el.removeEventListener("mouseleave", handleInteractiveLeave)
      })
    }
  }, [mounted, disabled, isHovering])

  if (!mounted || disabled) return null

  return (
    <div
      ref={cursorRef}
      className={`pointer-events-none fixed z-[9999] transition-all duration-200 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isHovering ? "scale-150" : "scale-100"} ${className}`}
      style={{
        transform: "translate(-50%, -50%)",
        width: size,
        height: size
      }}
    >
      <div className="border-foreground/40 bg-foreground/10 h-full w-full rounded-full border backdrop-blur-sm" />
      <div className="bg-foreground absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  )
}
