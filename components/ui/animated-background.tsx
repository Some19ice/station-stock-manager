"use client"

import { useEffect, useRef, useMemo, useCallback } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
  className?: string
  variant?: "hero" | "features" | "subtle"
  particleCount?: number
}

interface ParticleData {
  id: number
  size: number
  left: string
  top: string
  hasRotation: boolean
  duration: number
  delay: number
  dx: number
  dy: number
  targetOpacity: number
  targetScale: number
}

function generateParticles(count: number): ParticleData[] {
  const particles: ParticleData[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: Math.random() * 6 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      hasRotation: Math.random() > 0.5,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      dx: Math.random() * 200 - 100,
      dy: Math.random() * 200 - 100,
      targetOpacity: Math.random() * 0.7 + 0.3,
      targetScale: Math.random() * 1.5 + 0.5
    })
  }
  return particles
}

const variantStyles = {
  particle: {
    hero: "bg-gradient-to-r from-primary/20 to-secondary/20",
    features: "bg-accent/20",
    subtle: "bg-muted/10"
  },
  mesh: {
    hero: "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10",
    features: "bg-gradient-to-tr from-accent/5 via-transparent to-primary/5",
    subtle: "bg-gradient-to-r from-muted/5 to-transparent"
  }
} as const

export function AnimatedBackground({
  className,
  variant = "hero",
  particleCount = 50
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tweensRef = useRef<gsap.core.Tween[]>([])

  const particles = useMemo(
    () => generateParticles(particleCount),
    [particleCount]
  )

  const trackTween = useCallback((tween: gsap.core.Tween) => {
    tweensRef.current.push(tween)
    return tween
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    // Animate particles with staggered approach
    const particleEls = container.querySelectorAll<HTMLElement>(
      "[data-particle]"
    )
    particleEls.forEach((el, i) => {
      const p = particles[i]
      if (!p) return

      trackTween(
        gsap.to(el, {
          x: p.dx,
          y: p.dy,
          opacity: p.targetOpacity,
          scale: p.targetScale,
          duration: p.duration,
          delay: p.delay,
          ease: "none",
          repeat: -1,
          yoyo: true,
          repeatDelay: Math.random()
        })
      )

      if (p.hasRotation) {
        trackTween(
          gsap.to(el, {
            rotation: 360,
            duration: p.duration * 2,
            ease: "none",
            repeat: -1,
            delay: p.delay
          })
        )
      }
    })

    // Animate orbs for hero variant
    if (variant === "hero") {
      const orbs = container.querySelectorAll<HTMLElement>("[data-orb]")
      const orbConfigs = [
        { x: 50, y: 30, scale: 1.1, duration: 8 },
        { x: -30, y: 50, scale: 0.9, duration: 6 },
        { x: -25, y: -40, scale: 1.05, duration: 7 }
      ]
      orbs.forEach((orb, i) => {
        const config = orbConfigs[i]
        if (!config) return
        trackTween(
          gsap.to(orb, {
            ...config,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
          })
        )
      })
    }

    return () => {
      tweensRef.current.forEach((t) => t.kill())
      tweensRef.current = []
    }
  }, [variant, particles, trackTween])

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={
        variant === "hero"
          ? {
              background:
                "radial-gradient(ellipse at center, hsl(var(--primary) / 0.05) 0%, transparent 70%)"
            }
          : undefined
      }
    >
      {/* Mesh gradient layer */}
      <div
        className={cn(
          "absolute inset-0 opacity-30",
          variantStyles.mesh[variant]
        )}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          data-particle
          className={cn(
            "absolute rounded-full opacity-30",
            variantStyles.particle[variant]
          )}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top
          }}
        />
      ))}

      {/* Gradient orbs for hero variant */}
      {variant === "hero" && (
        <>
          <div
            data-orb
            className="absolute top-[10%] left-[10%] h-96 w-96 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl"
          />
          <div
            data-orb
            className="absolute top-[20%] right-[10%] h-64 w-64 rounded-full bg-gradient-to-r from-accent to-primary opacity-15 blur-2xl"
          />
          <div
            data-orb
            className="absolute bottom-[10%] left-1/2 h-80 w-80 rounded-full bg-gradient-to-r from-secondary to-accent opacity-10 blur-3xl"
          />
        </>
      )}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 animate-[grid-move_30s_linear_infinite] opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}
      />
    </div>
  )
}
