"use client"

import { useRef, useEffect, ReactNode } from "react"
import { gsap } from "gsap"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  glowEffect?: boolean
}

export function AnimatedCard({
  title,
  description,
  children,
  className,
  hoverEffect = true,
  glowEffect = false
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || !hoverEffect) return

    const card = cardRef.current
    const glow = glowRef.current

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      })

      if (glow && glowEffect) {
        gsap.to(glow, {
          opacity: 0.6,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })

      if (glow && glowEffect) {
        gsap.to(glow, {
          opacity: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        })
      }
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [hoverEffect, glowEffect])

  return (
    <div className="relative">
      {glowEffect && (
        <div
          ref={glowRef}
          className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 blur"
        />
      )}
      <Card ref={cardRef} className={cn("relative", className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
