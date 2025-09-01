"use client"

import { forwardRef, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface AnimatedPageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dashboard" | "form"
  stagger?: boolean
}

const AnimatedPage = forwardRef<HTMLDivElement, AnimatedPageProps>(
  ({ className, variant = "default", stagger = true, children, ...props }, ref) => {
    const pageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!pageRef.current) return

      // Enhanced page entrance animation
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
        // Stagger child animations
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
    }, [stagger])

    const variants = {
      default: "min-h-screen",
      dashboard: "min-h-screen space-y-6",
      form: "min-h-screen flex items-center justify-center"
    }

    return (
      <motion.div
        ref={ref || pageRef}
        className={cn(
          "relative w-full",
          variants[variant],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedPage.displayName = "AnimatedPage"

const AnimatedGrid = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: number
    gap?: number
    staggerDelay?: number
  }
>(({ className, cols = 1, gap = 4, staggerDelay = 0.1, children, ...props }, ref) => {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return

    const items = gridRef.current.children
    gsap.fromTo(
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
  }, [staggerDelay])

  return (
    <div
      ref={ref || gridRef}
      className={cn(
        "grid",
        `grid-cols-${cols}`,
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

AnimatedGrid.displayName = "AnimatedGrid"

const AnimatedText = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    text: string
    delay?: number
    speed?: number
  }
>(({ className, text, delay = 0, speed = 0.05, ...props }, ref) => {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const chars = text.split("")
    textRef.current.innerHTML = chars
      .map(char => `<span class="inline-block opacity-0">${char === " " ? "&nbsp;" : char}</span>`)
      .join("")

    const spans = textRef.current.querySelectorAll("span")
    
    gsap.to(spans, {
      opacity: 1,
      duration: 0.1,
      stagger: speed,
      delay: delay,
      ease: "power2.out"
    })
  }, [text, delay, speed])

  return (
    <div
      ref={ref || textRef}
      className={cn("overflow-hidden", className)}
      {...props}
    />
  )
})

AnimatedText.displayName = "AnimatedText"

const AnimatedLoader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg"
    variant?: "spinner" | "dots" | "pulse"
  }
>(({ className, size = "md", variant = "spinner", ...props }, ref) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  if (variant === "spinner") {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "border-2 border-primary/20 border-t-primary rounded-full",
          sizes[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        {...props}
      />
    )
  }

  if (variant === "dots") {
    return (
      <div
        ref={ref}
        className={cn("flex space-x-1", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "bg-primary rounded-full",
              size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "bg-primary/20 rounded",
        sizes[size],
        className
      )}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      {...props}
    />
  )
})

AnimatedLoader.displayName = "AnimatedLoader"

export { AnimatedPage, AnimatedGrid, AnimatedText, AnimatedLoader }
