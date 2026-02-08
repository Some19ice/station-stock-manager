"use client"

import Image from "next/image"
import {
  BarChart,
  Code2,
  CreditCard,
  Database,
  Palette,
  Shield,
  ArrowUpRight,
  Zap
} from "lucide-react"
import { SectionWrapper } from "./section-wrapper"
import {
  useStaggerAnimation
} from "@/hooks/use-gsap"
import { useEffect, useRef, useState } from "react"

const features = [
  {
    name: "Leak & Theft Detection",
    description:
      "Detect unrecorded sales and tank leaks instantly. If the pump meter moves but no sale is logged, you get an alert.",
    icon: Shield
  },
  {
    name: "Supplier Management",
    description:
      "Manage supplier relationships, track deliveries, and automate purchase orders for seamless restocking.",
    icon: Database
  },
  {
    name: "Multi-Station Dashboard",
    description:
      "Oversee multiple locations from a single dashboard with role-based access for staff and managers.",
    icon: BarChart
  },
  {
    name: "Lubricant Inventory",
    description:
      "Complete tracking for motor oils, filters, and automotive products with detailed specifications.",
    icon: Palette
  },
  {
    name: "Daily Profit Reconciliation",
    description:
      "Automated End-of-Day reports sent to your phone. Compare 'Expected Cash' vs 'Actual Cash' instantly.",
    icon: CreditCard
  },
  {
    name: "Shift Accountability Logs",
    description:
      "Know exactly which attendant was on duty during a shortage. Digital clock-ins and activity logs prevent disputes.",
    icon: Code2
  }
]

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Simple scroll-triggered stagger animation
  useStaggerAnimation("#features-grid", ".feature-card")

  useEffect(() => {
    setMounted(true)
  }, [])



  if (!mounted) {
    return (
      <SectionWrapper className="relative overflow-hidden" id="features">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-primary text-sm font-bold tracking-wider uppercase">
              Everything Included
            </h2>
            <h3 className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">Complete</span> Gas Station
              Management
            </h3>
            <p className="text-foreground/75 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Everything you need to manage fuel inventory, track sales, and
              optimize operations.
            </p>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper className="relative overflow-hidden" id="features">
      {/* Static gradient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-60" />
        <div className="bg-[radial-gradient(ellipse_at_center,theme(colors.accent/10),transparent_70%)] absolute inset-0" />
      </div>

      <div ref={sectionRef} className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="features-badge mb-6 flex items-center justify-center gap-2">
            <Zap className="text-primary h-5 w-5" />
            <h2 className="text-primary text-sm font-bold tracking-wider uppercase">
              Everything Included
            </h2>
          </div>

          <div className="features-title">
            <h3 className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">Complete</span> Gas Station
              Management
            </h3>
          </div>

          <p className="features-subtitle text-foreground/75 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
            Everything you need to manage fuel inventory, track sales, and
            optimize operations.
            <span className="text-primary mt-2 block text-base font-medium">
              Trusted by industry leaders worldwide
            </span>
          </p>
        </div>

        {/* Visual Break — Station Images */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:mt-20 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/station-aerial-view.png"
              alt="Aerial view of a modern filling station"
              width={600}
              height={400}
              className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Multi-Station Overview</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/fuel-pump-closeup.png"
              alt="Close-up of fuel pump with digital meter"
              width={600}
              height={400}
              className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Precision Fuel Monitoring</p>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <dl
            id="features-grid"
            className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3 lg:gap-12"
          >
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="feature-card group relative"
              >
                <div className="bg-card/50 border-border/50 hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                  {/* Card gradient overlay */}
                  <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="from-primary via-secondary to-accent absolute inset-0 rounded-2xl bg-gradient-to-r p-[1px]">
                      <div className="bg-card h-full w-full rounded-2xl" />
                    </div>
                  </div>

                  <div className="relative z-10 p-8">
                    {/* Enhanced icon container */}
                    <div className="feature-icon group-hover:from-primary/20 group-hover:to-secondary/20 from-muted/50 to-muted mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-500">
                      <feature.icon
                        className="text-primary h-8 w-8 transition-colors duration-500 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Feature name with hover effect */}
                    <dt className="mb-4 flex items-center justify-between">
                      <h4 className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors duration-300">
                        {feature.name}
                      </h4>
                      <div className="feature-arrow text-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </dt>

                    {/* Enhanced description */}
                    <dd className="text-foreground/70 group-hover:text-foreground/80 text-base leading-relaxed transition-colors duration-300">
                      <p className="relative">
                        {feature.description}
                      </p>
                    </dd>

                    {/* Progress indicator */}
                    <div className="bg-muted/30 mt-6 h-1 w-full overflow-hidden rounded-full">
                      <div className="feature-progress from-primary to-secondary h-full bg-gradient-to-r w-0" />
                    </div>
                  </div>

                  {/* Interactive particles on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="bg-primary/10 absolute top-4 right-4 h-2 w-2 animate-pulse rounded-full" />
                    <div className="bg-secondary/10 absolute bottom-8 left-6 h-1 w-1 animate-pulse rounded-full delay-150" />
                    <div className="bg-accent/10 absolute right-8 bottom-6 h-1.5 w-1.5 animate-pulse rounded-full delay-300" />
                  </div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
