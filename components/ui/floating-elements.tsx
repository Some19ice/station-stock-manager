"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  BarChart3,
  Shield,
  Zap,
  Gauge,
  TrendingUp,
  Database,
  Fuel,
  Settings,
  Bell,
  CheckCircle
} from "lucide-react"

interface FloatingElementsProps {
  className?: string
  variant?: "hero" | "features" | "dashboard" | "subtle"
  density?: "low" | "medium" | "high"
  animated?: boolean
}

const iconSets = {
  hero: [Fuel, BarChart3, Shield, Gauge, TrendingUp, Database],
  features: [Zap, Settings, Bell, CheckCircle, BarChart3, Shield],
  dashboard: [BarChart3, TrendingUp, Gauge, Database, Settings, Bell],
  subtle: [CheckCircle, Zap, Shield]
}

export function FloatingElements({
  className = "",
  variant = "hero",
  density = "medium",
  animated = true
}: FloatingElementsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef<HTMLDivElement[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current || !animated) return

    const container = containerRef.current
    const elements: HTMLDivElement[] = []
    const icons = iconSets[variant]

    const elementCount = density === "low" ? 6 : density === "medium" ? 10 : 15

    // Create floating elements
    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement("div")
      const IconComponent = icons[Math.floor(Math.random() * icons.length)]

      element.className = `
        absolute flex items-center justify-center
        rounded-full border border-border/20 backdrop-blur-sm
        transition-all duration-300 hover:scale-110 hover:border-primary/40
        ${
          variant === "hero"
            ? "bg-card/40 text-primary"
            : variant === "features"
              ? "bg-primary/10 text-primary"
              : variant === "dashboard"
                ? "bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground"
                : "bg-muted/20 text-muted-foreground"
        }
      `

      // Random size based on variant
      const sizeClasses =
        variant === "hero"
          ? ["w-12 h-12", "w-16 h-16", "w-14 h-14"]
          : variant === "features"
            ? ["w-10 h-10", "w-12 h-12", "w-14 h-14"]
            : ["w-8 h-8", "w-10 h-10", "w-12 h-12"]

      const randomSize =
        sizeClasses[Math.floor(Math.random() * sizeClasses.length)]
      element.className += ` ${randomSize}`

      // Create and append icon
      const iconWrapper = document.createElement("div")
      iconWrapper.innerHTML = `
        <svg class="w-1/2 h-1/2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${getIconSVG(IconComponent.name)}
        </svg>
      `
      element.appendChild(iconWrapper)

      // Random position
      element.style.left = `${Math.random() * 90 + 5}%`
      element.style.top = `${Math.random() * 90 + 5}%`
      element.style.zIndex = "1"

      container.appendChild(element)
      elements.push(element)
    }

    elementsRef.current = elements

    // Animate elements with GSAP
    elements.forEach((element, index) => {
      const delay = Math.random() * 2
      const duration = 4 + Math.random() * 4
      const amplitude =
        variant === "hero" ? 30 : variant === "features" ? 20 : 15

      // Floating animation
      gsap.to(element, {
        y: `${Math.random() > 0.5 ? "-" : "+"}${amplitude}px`,
        x: `${Math.random() > 0.5 ? "-" : "+"}${amplitude * 0.7}px`,
        rotation: Math.random() * 10 - 5,
        duration: duration,
        delay: delay,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: Math.random() * 1
      })

      // Scale pulsing for some elements
      if (Math.random() > 0.6) {
        gsap.to(element, {
          scale: 1.1,
          duration: 2 + Math.random() * 2,
          delay: delay + Math.random(),
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        })
      }

      // Opacity breathing effect
      gsap.to(element, {
        opacity: 0.3 + Math.random() * 0.4,
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      })

      // Add hover interactions
      element.addEventListener("mouseenter", () => {
        gsap.to(element, {
          scale: 1.2,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        })
      })

      element.addEventListener("mouseleave", () => {
        gsap.to(element, {
          scale: 1,
          opacity: 0.6,
          duration: 0.3,
          ease: "power2.out"
        })
      })
    })

    // Add connecting lines between nearby elements for dashboard variant
    if (variant === "dashboard") {
      createConnections(elements, container)
    }

    // Cleanup function
    return () => {
      elements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element)
        }
      })
    }
  }, [mounted, variant, density, animated])

  const createConnections = (
    elements: HTMLDivElement[],
    container: HTMLElement
  ) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("class", "absolute inset-0 pointer-events-none opacity-20")
    svg.style.zIndex = "0"
    container.appendChild(svg)

    elements.forEach((element1, i) => {
      elements.slice(i + 1).forEach(element2 => {
        const rect1 = element1.getBoundingClientRect()
        const rect2 = element2.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const x1 =
          ((rect1.left + rect1.width / 2 - containerRect.left) /
            containerRect.width) *
          100
        const y1 =
          ((rect1.top + rect1.height / 2 - containerRect.top) /
            containerRect.height) *
          100
        const x2 =
          ((rect2.left + rect2.width / 2 - containerRect.left) /
            containerRect.width) *
          100
        const y2 =
          ((rect2.top + rect2.height / 2 - containerRect.top) /
            containerRect.height) *
          100

        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

        if (distance < 25) {
          // Only connect nearby elements
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          )
          line.setAttribute("x1", `${x1}%`)
          line.setAttribute("y1", `${y1}%`)
          line.setAttribute("x2", `${x2}%`)
          line.setAttribute("y2", `${y2}%`)
          line.setAttribute("stroke", "currentColor")
          line.setAttribute("stroke-width", "1")
          line.setAttribute("stroke-dasharray", "2,2")
          line.setAttribute("class", "text-primary/30")

          svg.appendChild(line)
        }
      })
    })
  }

  const getIconSVG = (iconName: string): string => {
    const iconPaths: Record<string, string> = {
      Fuel: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>',
      BarChart3:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
      Shield:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
      Gauge:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
      TrendingUp:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
      Database:
        '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      Zap: '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>',
      Settings:
        '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 4m-7 7L9 8m7 7l2.5 2.5M15 12l-3-3"/>',
      Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="m13.73 21a2 2 0 0 1-3.46 0"/>',
      CheckCircle:
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>'
    }
    return iconPaths[iconName] || iconPaths.CheckCircle
  }

  if (!mounted || !animated) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* Static decorative shapes when animation is disabled */}
      <div className="bg-primary/20 absolute top-10 left-10 h-2 w-2 rounded-full" />
      <div className="bg-secondary/20 absolute top-20 right-20 h-3 w-3 rounded-full" />
      <div className="bg-accent/20 absolute bottom-20 left-20 h-2 w-2 rounded-full" />
      <div className="bg-primary/30 absolute right-10 bottom-10 h-1 w-1 rounded-full" />
    </div>
  )
}
