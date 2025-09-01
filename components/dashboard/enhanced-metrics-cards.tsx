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
  Zap,
  AlertCircle,
  BarChart3,
  Sparkles
} from "lucide-react"
import { DashboardMetrics } from "@/actions/dashboard"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EnhancedMetricsCardsProps {
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

    // Enhanced entrance animation
    gsap.fromTo(
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
    const obj = { value: 0 }
    gsap.to(obj, {
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
        gsap.to(containerRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }
    })
  }, [value, delay])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div ref={numberRef} className="font-bold text-2xl lg:text-3xl">
        0
      </div>
      {priority === "high" && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
      )}
    </div>
  )
}

function TrendIndicator({ 
  trend, 
  value, 
  className 
}: { 
  trend: "up" | "down" | "neutral"
  value: string
  className?: string 
}) {
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
    <motion.div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium",
        colors[trend],
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="h-3 w-3" />
      <span>{value}</span>
    </motion.div>
  )
}

export function EnhancedMetricsCards({ 
  metrics, 
  onRetry, 
  isRefreshing = false 
}: EnhancedMetricsCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const metricCards = [
    {
      title: "Total Sales",
      value: `₦${(metrics.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: (metrics.salesTrend || 0) > 0 ? "up" : (metrics.salesTrend || 0) < 0 ? "down" : "neutral" as const,
      trendValue: `${Math.abs(metrics.salesTrend || 0)}%`,
      variant: "metric" as const,
      priority: "high" as const,
      bgColor: "bg-chart-1/10"
    },
    {
      title: "Transactions",
      value: (metrics.totalTransactions || 0).toString(),
      icon: ShoppingCart,
      trend: (metrics.transactionsTrend || 0) > 0 ? "up" : (metrics.transactionsTrend || 0) < 0 ? "down" : "neutral" as const,
      trendValue: `${Math.abs(metrics.transactionsTrend || 0)}%`,
      variant: "metric" as const,
      priority: "normal" as const,
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Low Stock Items",
      value: (metrics.lowStockCount || 0).toString(),
      icon: Package,
      trend: (metrics.lowStockCount || 0) > 5 ? "down" : "up" as const,
      trendValue: `${metrics.lowStockCount || 0} items`,
      variant: (metrics.lowStockCount || 0) > 5 ? "alert" : "metric" as const,
      priority: (metrics.lowStockCount || 0) > 5 ? "high" : "normal" as const,
      bgColor: "bg-chart-3/10"
    },
    {
      title: "Active Staff",
      value: (metrics.activeStaff || 0).toString(),
      icon: Users,
      trend: "neutral" as const,
      trendValue: "Online",
      variant: "metric" as const,
      priority: "normal" as const,
      bgColor: "bg-chart-4/10"
    }
  ]

  return (
    <div ref={containerRef} className="mb-8">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <BarChart3 className="h-6 w-6 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">
            Key Metrics
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRefreshing}
          className="hover:bg-accent/50 transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          
          return (
            <EnhancedCard
              key={metric.title}
              variant={metric.variant}
              hover={true}
              glow={metric.priority === "high"}
              magnetic={true}
              delay={index}
              className={cn(
                "relative overflow-hidden",
                metric.bgColor
              )}
            >
              <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <EnhancedCardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </EnhancedCardTitle>
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </EnhancedCardHeader>
              
              <EnhancedCardContent>
                <AnimatedNumber
                  value={metric.value}
                  delay={index}
                  priority={metric.priority}
                  className="mb-3"
                />
                
                <div className="flex items-center justify-between">
                  <TrendIndicator
                    trend={metric.trend}
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
                <div className="absolute inset-0 bg-primary/10" />
              </div>
            </EnhancedCard>
          )
        })}
      </div>
    </div>
  )
}
