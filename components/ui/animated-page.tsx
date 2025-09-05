"use client"

import { forwardRef, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface AnimatedPageProps {
  variant?: "default" | "dashboard" | "form"
  stagger?: boolean
  className?: string
  children?: React.ReactNode
}

const AnimatedPage = forwardRef<HTMLDivElement, AnimatedPageProps>(
  ({ className, variant = "default", stagger = true, children }, ref) => {
    const pageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!pageRef.current) return

      const tl = gsap.timeline()

      tl.fromTo(
        pageRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.98
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        }
      )

      if (stagger) {
        const children = pageRef.current.children
        if (children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              delay: 0.2
            }
          )
        }
      }

      return () => {
        tl.kill()
      }
    }, [stagger])

    const variants = {
      default: "min-h-screen",
      dashboard: "min-h-screen space-y-6",
      form: "min-h-screen flex items-center justify-center"
    }

    return (
      <div
        ref={ref || pageRef}
        className={cn("relative w-full", variants[variant], className)}
      >
        {children}
      </div>
    )
  }
)

AnimatedPage.displayName = "AnimatedPage"

interface AnimatedGridProps {
  cols?: number
  gap?: number
  staggerDelay?: number
  className?: string
  children?: React.ReactNode
}

const AnimatedGrid = forwardRef<HTMLDivElement, AnimatedGridProps>(
  ({ className, cols = 1, gap = 4, staggerDelay = 0.1, children }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!gridRef.current) return

      const items = gridRef.current.children
      const tl = gsap.timeline()
      
      tl.fromTo(
        items,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: staggerDelay,
          ease: "back.out(1.2)"
        }
      )

      return () => {
        tl.kill()
      }
    }, [staggerDelay])

    return (
      <div
        ref={ref || gridRef}
        className={cn("grid", `grid-cols-${cols}`, `gap-${gap}`, className)}
      >
        {children}
      </div>
    )
  }
)

AnimatedGrid.displayName = "AnimatedGrid"

interface AnimatedTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
}

const AnimatedText = forwardRef<HTMLDivElement, AnimatedTextProps>(
  ({ className, text, delay = 0, speed = 0.05 }, ref) => {
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!textRef.current) return

      const chars = text.split("")
      textRef.current.innerHTML = chars
        .map(
          char =>
            `<span class="inline-block opacity-0">${char === " " ? "&nbsp;" : char}</span>`
        )
        .join("")

      const spans = textRef.current.querySelectorAll("span")
      const tl = gsap.timeline()

      tl.to(spans, {
        opacity: 1,
        duration: 0.1,
        stagger: speed,
        delay: delay,
        ease: "power2.out"
      })

      return () => {
        tl.kill()
      }
    }, [text, delay, speed])

    return (
      <div ref={ref || textRef} className={cn("overflow-hidden", className)} />
    )
  }
)

AnimatedText.displayName = "AnimatedText"

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
  className?: string
}

const AnimatedLoader = forwardRef<HTMLDivElement, AnimatedLoaderProps>(
  ({ className, size = "md", variant = "spinner" }, ref) => {
    const loaderRef = useRef<HTMLDivElement>(null)

    const sizes = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12"
    }

    useEffect(() => {
      if (!loaderRef.current) return

      let tl: gsap.core.Timeline

      if (variant === "spinner") {
        tl = gsap.timeline({ repeat: -1 })
        tl.to(loaderRef.current, {
          rotation: 360,
          duration: 1,
          ease: "none"
        })
      } else if (variant === "pulse") {
        tl = gsap.timeline({ repeat: -1 })
        tl.to(loaderRef.current, {
          opacity: 0.5,
          duration: 0.75,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }

      return () => {
        tl?.kill()
      }
    }, [variant])

    if (variant === "dots") {
      return (
        <div ref={ref} className={cn("flex space-x-1", className)}>
          {[0, 1, 2].map(i => (
            <DotLoader
              key={i}
              size={size}
              delay={i * 0.2}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref || loaderRef}
        className={cn(
          variant === "spinner" 
            ? "border-primary/20 border-t-primary rounded-full border-2"
            : "bg-primary/20 rounded",
          sizes[size],
          className
        )}
      />
    )
  }
)

const DotLoader = ({ size, delay }: { size: "sm" | "md" | "lg", delay: number }) => {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dotRef.current) return

    const tl = gsap.timeline({ repeat: -1, delay })
    tl.to(dotRef.current, {
      scale: 1.5,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    })
    .to(dotRef.current, {
      scale: 1,
      opacity: 0.5,
      duration: 0.5,
      ease: "power2.in"
    })

    return () => {
      tl.kill()
    }
  }, [delay])

  return (
    <div
      ref={dotRef}
      className={cn(
        "bg-primary rounded-full opacity-50",
        size === "sm"
          ? "h-1 w-1"
          : size === "md"
            ? "h-2 w-2"
            : "h-3 w-3"
      )}
    />
  )
}

AnimatedLoader.displayName = "AnimatedLoader"

export { AnimatedPage, AnimatedGrid, AnimatedText, AnimatedLoader }
