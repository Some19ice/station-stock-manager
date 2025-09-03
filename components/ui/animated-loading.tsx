"use client"

import { forwardRef, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface AnimatedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular"
  animation?: "pulse" | "wave" | "shimmer"
}

const AnimatedSkeleton = forwardRef<HTMLDivElement, AnimatedSkeletonProps>(
  ({ className, variant = "default", animation = "shimmer", ...props }, ref) => {
    const skeletonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!skeletonRef.current) return

      if (animation === "wave") {
        gsap.to(skeletonRef.current, {
          backgroundPosition: "200% 0",
          duration: 1.5,
          repeat: -1,
          ease: "none"
        })
      } else if (animation === "shimmer") {
        gsap.fromTo(
          skeletonRef.current,
          { opacity: 0.6 },
          {
            opacity: 1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
          }
        )
      }
    }, [animation])

    const variants = {
      default: "bg-muted",
      text: "bg-muted h-4 rounded",
      circular: "bg-muted rounded-full",
      rectangular: "bg-muted rounded-md"
    }

    const animationStyles = {
      pulse: "animate-pulse",
      wave: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
      shimmer: ""
    }

    return (
      <div
        ref={ref || skeletonRef}
        className={cn(
          "relative overflow-hidden",
          variants[variant],
          animationStyles[animation],
          className
        )}
        {...props}
      >
        {animation === "shimmer" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}
      </div>
    )
  }
)

AnimatedSkeleton.displayName = "AnimatedSkeleton"

interface AnimatedLoadingGridProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  cols?: number
  gap?: number
  itemHeight?: string
  stagger?: boolean
}

const AnimatedLoadingGrid = forwardRef<HTMLDivElement, AnimatedLoadingGridProps>(
  ({ className, rows = 3, cols = 1, gap = 4, itemHeight = "h-20", stagger = true, ...props }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!gridRef.current || !stagger) return

      const items = gridRef.current.children
      gsap.fromTo(
        items,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      )
    }, [stagger])

    const totalItems = rows * cols

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
        {Array.from({ length: totalItems }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-lg border bg-card",
              itemHeight
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: stagger ? index * 0.1 : 0,
              duration: 0.5
            }}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <AnimatedSkeleton 
                  variant="circular" 
                  className="h-10 w-10"
                  animation="pulse"
                />
                <div className="space-y-2 flex-1">
                  <AnimatedSkeleton 
                    className="h-4 w-3/4"
                    animation="shimmer"
                  />
                  <AnimatedSkeleton 
                    className="h-3 w-1/2"
                    animation="shimmer"
                  />
                </div>
              </div>
              <AnimatedSkeleton 
                className="h-8 w-full"
                animation="wave"
              />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
)

AnimatedLoadingGrid.displayName = "AnimatedLoadingGrid"

interface LoadingCardProps {
  showTitle?: boolean
  description?: boolean
  showContent?: boolean
  footer?: boolean
  avatar?: boolean
  className?: string
}

const LoadingCard = forwardRef<HTMLDivElement, LoadingCardProps>(
  (
    {
      className,
      showTitle = true,
      description = true,
      showContent = true,
      footer = false,
      avatar = false
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn("bg-card space-y-4 rounded-lg border p-6", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-3">
          {avatar && (
            <AnimatedSkeleton
              variant="circular"
              className="h-12 w-12"
              animation="pulse"
            />
          )}
          <div className="flex-1 space-y-2">
            {showTitle && (
              <AnimatedSkeleton className="h-5 w-2/3" animation="shimmer" />
            )}
            {description && (
              <AnimatedSkeleton className="h-4 w-1/2" animation="shimmer" />
            )}
          </div>
        </div>

        {/* Content */}
        {showContent && (
          <div className="space-y-3">
            <AnimatedSkeleton className="h-4 w-full" animation="wave" />
            <AnimatedSkeleton className="h-4 w-4/5" animation="wave" />
            <AnimatedSkeleton className="h-4 w-3/5" animation="wave" />
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-between pt-2">
            <AnimatedSkeleton className="h-8 w-20 rounded" animation="pulse" />
            <AnimatedSkeleton className="h-8 w-16 rounded" animation="pulse" />
          </div>
        )}
      </motion.div>
    )
  }
)

LoadingCard.displayName = "LoadingCard"

export { AnimatedSkeleton, AnimatedLoadingGrid, LoadingCard }
