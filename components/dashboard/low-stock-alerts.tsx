import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Fuel } from "lucide-react"
import { LowStockAlert } from "@/actions/dashboard"
import Link from "next/link"

interface LowStockAlertsProps {
  alerts: LowStockAlert[]
}

export function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(parseFloat(num))
  }

  const getStockPercentage = (current: string, threshold: string) => {
    const currentNum = parseFloat(current)
    const thresholdNum = parseFloat(threshold)
    if (thresholdNum === 0) return 0
    return Math.round((currentNum / thresholdNum) * 100)
  }

  const getAlertSeverity = (current: string, threshold: string) => {
    const percentage = getStockPercentage(current, threshold)
    if (percentage === 0) return "critical"
    if (percentage <= 50) return "high"
    return "medium"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Package className="h-5 w-5" />
            Stock Status
          </CardTitle>
          <CardDescription>
            All products are above minimum threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No low stock alerts at this time. Great job maintaining inventory levels!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts ({alerts.length})
        </CardTitle>
        <CardDescription>
          Products that need immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const severity = getAlertSeverity(alert.currentStock, alert.minThreshold)
            const percentage = getStockPercentage(alert.currentStock, alert.minThreshold)
            
            return (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {alert.type === "pms" ? (
                      <Fuel className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Package className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {alert.name}
                      </p>
                      {alert.brand && (
                        <Badge variant="outline" className="text-xs">
                          {alert.brand}
                        </Badge>
                      )}
                      <Badge 
                        variant={getSeverityColor(severity) as "default" | "secondary" | "destructive" | "outline"}
                        className="text-xs"
                      >
                        {percentage}% of threshold
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>
                        Current: {formatNumber(alert.currentStock)} {alert.unit}
                      </span>
                      <span>
                        Min: {formatNumber(alert.minThreshold)} {alert.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                  >
                    <Link href={`/dashboard/inventory?product=${alert.id}`}>
                      Restock
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        
        {alerts.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/inventory?filter=low-stock">
                View All Low Stock Items
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}