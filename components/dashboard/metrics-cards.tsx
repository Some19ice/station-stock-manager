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
  RefreshCw
} from "lucide-react"
import { DashboardMetrics } from "@/actions/dashboard"

interface MetricsCardsProps {
  metrics: DashboardMetrics
  onRetry?: () => void
  isRefreshing?: boolean
}

export function MetricsCards({ metrics, onRetry, isRefreshing }: MetricsCardsProps) {
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
      trend: change > 0 ? "up" as const : change < 0 ? "down" as const : "neutral" as const
    }
  }

  const TrendIcon = ({ trend, className }: { trend: "up" | "down" | "neutral", className?: string }) => {
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
      case "up": return "text-green-600"
      case "down": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  // Mock historical data - replace with real data
  const salesTrend = getTrendData(parseFloat(metrics.todaysSales.totalValue), 45000)
  const transactionTrend = getTrendData(metrics.todaysSales.transactionCount, 38)
  const stockTrend = getTrendData(metrics.stockStatus.totalProducts, metrics.stockStatus.totalProducts + 2)

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
      subtitle: metrics.stockStatus.lowStockCount > 0 ? `${metrics.stockStatus.lowStockCount} low` : "Products"
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

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Key Metrics</h2>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric) => {
          const Icon = metric.icon
          const isHighPriority = metric.priority === "high"
          
          return (
            <Card 
              key={metric.title} 
              className={`transition-all hover:shadow-md ${
                isHighPriority ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${isHighPriority ? 'text-blue-600' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isHighPriority ? 'text-blue-900' : 'text-gray-900'}`}>
                  {metric.value}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendIcon trend={metric.trend.trend} />
                    <span className={`ml-1 text-xs ${getTrendColor(metric.trend.trend)}`}>
                      {metric.trend.change > 0 ? "+" : ""}{metric.trend.change}%
                    </span>
                  </div>
                  {metric.subtitle && (
                    <span className={`text-xs ${
                      metric.subtitle.includes('low') ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    }`}>
                      {metric.subtitle}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}