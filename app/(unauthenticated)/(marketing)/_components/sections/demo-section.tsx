"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import {
  BarChart3,
  Fuel,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Gauge,
  Database,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionWrapper } from "./section-wrapper"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { FloatingElements } from "@/components/ui/floating-elements"
import {
  useAdvancedStagger,
  useMagneticHover,
  useParallax
} from "@/hooks/use-gsap"

interface DemoSectionProps {
  className?: string
}

const mockData = {
  stations: [
    { id: 1, name: "Main St Station", fuel: 85, status: "normal" },
    { id: 2, name: "Highway 101", fuel: 45, status: "low" },
    { id: 3, name: "Downtown Plaza", fuel: 92, status: "normal" },
    { id: 4, name: "Airport Junction", fuel: 78, status: "normal" }
  ],
  sales: [
    { month: "Jan", revenue: 45000, fuel: 35000, products: 10000 },
    { month: "Feb", revenue: 52000, fuel: 41000, products: 11000 },
    { month: "Mar", revenue: 48000, fuel: 38000, products: 10000 },
    { month: "Apr", revenue: 61000, fuel: 48000, products: 13000 }
  ],
  alerts: [
    { type: "low-fuel", station: "Highway 101", severity: "warning" },
    { type: "delivery", station: "Main St Station", severity: "info" },
    { type: "maintenance", station: "Downtown Plaza", severity: "normal" }
  ]
}

const features = [
  {
    id: "monitoring",
    title: "Real-time Monitoring",
    icon: Gauge,
    color: "primary",
    description: "Live fuel levels and alerts"
  },
  {
    id: "analytics",
    title: "Sales Analytics",
    icon: TrendingUp,
    color: "secondary",
    description: "Revenue tracking and insights"
  },
  {
    id: "inventory",
    title: "Inventory Management",
    icon: Database,
    color: "accent",
    description: "Stock levels and automated ordering"
  },
  {
    id: "compliance",
    title: "Compliance Reports",
    icon: Shield,
    color: "primary",
    description: "Regulatory reporting made simple"
  }
]

