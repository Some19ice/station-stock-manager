import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Package,
  Fuel,
  TrendingDown,
  Clock,
  Zap
} from "lucide-react"
import { LowStockAlert } from "@/actions/dashboard"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface LowStockAlertsProps {
  alerts: LowStockAlert[]
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ alerts }) => {
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const formatNumber = (num: string) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(parseFloat(num))
  }

  const getAlertSeverity = (current: string, threshold: string) => {
    const currentNum = parseFloat(current)
    const thresholdNum = parseFloat(threshold)
    const percentage = thresholdNum > 0 ? (currentNum / thresholdNum) * 100 : 0

    if (currentNum === 0) return "critical"
    if (percentage <= 25) return "critical"
    if (percentage <= 50) return "warning"
    return "normal"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600"
      case "warning":
        return "text-amber-600"
      default:
        return "text-gray-600"
    }
  }

  const getRecommendedReorder = (current: string, threshold: string) => {
    const thresholdNum = parseFloat(threshold)
    // Recommended reorder is typically 2x the minimum threshold
    return Math.max(thresholdNum * 2, thresholdNum + 50)
  }

  // Header animation
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [])

  // Alerts entrance animation
  useEffect(() => {
    if (containerRef.current && alerts.length > 0) {
      const alertItems = containerRef.current.children

      gsap.fromTo(
        alertItems,
        {
          opacity: 0,
          x: -30,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.2
        }
      )

      // Add continuous pulse for critical alerts
      Array.from(alertItems).forEach((item, index) => {
        const alert = alerts[index]
        if (
          alert &&
          getAlertSeverity(alert.currentStock, alert.minThreshold) ===
            "critical"
        ) {
          gsap.to(item, {
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
          })
        }
      })
    }
  }, [alerts])

  // Empty state animation
  useEffect(() => {
    if (emptyStateRef.current && alerts.length === 0) {
      const elements = emptyStateRef.current.children
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3
        }
      )
    }
  }, [alerts.length])

  if (alerts.length === 0) {
    return (
      <div className="mb-8">
        <div ref={headerRef} className="mb-4 flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Low Stock Alerts
          </h3>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            All Good
          </Badge>
        </div>
        <Card className="border-chart-1/20 bg-chart-1/5">
          <CardContent className="p-6">
            <div ref={emptyStateRef} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-green-900">
                Excellent Stock Management!
              </h4>
              <p className="text-sm text-green-700">
                All products are above minimum threshold levels
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div ref={headerRef} className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Low Stock Alerts
          </h3>
          <Badge
            variant="destructive"
            className="animate-pulse bg-red-100 text-red-700"
          >
            {alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Updated now</span>
        </div>
      </div>

      <div ref={containerRef} className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => {
          const severity = getAlertSeverity(
            alert.currentStock,
            alert.minThreshold
          )
          const severityColor = getSeverityColor(severity)
          const recommendedReorder = getRecommendedReorder(
            alert.currentStock,
            alert.minThreshold
          )
          const isCritical = severity === "critical"
          const isWarning = severity === "warning"

          return (
            <Card
              key={alert.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden transition-all duration-300",
                "transform-gpu hover:-translate-y-1 hover:shadow-lg",
                isCritical &&
                  "border-destructive/30 bg-destructive/5",
                isWarning &&
                  "border-chart-4/30 bg-chart-4/5",
                hoveredAlert === alert.id && "z-10 scale-[1.02]"
              )}
              onMouseEnter={() => setHoveredAlert(alert.id)}
              onMouseLeave={() => setHoveredAlert(null)}
            >
              {/* Severity indicator strip */}
              <div
                className={cn(
                  "absolute top-0 left-0 h-full w-1 transition-all duration-300",
                  isCritical && "bg-destructive",
                  isWarning && "bg-chart-4",
                  hoveredAlert === alert.id && "w-2"
                )}
              />

              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          "rounded-full p-2 transition-all duration-300",
                          isCritical && "bg-red-100 group-hover:bg-red-200",
                          isWarning && "bg-amber-100 group-hover:bg-amber-200"
                        )}
                      >
                        <AlertTriangle
                          className={cn("h-5 w-5", severityColor)}
                        />
                      </div>
                      {isCritical && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75"></div>
                          <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {alert.name}
                        </h4>
                        <Badge
                          variant={isCritical ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {isCritical
                            ? "Critical"
                            : isWarning
                              ? "Warning"
                              : "Low"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <TrendingDown className="h-3 w-3" />
                          <span>Current: </span>
                          <span className="font-medium">
                            {formatNumber(alert.currentStock)} {alert.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="h-3 w-3" />
                          <span>Min: </span>
                          <span className="font-medium">
                            {formatNumber(alert.minThreshold)} {alert.unit}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "flex items-center gap-1",
                            severityColor
                          )}
                        >
                          <Zap className="h-3 w-3" />
                          <span>Need: </span>
                          <span className="font-medium">
                            {formatNumber(recommendedReorder.toString())}{" "}
                            {alert.unit}
                          </span>
                        </div>
                      </div>

                      {/* Stock level progress bar */}
                      <div className="mt-2">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Stock Level</span>
                          <span className={cn("font-medium", severityColor)}>
                            {Math.round(
                              (parseFloat(alert.currentStock) /
                                parseFloat(alert.minThreshold)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isCritical &&
                                "bg-gradient-to-r from-red-500 to-red-600",
                              isWarning &&
                                "bg-gradient-to-r from-amber-500 to-amber-600"
                            )}
                            style={{
                              width: `${Math.min(100, (parseFloat(alert.currentStock) / parseFloat(alert.minThreshold)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      size="sm"
                      className={cn(
                        "shadow-sm transition-all duration-300",
                        isCritical &&
                          "bg-red-600 hover:scale-105 hover:bg-red-700 hover:shadow-md",
                        isWarning &&
                          "bg-amber-600 hover:scale-105 hover:bg-amber-700 hover:shadow-md"
                      )}
                    >
                      <Link href={`/inventory?product=${alert.id}`}>
                        Restock Now
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
                    "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                    hoveredAlert === alert.id && "opacity-100"
                  )}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {alerts.length > 5 && (
        <Card className="mt-4 border-dashed border-gray-300 bg-gray-50/50 transition-colors hover:bg-gray-100/50">
          <CardContent className="p-4">
            <Button
              asChild
              variant="ghost"
              className="group h-auto w-full py-3 hover:bg-transparent"
            >
              <Link
                href="/inventory?filter=low-stock"
                className="flex items-center justify-center gap-2"
              >
                <Package className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700" />
                <span className="text-gray-700 transition-colors group-hover:text-gray-900">
                  View All {alerts.length} Low Stock Items
                </span>
                <Badge variant="outline" className="bg-white">
                  +{alerts.length - 5}
                </Badge>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
