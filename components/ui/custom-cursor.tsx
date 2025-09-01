"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface CustomCursorProps {
  className?: string
  disabled?: boolean
  size?: number
  magneticStrength?: number
  blendMode?: string
}

export function CustomCursor({
  className = "",
  disabled = false,
  size = 20,
  magneticStrength = 0.3,
  blendMode = "difference"
}: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorText, setCursorText] = useState("")
  const [cursorVariant, setCursorVariant] = useState<
    "default" | "hover" | "click" | "text" | "drag"
  >("default")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || disabled || typeof window === "undefined") return

    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current
    if (!cursor || !cursorDot) return

    // Hide default cursor on the body
    document.body.style.cursor = "none"

    // GSAP quickTo for smooth performance
    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.6,
      ease: "power3"
    })
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.6,
      ease: "power3"
    })

    const xDotTo = gsap.quickTo(cursorDot, "x", {
      duration: 0.1,
      ease: "power3"
    })
    const yDotTo = gsap.quickTo(cursorDot, "y", {
      duration: 0.1,
      ease: "power3"
    })

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e

      setIsVisible(true)

      xTo(clientX)
      yTo(clientY)
      xDotTo(clientX)
      yDotTo(clientY)
    }

    // Mouse enter/leave handlers
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Interactive element handlers
    const handleInteractiveEnter = (e: Event) => {
      const target = e.target as HTMLElement
      const rect = target.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      setIsHovering(true)

      // Get cursor data attributes
      const cursorType = target.getAttribute("data-cursor") || "hover"
      const cursorTextAttr = target.getAttribute("data-cursor-text") || ""

      setCursorVariant(
        cursorType as "default" | "hover" | "click" | "text" | "drag"
      )
      setCursorText(cursorTextAttr)

      // Magnetic effect
      gsap.to(cursor, {
        x: centerX,
        y: centerY,
        duration: 0.3,
        ease: "power2.out"
      })

      // Scale effect
      gsap.to(cursor, {
        scale: target.tagName === "BUTTON" ? 3 : 2,
        duration: 0.3,
        ease: "back.out(1.7)"
      })

      // Change blend mode for certain elements
      if (target.matches("button, a, [data-cursor]")) {
        gsap.to(cursor, {
          mixBlendMode: blendMode,
          duration: 0.3
        })
      }
    }

    const handleInteractiveLeave = () => {
      setIsHovering(false)
      setCursorVariant("default")
      setCursorText("")

      gsap.to(cursor, {
        scale: 1,
        mixBlendMode: "normal",
        duration: 0.3,
        ease: "power2.out"
      })
    }

    // Click handlers
    const handleMouseDown = () => {
      setCursorVariant("click")
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.1,
        ease: "power2.out"
      })
    }

    const handleMouseUp = () => {
      setCursorVariant(isHovering ? "hover" : "default")
      gsap.to(cursor, {
        scale: isHovering ? 2 : 1,
        duration: 0.2,
        ease: "back.out(1.7)"
      })
    }

    // Text selection handlers
    const handleSelectStart = () => {
      setCursorVariant("text")
      gsap.to(cursor, {
        scaleX: 0.5,
        scaleY: 2,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const handleSelectEnd = () => {
      setCursorVariant("default")
      gsap.to(cursor, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("selectend", handleSelectEnd)

    // Add listeners for interactive elements
    const interactiveElements = document.querySelectorAll(
      "button, a, input, textarea, select, [data-cursor], .cursor-hover"
    )

    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", handleInteractiveEnter)
      el.addEventListener("mouseleave", handleInteractiveLeave)
    })

    // Cleanup function
    return () => {
      document.body.style.cursor = "auto"

      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("selectend", handleSelectEnd)

      interactiveElements.forEach(el => {
        el.removeEventListener("mouseenter", handleInteractiveEnter)
        el.removeEventListener("mouseleave", handleInteractiveLeave)
      })
    }
  }, [mounted, disabled, magneticStrength, blendMode, isHovering])

  if (!mounted || disabled || typeof window === "undefined") return null

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9999] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${className}`}
        style={{
          transform: "translate(-50%, -50%)",
          width: size,
          height: size
        }}
      >
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
            cursorVariant === "hover"
              ? "border-primary bg-primary/10"
              : cursorVariant === "click"
                ? "border-secondary bg-secondary/20"
                : cursorVariant === "text"
                  ? "border-accent bg-accent/10"
                  : "border-foreground/30 bg-foreground/5"
          }`}
        />

        {/* Inner elements based on variant */}
        {cursorVariant === "hover" && (
          <div className="bg-primary/20 absolute inset-2 rounded-full" />
        )}

        {cursorVariant === "click" && (
          <div className="bg-secondary/30 absolute inset-1 animate-pulse rounded-full" />
        )}

        {/* Cursor text */}
        {cursorText && (
          <div className="bg-foreground text-background absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs whitespace-nowrap">
            {cursorText}
          </div>
        )}

        {/* Animated particles around cursor */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`absolute h-1 w-1 rounded-full transition-all duration-500 ${
                cursorVariant === "hover"
                  ? "bg-primary opacity-60"
                  : "bg-foreground/20 opacity-0"
              }`}
              style={{
                transform: `rotate(${i * 90}deg) translateY(-${size + 10}px)`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Ripple effect for clicks */}
        {cursorVariant === "click" && (
          <div
            className="border-secondary absolute inset-0 animate-ping rounded-full border-2"
            style={{
              animationDuration: "0.4s",
              animationIterationCount: "1"
            }}
          />
        )}
      </div>

      {/* Cursor dot - follows more quickly */}
      <div
        ref={cursorDotRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9998] h-1 w-1 rounded-full transition-opacity duration-300 ${
          isVisible && !isHovering ? "opacity-100" : "opacity-0"
        } ${
          cursorVariant === "text"
            ? "bg-accent"
            : cursorVariant === "click"
              ? "bg-secondary"
              : "bg-foreground"
        }`}
        style={{
          transform: "translate(-50%, -50%)"
        }}
      />

      {/* Trail effect */}
      <div className="pointer-events-none fixed inset-0 z-[9997]">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-primary/20 absolute h-0.5 w-0.5 rounded-full opacity-0"
            style={{
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes cursor-trail {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }
      `}</style>
    </>
  )
}