export function DemoSection({ className = "" }: DemoSectionProps) {
  const [activeFeature, setActiveFeature] = useState("monitoring")
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Enhanced GSAP animations
  useAdvancedStagger("#demo-features", ".feature-tab", { stagger: 0.1 })
  useMagneticHover(".demo-button", 0.15)
  useParallax(".demo-background", 0.2)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !dashboardRef.current || !isPlaying) return

    // Continuous dashboard animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    // Animate fuel gauges
    tl.to(".fuel-gauge", {
      rotation: () => Math.random() * 30 - 15,
      duration: 2,
      stagger: 0.2,
      ease: "power2.inOut"
    })
      .to(
        ".chart-bar",
        {
          scaleY: () => 0.3 + Math.random() * 0.7,
          duration: 1.5,
          stagger: 0.1,
          ease: "power2.inOut"
        },
        "-=1"
      )
      .to(
        ".metric-number",
        {
          textContent: () => Math.floor(Math.random() * 1000) + 500,
          duration: 0.5,
          stagger: 0.1
        },
        "-=1"
      )

    return () => {
      tl.kill()
    }
  }, [mounted, isPlaying, activeFeature])

  useEffect(() => {
    // Feature switching animations
    if (!mounted || !dashboardRef.current) return

    gsap.fromTo(
      ".dashboard-content",
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }
    )
  }, [mounted, activeFeature])

  const startDemo = () => {
    setIsPlaying(true)

    // Cycle through features automatically
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
      const nextFeature = features[animationPhase % features.length]
      setActiveFeature(nextFeature.id)
    }, 3000)

    // Stop after full cycle
    setTimeout(() => {
      setIsPlaying(false)
      clearInterval(interval)
    }, 15000)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setAnimationPhase(0)
    setActiveFeature("monitoring")
  }

  if (!mounted) {
    return (
      <SectionWrapper
        className={`relative overflow-hidden py-20 ${className}`}
        id="demo"
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-primary">Interactive Demo</span>
            </h2>
            <p className="text-foreground/75 mt-6 text-lg leading-relaxed sm:text-xl">
              Experience the power of real-time gas station management.
            </p>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  const renderDashboard = () => {
    switch (activeFeature) {
      case "monitoring":
        return (
          <div className="dashboard-content space-y-6">
            <h3 className="text-xl font-bold">Live Fuel Monitoring</h3>
            <div className="grid grid-cols-2 gap-4">
              {mockData.stations.map((station, index) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg border p-4 ${
                    station.status === "low"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-green-500 bg-green-50 dark:bg-green-900/20"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{station.name}</span>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="fuel-gauge relative h-8 w-8">
                      <Fuel className="h-8 w-8 text-blue-500" />
                      <span className="metric-number absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {station.fuel}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div
                          className={`h-full rounded-full ${
                            station.fuel < 50 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${station.fuel}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="space-y-2">
              {mockData.alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-card flex items-center gap-3 rounded-lg p-3"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    {alert.type === "low-fuel" && "Low fuel alert: "}
                    {alert.type === "delivery" && "Scheduled delivery: "}
                    {alert.type === "maintenance" && "Maintenance due: "}
                    <strong>{alert.station}</strong>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case "analytics":
        return (
          <div className="dashboard-content space-y-6">
            <h3 className="text-xl font-bold">Sales Analytics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-foreground/60 text-sm">Revenue</span>
                </div>
                <div className="metric-number mt-2 text-2xl font-bold">
                  $52,000
                </div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-blue-500" />
                  <span className="text-foreground/60 text-sm">Fuel Sales</span>
                </div>
                <div className="metric-number mt-2 text-2xl font-bold">
                  $41,000
                </div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="text-foreground/60 text-sm">Products</span>
                </div>
                <div className="metric-number mt-2 text-2xl font-bold">
                  $11,000
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4">
              <h4 className="mb-4 font-semibold">Monthly Revenue Trend</h4>
              <div className="flex h-32 items-end justify-between gap-2">
                {mockData.sales.map((data, index) => (
                  <div
                    key={data.month}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.div
                      className="chart-bar from-primary to-secondary w-8 rounded-t bg-gradient-to-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.revenue / 70000) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                    <span className="text-foreground/60 text-xs">
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "inventory":
        return (
          <div className="dashboard-content space-y-6">
            <h3 className="text-xl font-bold">Inventory Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Regular Unleaded</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">8,500 gal</div>
                  <div className="text-foreground/60 text-sm">85% capacity</div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Premium Unleaded</span>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">3,200 gal</div>
                  <div className="text-foreground/60 text-sm">32% capacity</div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Diesel</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">6,800 gal</div>
                  <div className="text-foreground/60 text-sm">68% capacity</div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Motor Oil (5W-30)</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">145 qt</div>
                  <div className="text-foreground/60 text-sm">In stock</div>
                </div>
              </div>
            </div>
          </div>
        )

      case "compliance":
        return (
          <div className="dashboard-content space-y-6">
            <h3 className="text-xl font-bold">Compliance Dashboard</h3>
            <div className="space-y-4">
              <div className="bg-card flex items-center justify-between rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Environmental Compliance</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="bg-card flex items-center justify-between rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Monthly Tax Report</span>
                </div>
                <span className="text-foreground/60 text-sm">
                  Due in 5 days
                </span>
              </div>
              <div className="bg-card flex items-center justify-between rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Safety Training</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <SectionWrapper
      className={`relative overflow-hidden py-20 ${className}`}
      id="demo"
    >
      {/* Animated background */}
      <AnimatedBackground
        variant="features"
        particleCount={30}
        className="demo-background"
      />
      <FloatingElements variant="dashboard" density="low" animated />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary">Interactive Demo</span>
          </motion.h2>
          <motion.p
            className="text-foreground/75 mt-6 text-lg leading-relaxed sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Experience the power of real-time gas station management. Click
            through the features or watch the automated demo.
          </motion.p>
        </div>

        {/* Demo controls */}
        <motion.div
          className="mt-12 flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={startDemo}
            disabled={isPlaying}
            className="demo-button group bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            {isPlaying ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? "Running..." : "Start Demo"}
          </Button>
          <Button onClick={resetDemo} variant="outline" className="demo-button">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </motion.div>

        {/* Feature tabs */}
        <div id="demo-features" className="mt-16">
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                className={`feature-tab group flex items-center gap-3 rounded-xl px-6 py-4 transition-all duration-300 ${
                  activeFeature === feature.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-card hover:bg-card/80 text-foreground hover:shadow-md"
                }`}
                onClick={() => !isPlaying && setActiveFeature(feature.id)}
                disabled={isPlaying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <feature.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{feature.title}</div>
                  <div className="text-xs opacity-80">
                    {feature.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Demo dashboard */}
        <motion.div
          ref={dashboardRef}
          className="bg-background/80 border-border/50 mx-auto mt-12 max-w-4xl rounded-2xl border p-8 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderDashboard()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-20 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <BarChart3 className="text-primary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Live Dashboard</h3>
            <p className="text-foreground/70">
              Real-time monitoring of all stations with instant alerts and
              notifications.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-secondary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <TrendingUp className="text-secondary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Smart Analytics</h3>
            <p className="text-foreground/70">
              Advanced reporting and insights to optimize your operations and
              profitability.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-accent/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Shield className="text-accent h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Compliance Ready</h3>
            <p className="text-foreground/70">
              Automated compliance reporting and regulatory management made
              simple.
            </p>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
