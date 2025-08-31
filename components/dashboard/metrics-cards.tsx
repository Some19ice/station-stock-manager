import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  RefreshCw,
  Zap,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { DashboardMetrics } from "@/actions/dashboard"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  metrics: DashboardMetrics
  onRetry?: () => void
  isRefreshing?: boolean
}

function AnimatedNumber({
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

  useEffect(() => {
    if (!numberRef.current || !containerRef.current) return

    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""))
    if (isNaN(numericValue)) return

    // Initial scale animation
    gsap.fromTo(
      containerRef.current,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        delay: delay * 0.1,
        ease: "back.out(1.7)"
      }
    )

    // Number counting animation
    const obj = { value: 0 }
    gsap.to(obj, {
      value: numericValue,
      duration: 2 + delay * 0.1,
      delay: delay * 0.1,
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
        // Subtle bounce on completion for high priority items
        if (priority === "high") {
          gsap.to(containerRef.current, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          })
        }
      }
    })

    // Pulsing effect for high priority numbers
    if (priority === "high") {
      gsap.to(containerRef.current, {
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        duration: 2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      })
    }
  }, [value, delay, priority])

  return (
    <div ref={containerRef} className="relative">
      <div ref={numberRef} className={className}>
        0
      </div>
    </div>
  )
}

export function MetricsCards({
  metrics,
  onRetry,
  isRefreshing
}: MetricsCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount))
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-NG").format(num)
  }

  // Calculate real trends from historical data
  const getTrendData = (current: number, previous: number) => {
    if (previous === 0) return { change: 0, trend: "neutral" as const }
    const change = ((current - previous) / previous) * 100
    return {
      change: Math.round(change * 10) / 10,
      trend:
        change > 0
          ? ("up" as const)
          : change < 0
            ? ("down" as const)
            : ("neutral" as const)
    }
  }

  const TrendIcon = ({
    trend,
    className
  }: {
    trend: "up" | "down" | "neutral"
    className?: string
  }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className={`h-4 w-4 text-green-600 ${className}`} />
      case "down":
        return <TrendingDown className={`h-4 w-4 text-red-600 ${className}`} />
      default:
        return <Minus className={`h-4 w-4 text-gray-600 ${className}`} />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Mock historical data - replace with real data
  const salesTrend = getTrendData(
    parseFloat(metrics.todaysSales.totalValue),
    45000
  )
  const transactionTrend = getTrendData(
    metrics.todaysSales.transactionCount,
    38
  )
  const stockTrend = getTrendData(
    metrics.stockStatus.totalProducts,
    metrics.stockStatus.totalProducts + 2
  )

  const metricsData = [
    {
      title: "Today's Sales",
      value: formatCurrency(metrics.todaysSales.totalValue),
      icon: DollarSign,
      trend: salesTrend,
      priority: "high"
    },
    {
      title: "Active Stock",
      value: formatNumber(metrics.stockStatus.totalProducts),
      icon: Package,
      trend: stockTrend,
      priority: metrics.stockStatus.lowStockCount > 0 ? "high" : "normal",
      subtitle:
        metrics.stockStatus.lowStockCount > 0
          ? `${metrics.stockStatus.lowStockCount} low`
          : "Products"
    },
    {
      title: "Transactions",
      value: formatNumber(metrics.todaysSales.transactionCount),
      icon: ShoppingCart,
      trend: transactionTrend,
      priority: "normal"
    },
    {
      title: "Staff Active",
      value: formatNumber(metrics.staffActivity.activeStaffCount),
      icon: Users,
      trend: { change: 0, trend: "neutral" as const },
      priority: "normal",
      subtitle: `of ${formatNumber(metrics.staffActivity.totalStaff)} total`
    }
  ]

  // Header animation effect
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    }
  }, [])

  // Cards container entrance animation
  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.children
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
          rotationY: 15
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2
        }
      )
    }
  }, [])

  return (
    <div className="mb-8">
      <div ref={headerRef} className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Key Metrics</h2>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <BarChart3 className="h-3 w-3 text-blue-600" />
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRefreshing}
            className="h-8 transition-all hover:scale-105"
          >
            <RefreshCw
              className={`mr-1 h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        )}
      </div>

      <div
        ref={cardsContainerRef}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {metricsData.map((metric, index) => {
          const Icon = metric.icon
          const isHighPriority = metric.priority === "high"

          return (
            <div
              key={metric.title}
              className="group relative"
              onMouseEnter={() => setHoveredCard(metric.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10",
                  "transform-gpu cursor-pointer",
                  isHighPriority &&
                    "bg-gradient-to-br from-blue-50/50 to-indigo-50/30 ring-2 ring-blue-200/50",
                  hoveredCard === metric.title && "z-10 scale-[1.02]"
                )}
              >
                {/* Priority indicator pulse */}
                {isHighPriority && (
                  <div className="absolute top-2 right-2">
                    <div className="relative">
                      <Zap className="h-3 w-3 animate-pulse text-blue-500" />
                      <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-30" />
                    </div>
                  </div>
                )}

                {/* Animated background gradient */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5",
                    hoveredCard === metric.title && "opacity-100"
                  )}
                />

                <CardContent className="relative z-10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "rounded-lg p-2 transition-all duration-300",
                          isHighPriority
                            ? "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-muted-foreground text-sm font-medium">
                        {metric.title}
                      </span>
                    </div>

                    {/* Status indicator for high priority items */}
                    {metric.subtitle?.includes("low") && (
                      <AlertCircle className="h-4 w-4 animate-pulse text-red-500" />
                    )}
                  </div>

                  <AnimatedNumber
                    value={metric.value}
                    delay={index}
                    priority={metric.priority as "high" | "normal"}
                    className={cn(
                      "mb-2 text-3xl font-bold transition-colors duration-300",
                      isHighPriority ? "text-blue-900" : "text-gray-900",
                      hoveredCard === metric.title && "text-blue-600"
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendIcon trend={metric.trend.trend} />
                      <span
                        className={cn(
                          "text-xs font-medium transition-all duration-300",
                          getTrendColor(metric.trend.trend),
                          hoveredCard === metric.title && "scale-110"
                        )}
                      >
                        {metric.trend.change > 0 ? "+" : ""}
                        {metric.trend.change}%
                      </span>
                    </div>
                    {metric.subtitle && (
                      <span
                        className={cn(
                          "text-xs transition-colors duration-300",
                          metric.subtitle.includes("low")
                            ? "animate-pulse font-medium text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {metric.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Hover effect underline */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300",
                      hoveredCard === metric.title ? "w-full" : "w-0"
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Floating action hint for high priority items */}
      {metricsData.some(m => m.priority === "high") && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-600">
            <Zap className="h-3 w-3 animate-pulse" />
            <span>High priority items require attention</span>
          </div>
        </div>
      )}
    </div>
  )
}
