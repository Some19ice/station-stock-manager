import React from "react"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle
} from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  RefreshCw,
  BarChart3,
  Sparkles
} from "lucide-react"
import { DashboardMetrics } from "@/actions/dashboard"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface EnhancedMetricsCardsProps {
  metrics: DashboardMetrics
  onRetry?: () => void
  isRefreshing?: boolean
}

const AnimatedNumber = React.memo(function AnimatedNumber({
  value,
  className,
  delay = 0,
  priority = "normal"
}: {
  value: string
  className?: string
  delay?: number
  priority?: "high" | "normal"
}) {
  const numberRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sparkleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!numberRef.current || !containerRef.current) return

    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
    if (isNaN(numericValue)) return

    const tl = gsap.timeline()
    const obj = { value: 0 }

    // Enhanced entrance animation
    tl.fromTo(
      containerRef.current,
      { scale: 0.8, opacity: 0, rotationY: 15 },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 0.8,
        delay: delay * 0.1,
        ease: "back.out(1.4)"
      }
    )

    // Smooth number counting animation
    tl.to(
      obj,
      {
        value: numericValue,
        duration: 2.5 + delay * 0.1,
        delay: delay * 0.15,
        ease: "power2.out",
        onUpdate: () => {
          if (numberRef.current) {
            const formatted = value.includes("₦")
              ? new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0
                }).format(obj.value)
              : Math.round(obj.value).toLocaleString()
            numberRef.current.textContent = formatted
          }
        },
        onComplete: () => {
          // Subtle completion pulse
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              scale: 1.05,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut"
            })
          }
        }
      },
      0
    )

    // Sparkle animation for high priority items
    if (priority === "high" && sparkleRef.current) {
      gsap.to(sparkleRef.current, {
        scale: 1.2,
        rotation: 360,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      })
    }

    return () => {
      tl.kill()
    }
  }, [value, delay, priority])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div ref={numberRef} className="text-2xl font-bold lg:text-3xl">
        0
      </div>
      {priority === "high" && (
        <div ref={sparkleRef} className="absolute -top-1 -right-1">
          <Sparkles className="text-primary h-4 w-4" />
        </div>
      )}
    </div>
  )
})

const TrendIndicator = React.memo(function TrendIndicator({
  trend,
  value,
  className
}: {
  trend: "up" | "down" | "neutral"
  value: string
  className?: string
}) {
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!indicatorRef.current) return

    const handleMouseEnter = () => {
      gsap.to(indicatorRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(indicatorRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const element = indicatorRef.current
    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  }

  const colors = {
    up: "text-green-600 bg-green-50 border-green-200",
    down: "text-red-600 bg-red-50 border-red-200",
    neutral: "text-gray-600 bg-gray-50 border-gray-200"
  }

  const Icon = icons[trend]

  return (
    <div
      ref={indicatorRef}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium cursor-pointer",
        colors[trend],
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{value}</span>
    </div>
  )
})

export const EnhancedMetricsCards = React.memo(function EnhancedMetricsCards({
  metrics,
  onRetry,
  isRefreshing = false
}: EnhancedMetricsCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
  }, [])

  const handleIconHover = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  const handleIconLeave = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  const metricCards = [
    {
      title: "Today's Revenue",
      value: `₦${parseFloat(metrics.todaysSales.totalValue || "0").toLocaleString()}`,
      icon: DollarSign,
      trend: "neutral" as const,
      trendValue: "Cash in Hand",
      variant: "metric" as const,
      priority: "high" as const,
      bgColor: "bg-green-950/20 border-green-500/20"
    },
    {
      title: "Transactions",
      value: (metrics.todaysSales.transactionCount || 0).toString(),
      icon: ShoppingCart,
      trend: "neutral" as const,
      trendValue: "Today",
      variant: "metric" as const,
      priority: "normal" as const,
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Stock Variance",
      value: (metrics.stockStatus.lowStockCount || 0).toString(),
      icon: Package,
      trend: ((metrics.stockStatus.lowStockCount || 0) > 3 ? "down" : "neutral") as "up" | "down" | "neutral",
      trendValue: ((metrics.stockStatus.lowStockCount || 0) > 3 ? "Variance Detected" : (metrics.stockStatus.lowStockCount || 0) > 0 ? `${metrics.stockStatus.lowStockCount} items low` : "All Secure"),
      variant:
        ((metrics.stockStatus.lowStockCount || 0) > 3 ? "alert" : "metric") as "default" | "metric" | "alert" | "feature",
      priority:
        ((metrics.stockStatus.lowStockCount || 0) > 3 ? "high" : "normal") as "high" | "normal",
      bgColor: ((metrics.stockStatus.lowStockCount || 0) > 3 ? "bg-red-950/20 border-red-500/50" : "bg-chart-3/10")
    },
    {
      title: "Staff on Duty",
      value: (metrics.staffActivity.activeStaffCount || 0).toString(),
      icon: Users,
      trend: "neutral" as const,
      trendValue: "Accountability Log",
      variant: "metric" as const,
      priority: "normal" as const,
      bgColor: "bg-chart-4/10"
    }
  ]

  return (
    <div ref={containerRef} className="mb-8">
      <div ref={headerRef} className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            ref={iconRef}
            onMouseEnter={handleIconHover}
            onMouseLeave={handleIconLeave}
            className="cursor-pointer"
          >
            <BarChart3 className="text-primary h-6 w-6" />
          </div>
          <h2 className="text-foreground text-2xl font-bold">Key Metrics</h2>
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRefreshing}
            className="hover:bg-accent/50 transition-colors"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon

          return (
            <MetricCard
              key={metric.title}
              metric={metric}
              Icon={Icon}
              index={index}
            />
          )
        })}
      </div>
    </div>
  )
})

const MetricCard = React.memo(function MetricCard({
  metric,
  Icon,
  index
}: {
  metric: {
    title: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    trend: "up" | "down" | "neutral"
    trendValue: string
    variant: "default" | "metric" | "alert" | "feature"
    priority: "high" | "normal"
    bgColor: string
  }
  Icon: React.ComponentType<{ className?: string }>
  index: number
}) {
  const iconRef = useRef<HTMLDivElement>(null)

  const handleIconHover = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.1,
        rotation: 5,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }

  const handleIconLeave = () => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }

  return (
    <EnhancedCard
      variant={metric.variant as "default" | "metric" | "alert" | "feature"}
      hover={true}
      glow={metric.priority === "high"}
      magnetic={true}
      delay={index}
      className={cn("relative overflow-hidden", metric.bgColor)}
    >
      <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <EnhancedCardTitle className="text-muted-foreground text-sm font-medium">
          {metric.title}
        </EnhancedCardTitle>
        <div
          ref={iconRef}
          onMouseEnter={handleIconHover}
          onMouseLeave={handleIconLeave}
          className="cursor-pointer"
        >
          <Icon className="text-muted-foreground h-5 w-5" />
        </div>
      </EnhancedCardHeader>

      <EnhancedCardContent>
        <AnimatedNumber
          value={metric.value}
          delay={index}
          priority={metric.priority as "high" | "normal"}
          className="mb-3"
        />

        <div className="flex items-center justify-between">
          <TrendIndicator
            trend={metric.trend as "up" | "down" | "neutral"}
            value={metric.trendValue}
          />

          {metric.priority === "high" && (
            <Badge variant="secondary" className="text-xs">
              Priority
            </Badge>
          )}
        </div>
      </EnhancedCardContent>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-primary/10 absolute inset-0" />
      </div>
    </EnhancedCard>
  )
})
