"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleLoadingProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
}

export function SimpleLoading({
  message = "Loading...",
  className = "",
  size = "md",
  variant = "spinner"
}: SimpleLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)

  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      )
    }

    if (messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2, ease: "power2.out" }
      )
    }
  }, [])

  const SpinnerVariant = () => (
    <Loader2 className={cn("text-primary animate-spin", sizes[size])} />
  )

  const DotsVariant = () => {
    const dotsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!dotsRef.current) return

      const dots = dotsRef.current.children
      const tl = gsap.timeline({ repeat: -1 })

      Array.from(dots).forEach((dot, i) => {
        tl.to(dot, {
          scale: 1.2,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }, i * 0.2)
        .to(dot, {
          scale: 1,
          opacity: 0.7,
          duration: 0.4,
          ease: "power2.in"
        }, i * 0.2 + 0.4)
      })

      return () => {
        tl.kill()
      }
    }, [])

    return (
      <div ref={dotsRef} className="flex space-x-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-full opacity-70",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
            )}
          />
        ))}
      </div>
    )
  }

  const PulseVariant = () => {
    const pulseRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!pulseRef.current) return

      const tl = gsap.timeline({ repeat: -1 })
      tl.to(pulseRef.current, {
        scale: 1.1,
        opacity: 1,
        duration: 0.75,
        ease: "power2.inOut"
      })
      .to(pulseRef.current, {
        scale: 1,
        opacity: 0.5,
        duration: 0.75,
        ease: "power2.inOut"
      })

      return () => {
        tl.kill()
      }
    }, [])

    return (
      <div
        ref={pulseRef}
        className={cn("bg-primary/20 rounded-full opacity-50", sizes[size])}
      >
        <div
          className={cn("bg-primary h-full w-full rounded-full", "animate-pulse")}
        />
      </div>
    )
  }

  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return <DotsVariant />
      case "pulse":
        return <PulseVariant />
      default:
        return <SpinnerVariant />
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      {renderVariant()}
      {message && (
        <p
          ref={messageRef}
          className={cn(
            "text-muted-foreground text-center",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}
