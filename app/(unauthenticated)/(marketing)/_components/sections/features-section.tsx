"use client"

import { motion } from "framer-motion"
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
import { AnimatedBackground } from "@/components/ui/animated-background"
import { FloatingElements } from "@/components/ui/floating-elements"
import {
  useStaggerAnimation,
  useMagneticHover,
  useAdvancedStagger,
  useParallax
} from "@/hooks/use-gsap"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

const features = [
  {
    name: "Real-time Fuel Monitoring",
    description:
      "Track fuel levels across all tanks with automated alerts when inventory drops below minimum thresholds.",
    icon: BarChart
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
    icon: Shield
  },
  {
    name: "Lubricant Inventory",
    description:
      "Complete tracking for motor oils, filters, and automotive products with detailed specifications.",
    icon: Palette
  },
  {
    name: "Compliance Reporting",
    description:
      "Generate regulatory reports for environmental compliance, tax reporting, and audit requirements.",
    icon: Code2
  },
  {
    name: "Sales Analytics",
    description:
      "Detailed sales reports, profit margins, and performance metrics to optimize your operations.",
    icon: CreditCard
  }
]

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Enhanced GSAP animations
  useAdvancedStagger("#features-grid", ".feature-card", {
    phase1: { opacity: 0, y: 60, rotationY: -15, scale: 0.9 },
    phase2: { opacity: 1, y: 0, rotationY: 0, scale: 1 },
    stagger: 0.15
  })
  useMagneticHover(".feature-card", 0.2)
  useParallax(".features-background", 0.3)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !sectionRef.current) return

    // Continuous background animation
    const cards = sectionRef.current.querySelectorAll(".feature-card")

    cards.forEach((card, index) => {
      card.addEventListener("mouseenter", () => {
        // Add ripple effect on hover
        const ripple = document.createElement("div")
        ripple.className =
          "absolute inset-0 bg-primary/5 rounded-xl opacity-0 pointer-events-none"
        card.appendChild(ripple)

        gsap.to(ripple, {
          opacity: 1,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        })
      })

      card.addEventListener("mouseleave", () => {
        const ripples = card.querySelectorAll(
          ".absolute.inset-0.bg-primary\\/5"
        )
        ripples.forEach(ripple => {
          gsap.to(ripple, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => ripple.remove()
          })
        })
      })
    })
  }, [mounted])

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
      {/* Enhanced animated background */}
      <AnimatedBackground
        variant="features"
        particleCount={40}
        className="features-background"
      />
      <FloatingElements variant="features" density="low" animated />

      <div className="absolute inset-0 -z-10">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-60" />
        <div className="bg-[radial-gradient(ellipse_at_center,theme(colors.accent/10),transparent_70%)] absolute inset-0" />
      </div>

      <div ref={sectionRef} className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            className="mb-6 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <Zap className="text-primary h-5 w-5" />
            <h2 className="text-primary text-sm font-bold tracking-wider uppercase">
              Everything Included
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <h3 className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">Complete</span> Gas Station
              Management
            </h3>
          </motion.div>

          <motion.p
            className="text-foreground/75 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Everything you need to manage fuel inventory, track sales, and
            optimize operations.
            <span className="text-primary mt-2 block text-base font-medium">
              Trusted by industry leaders worldwide
            </span>
          </motion.p>
        </div>

        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <dl
            id="features-grid"
            className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3 lg:gap-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="feature-card group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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
                    <motion.div
                      className="group-hover:from-primary/20 group-hover:to-secondary/20 from-muted/50 to-muted mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-500"
                      whileHover={{
                        scale: 1.1,
                        rotate: 5
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <feature.icon
                        className="text-primary h-8 w-8 transition-colors duration-500 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </motion.div>

                    {/* Feature name with hover effect */}
                    <dt className="mb-4 flex items-center justify-between">
                      <h4 className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors duration-300">
                        {feature.name}
                      </h4>
                      <motion.div
                        className="text-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        whileHover={{ scale: 1.2, rotate: 45 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }}
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </motion.div>
                    </dt>

                    {/* Enhanced description */}
                    <dd className="text-foreground/70 group-hover:text-foreground/80 text-base leading-relaxed transition-colors duration-300">
                      <p className="relative">
                        {feature.description}
                        {/* Subtle hover accent */}
                        <motion.span
                          className="bg-primary/20 absolute -inset-1 -z-10 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </p>
                    </dd>

                    {/* Progress indicator */}
                    <div className="bg-muted/30 mt-6 h-1 w-full overflow-hidden rounded-full">
                      <motion.div
                        className="from-primary to-secondary h-full bg-gradient-to-r"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: index * 0.2 + 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Interactive particles on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="bg-primary/10 absolute top-4 right-4 h-2 w-2 animate-pulse rounded-full" />
                    <div className="bg-secondary/10 absolute bottom-8 left-6 h-1 w-1 animate-pulse rounded-full delay-150" />
                    <div className="bg-accent/10 absolute right-8 bottom-6 h-1.5 w-1.5 animate-pulse rounded-full delay-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
