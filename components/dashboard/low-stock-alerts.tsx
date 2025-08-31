import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Fuel } from "lucide-react"
import { LowStockAlert } from "@/actions/dashboard"
import Link from "next/link"

interface LowStockAlertsProps {
  alerts: LowStockAlert[]
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ alerts }) => {
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

  if (alerts.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Low Stock Alerts
        </h3>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">
              All products are above minimum threshold
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Low Stock Alerts
      </h3>
      <div className="space-y-3">
        {alerts.slice(0, 5).map(alert => {
          const severity = getAlertSeverity(
            alert.currentStock,
            alert.minThreshold
          )
          const severityColor = getSeverityColor(severity)
          const recommendedReorder = getRecommendedReorder(
            alert.currentStock,
            alert.minThreshold
          )

          return (
            <div
              key={alert.id}
              className="rounded-lg border border-red-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${severityColor}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                      <span>
                        Current: {formatNumber(alert.currentStock)} {alert.unit}
                      </span>
                      <span>
                        Min: {formatNumber(alert.minThreshold)} {alert.unit}
                      </span>
                      <span className={severityColor}>
                        Recommended:{" "}
                        {formatNumber(recommendedReorder.toString())}{" "}
                        {alert.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <Link href={`/inventory?product=${alert.id}`}>Restock</Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/inventory?filter=low-stock">
              View All {alerts.length} Low Stock Items
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
