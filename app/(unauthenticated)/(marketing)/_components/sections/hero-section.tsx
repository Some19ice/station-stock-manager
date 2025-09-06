"use client"

import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { FloatingElements } from "@/components/ui/floating-elements"
import {
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { SectionWrapper } from "./section-wrapper"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface HeroSectionProps {
  isAuthenticated: boolean
  userRole?: string
}

const trustIndicators = [
  { text: "Real-time Monitoring", icon: "📊" },
  { text: "Multi-Station Support", icon: "🏢" },
  { text: "Compliance Ready", icon: "✅" }
]

export function HeroSection({ isAuthenticated, userRole }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !heroRef.current) return

    // Simplified, performance-optimized animations
    const tl = gsap.timeline({ delay: 0.2 })

    tl.from(".hero-badge", {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
      .from(
        ".hero-title-line",
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
        },
        "-=0.3"
      )
      .from(
        ".hero-subtitle",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.4"
      )
      .from(
        ".hero-cta",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.3"
      )
      .from(
        ".trust-indicator",
        {
          opacity: 0,
          x: -20,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.2"
      )

    // Sparkle animation
    const sparkles = document.querySelectorAll(".sparkle")
    sparkles.forEach((sparkle, index) => {
      gsap.to(sparkle, {
        opacity: 0.8,
        scale: 1.2,
        rotation: "+=360",
        duration: 3 + Math.random() * 2,
        delay: index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      })
    })
  }, [mounted])

  const dashboardUrl = userRole === "manager" ? "/dashboard" : "/staff"

  if (!mounted) {
    return (
      <SectionWrapper className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-card/80 relative inline-flex items-center rounded-full px-4 py-2 text-sm shadow-lg">
              <span className="mr-2">⛽</span>
              <span>Trusted by 500+ Gas Stations</span>
            </div>
          </div>
          <h1 className="text-foreground text-4xl font-bold sm:text-6xl lg:text-7xl">
            Streamline Your
            <span className="from-primary via-secondary to-accent block bg-gradient-to-r bg-clip-text text-transparent">
              Gas Station Operations
            </span>
          </h1>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40">
      {/* Enhanced Background Effects */}
      <AnimatedBackground variant="hero" particleCount={40} />
      <FloatingElements variant="hero" density="medium" animated />

      {/* Optimized Sparkles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Sparkles className="sparkle text-primary/30 absolute top-20 left-[10%] h-4 w-4" />
        <Sparkles className="sparkle text-secondary/30 absolute top-32 right-[15%] h-3 w-3" />
        <Sparkles className="sparkle text-accent/30 absolute bottom-40 left-[20%] h-5 w-5" />
        <Sparkles className="sparkle text-primary/30 absolute right-[25%] bottom-20 h-3 w-3" />
      </div>

      <div
        ref={heroRef}
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Trust Badge */}
        <div className="hero-badge mb-8 flex justify-center">
          <div className="group bg-card/90 hover:bg-card border-border/50 hover:border-primary/30 relative inline-flex items-center rounded-full px-6 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <span className="mr-3 text-lg" aria-hidden="true">
              ⛽
            </span>
            <span>Trusted by 500+ Gas Stations</span>
            <div className="from-primary/0 via-primary/10 to-primary/0 absolute inset-0 rounded-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-foreground mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
          <span className="hero-title-line block">Streamline Your</span>
          <span className="hero-title-line text-primary relative block pb-2 leading-tight">
            Gas Station Operations
          </span>
        </h1>

        {/* Subtitle */}
        <div className="hero-subtitle mx-auto max-w-4xl">
          <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl sm:leading-8">
            Complete inventory management for fuel and lubricants. Real-time
            monitoring, automated alerts, and comprehensive reporting for single
            stations or entire chains.
          </p>
          <p className="text-primary mt-4 text-base font-medium">
            Join the future of gas station management
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="hero-cta mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {isAuthenticated ? (
            <Button
              size="lg"
              asChild
              className="group bg-primary hover:bg-primary/90 relative w-full overflow-hidden px-8 py-4 text-white shadow-xl transition-all duration-300 hover:shadow-2xl sm:w-auto"
            >
              <Link href={dashboardUrl} className="flex items-center gap-3">
                <span>Go to Dashboard</span>
                <LayoutDashboard className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              asChild
              className="group bg-primary hover:bg-primary/90 relative w-full overflow-hidden px-8 py-4 text-white shadow-xl transition-all duration-300 hover:shadow-2xl sm:w-auto"
            >
              <Link href="/signup" className="flex items-center gap-3">
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            asChild
            className="group hover:border-primary hover:text-primary bg-card/60 hover:bg-card/80 w-full border-2 px-8 py-4 backdrop-blur-sm transition-all duration-300 sm:w-auto"
          >
            <Link href="#features" className="flex items-center gap-3">
              <span>View Features</span>
              <span className="inline-block animate-bounce">↓</span>
            </Link>
          </Button>
        </div>

        {/* Enhanced Trust Indicators */}
        <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:mt-20 sm:flex-row sm:gap-8">
          {trustIndicators.map((item, i) => (
            <div
              key={item.text}
              className="trust-indicator group hover:bg-card/60 flex w-full items-center justify-center gap-4 rounded-xl px-6 py-4 transition-all duration-300 hover:shadow-lg sm:w-auto"
            >
              <div className="text-primary bg-primary/10 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full transition-colors">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="group-hover:text-primary text-sm font-medium transition-colors">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-3">
          {[
            { number: "500+", label: "Active Stations" },
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "Support" }
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="hero-stat text-center"
            >
              <div className="text-primary text-3xl font-bold sm:text-4xl">
                {stat.number}
              </div>
              <div className="text-foreground/70 mt-2 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
