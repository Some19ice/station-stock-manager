"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface AnimatedBackgroundProps {
  className?: string
  variant?: "hero" | "features" | "subtle"
  particleCount?: number
}

export function AnimatedBackground({
  className = "",
  variant = "hero",
  particleCount = 50
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const container = containerRef.current
    const particles: HTMLDivElement[] = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = `absolute rounded-full opacity-30 ${
        variant === "hero"
          ? "bg-gradient-to-r from-primary/20 to-secondary/20"
          : variant === "features"
            ? "bg-accent/20"
            : "bg-muted/10"
      }`

      // Random size between 2-8px
      const size = Math.random() * 6 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      container.appendChild(particle)
      particles.push(particle)
    }

    particlesRef.current = particles

    // Animate particles with GSAP
    particles.forEach((particle, index) => {
      const delay = Math.random() * 2
      const duration = 3 + Math.random() * 4

      gsap.to(particle, {
        x: `${Math.random() * 200 - 100}px`,
        y: `${Math.random() * 200 - 100}px`,
        opacity: Math.random() * 0.7 + 0.3,
        scale: Math.random() * 1.5 + 0.5,
        duration: duration,
        delay: delay,
        ease: "none",
        repeat: -1,
        yoyo: true,
        repeatDelay: Math.random() * 1
      })

      // Add rotation for some particles
      if (Math.random() > 0.5) {
        gsap.to(particle, {
          rotation: 360,
          duration: duration * 2,
          ease: "none",
          repeat: -1,
          delay: delay
        })
      }
    })

    // Create floating gradient orbs for hero variant
    if (variant === "hero") {
      const orb1 = document.createElement("div")
      const orb2 = document.createElement("div")
      const orb3 = document.createElement("div")

      orb1.className =
        "absolute w-96 h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-r from-primary to-secondary"
      orb2.className =
        "absolute w-64 h-64 rounded-full opacity-15 blur-2xl bg-gradient-to-r from-accent to-primary"
      orb3.className =
        "absolute w-80 h-80 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-secondary to-accent"

      orb1.style.left = "10%"
      orb1.style.top = "10%"
      orb2.style.right = "10%"
      orb2.style.top = "20%"
      orb3.style.left = "50%"
      orb3.style.bottom = "10%"

      container.appendChild(orb1)
      container.appendChild(orb2)
      container.appendChild(orb3)

      // Animate orbs
      gsap.to(orb1, {
        x: 50,
        y: 30,
        scale: 1.1,
        duration: 8,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      })

      gsap.to(orb2, {
        x: -30,
        y: 50,
        scale: 0.9,
        duration: 6,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      })

      gsap.to(orb3, {
        x: -25,
        y: -40,
        scale: 1.05,
        duration: 7,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      })
    }

    // Create animated mesh gradient background
    const meshGradient = document.createElement("div")
    meshGradient.className = `absolute inset-0 opacity-30 ${
      variant === "hero"
        ? "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
        : variant === "features"
          ? "bg-gradient-to-tr from-accent/5 via-transparent to-primary/5"
          : "bg-gradient-to-r from-muted/5 to-transparent"
    }`
    container.insertBefore(meshGradient, container.firstChild)

    // Animate mesh gradient
    gsap.to(meshGradient, {
      backgroundPosition: "200% 200%",
      duration: 20,
      ease: "none",
      repeat: -1,
      backgroundSize: "300% 300%"
    })

    // Cleanup function
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      })
    }
  }, [mounted, variant, particleCount])

  if (!mounted) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        background:
          variant === "hero"
            ? "radial-gradient(ellipse at center, hsl(var(--primary) / 0.05) 0%, transparent 70%)"
            : undefined
      }}
    >
      {/* Animated grid overlay for subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(var(--foreground-rgb, 0 0 0), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--foreground-rgb, 0 0 0), 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          animation: "grid-move 30s linear infinite"
        }}
      />

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  )
}
