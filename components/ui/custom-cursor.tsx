"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface CustomCursorProps {
  className?: string
  disabled?: boolean
  size?: number
  theme?: "default" | "business" | "minimal"
}

type CursorState = "default" | "hover" | "click" | "drag" | "text" | "loading"

export function CustomCursor({
  className = "",
  disabled = false,
  size = 20,
  theme = "business"
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [cursorState, setCursorState] = useState<CursorState>("default")

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateCursorPosition = useCallback((x: number, y: number) => {
    if (cursorRef.current) {
      cursorRef.current.style.left = `${x}px`
      cursorRef.current.style.top = `${y}px`
    }
  }, [])

  useEffect(() => {
    if (!mounted || disabled || typeof window === "undefined") return

    // Only enable on desktop
    if (window.innerWidth < 1024) return

    // Hide default cursor
    document.body.style.cursor = "none"

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      updateCursorPosition(e.clientX, e.clientY)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleMouseDown = () => setCursorState("click")
    const handleMouseUp = () => setCursorState("hover")

    // Enhanced element detection
    const handleElementInteraction = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target || typeof target.matches !== 'function') return
      
      if (target.matches('button, [role="button"]')) {
        setCursorState(e.type === "mouseenter" ? "hover" : "default")
      } else if (target.matches('a, [href]')) {
        setCursorState(e.type === "mouseenter" ? "hover" : "default")
      } else if (target.matches('input, textarea, [contenteditable]')) {
        setCursorState(e.type === "mouseenter" ? "text" : "default")
      } else if (target.matches('[draggable="true"]')) {
        setCursorState(e.type === "mouseenter" ? "drag" : "default")
      } else if (target.matches('[data-loading]')) {
        setCursorState(e.type === "mouseenter" ? "loading" : "default")
      } else {
        setCursorState("default")
      }
    }

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    // Use event delegation for better performance
    document.addEventListener("mouseenter", handleElementInteraction, true)
    document.addEventListener("mouseleave", handleElementInteraction, true)

    return () => {
      document.body.style.cursor = "auto"
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseenter", handleElementInteraction, true)
      document.removeEventListener("mouseleave", handleElementInteraction, true)
    }
  }, [mounted, disabled, updateCursorPosition])

  if (!mounted || disabled) return null

  const getCursorStyles = () => {
    const baseStyles = "pointer-events-none fixed z-[9999] transition-transform duration-75 ease-out"
    const visibilityStyles = isVisible ? "opacity-100" : "opacity-0"
    
    switch (cursorState) {
      case "hover":
        return `${baseStyles} ${visibilityStyles} scale-125`
      case "click":
        return `${baseStyles} ${visibilityStyles} scale-90`
      default:
        return `${baseStyles} ${visibilityStyles} scale-100`
    }
  }

  const getCursorContent = () => {
    switch (theme) {
      case "business":
        return (
          <>
            <div className="h-full w-full rounded-full border border-blue-500/60 bg-blue-500/10" />
            <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600" />
          </>
        )
      case "minimal":
        return (
          <div className="h-full w-full rounded-full border border-foreground/40 bg-foreground/5" />
        )
      default:
        return (
          <>
            <div className="h-full w-full rounded-full border border-foreground/40 bg-foreground/10" />
            <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
          </>
        )
    }
  }

  return (
    <div
      ref={cursorRef}
      className={cn(getCursorStyles(), className)}
      style={{ 
        width: size, 
        height: size,
        transform: "translate(-50%, -50%)"
      }}
    >
      {getCursorContent()}
    </div>
  )
}
