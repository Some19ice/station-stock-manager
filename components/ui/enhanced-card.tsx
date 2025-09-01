"use client"

import { forwardRef, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "metric" | "alert" | "feature"
  hover?: boolean
  glow?: boolean
  magnetic?: boolean
  delay?: number
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", hover = true, glow = false, magnetic = false, delay = 0, children, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!cardRef.current) return

      // Entrance animation
      gsap.fromTo(
        cardRef.current,
        { 
          opacity: 0, 
          y: 20, 
          scale: 0.95,
          rotationX: 5
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotationX: 0,
          duration: 0.6, 
          delay: delay * 0.1,
          ease: "power2.out"
        }
      )

      // Magnetic effect
      if (magnetic) {
        const handleMouseMove = (e: MouseEvent) => {
          const card = cardRef.current
          if (!card) return

          const rect = card.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const deltaX = (e.clientX - centerX) * 0.1
          const deltaY = (e.clientY - centerY) * 0.1

          gsap.to(card, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: "power2.out"
          })
        }

        const handleMouseLeave = () => {
          gsap.to(cardRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
          })
        }

        cardRef.current.addEventListener("mousemove", handleMouseMove)
        cardRef.current.addEventListener("mouseleave", handleMouseLeave)

        return () => {
          cardRef.current?.removeEventListener("mousemove", handleMouseMove)
          cardRef.current?.removeEventListener("mouseleave", handleMouseLeave)
        }
      }
    }, [delay, magnetic])

    const variants = {
      default: "bg-card border-border/50",
      metric: "bg-card border-border/30 shadow-lg",
      alert: "bg-destructive/5 border-destructive/20",
      feature: "bg-accent/5 border-accent/20"
    }

    return (
      <motion.div
        ref={ref}
        className="relative group"
        whileHover={hover ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {/* Glow effect */}
        {glow && (
          <div
            ref={glowRef}
            className="absolute -inset-0.5 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        <Card
          ref={cardRef}
          className={cn(
            "relative transition-all duration-300",
            "backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
            variants[variant],
            hover && "hover:shadow-xl hover:border-border/80",
            glow && "group-hover:shadow-2xl",
            className
          )}
          {...props}
        >
          {children}
        </Card>
      </motion.div>
    )
  }
)

EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn("pb-3", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("text-sm text-muted-foreground/80", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
