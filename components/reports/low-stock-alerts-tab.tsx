"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLowStockAlerts, type LowStockAlert } from "@/actions/reports"
import { useStationAuth } from "@/hooks/use-station-auth"
import { toast } from "sonner"
import {
  Loader2,
  Download,
  Printer,
  AlertTriangle,
  Package,
  RefreshCw,
  ShoppingCart
} from "lucide-react"

export function LowStockAlertsTab() {
  const { user } = useStationAuth()
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAlerts = useCallback(async () => {
    if (!user?.stationId) {
      toast.error("Station information not found")
      return
    }

    setIsLoading(true)
    try {
      const result = await getLowStockAlerts(user.stationId)

      if (result.isSuccess && result.data) {
        setAlerts(result.data)
        setLastUpdated(new Date())
        if (result.data.length > 0) {
          toast.success(`Found ${result.data.length} low stock alert(s)`)
        }
      } else {
        toast.error(result.error || "Failed to fetch low stock alerts")
      }
    } catch (error) {
      toast.error("An error occurred while fetching alerts")
    } finally {
      setIsLoading(false)
    }
  }, [user?.stationId])

  // Auto-fetch on component mount
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (alerts.length === 0) return

    const csvContent = generateCSVContent(alerts)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `low-stock-alerts-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStockStatus = (currentStock: string, minThreshold: string) => {
    const current = parseFloat(currentStock)
    const threshold = parseFloat(minThreshold)
    const percentage = (current / threshold) * 100

    if (current === 0) {
      return {
        status: "out-of-stock",
        color: "bg-red-500",
        text: "Out of Stock"
      }
    } else if (percentage <= 50) {
      return { status: "critical", color: "bg-red-500", text: "Critical" }
    } else if (percentage <= 100) {
      return { status: "low", color: "bg-yellow-500", text: "Low Stock" }
    }
    return { status: "normal", color: "bg-green-500", text: "Normal" }
  }

  const getTotalReorderValue = () => {
    return alerts.reduce((total, alert) => {
      // Estimate reorder cost (reorder quantity * estimated unit price)
      const reorderQty = parseFloat(alert.reorderQuantity)
      // For estimation, assume unit price is similar to current market rates
      const estimatedUnitPrice = alert.type === "pms" ? 650 : 2500 // Rough estimates
      return total + reorderQty * estimatedUnitPrice
    }, 0)
  }

  const criticalAlerts = alerts.filter(
    alert => parseFloat(alert.currentStock) === 0
  )
  const lowStockAlerts = alerts.filter(
    alert => parseFloat(alert.currentStock) > 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          {lastUpdated && (
            <p className="text-muted-foreground text-sm">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {alerts.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-muted-foreground text-sm">Critical Alerts</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {criticalAlerts.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-yellow-600" />
              <p className="text-muted-foreground text-sm">Low Stock Items</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {lowStockAlerts.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-muted-foreground text-sm">Total Alerts</p>
            </div>
            <p className="text-2xl font-bold">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              <p className="text-muted-foreground text-sm">Est. Reorder Cost</p>
            </div>
            <p className="text-lg font-bold text-green-600">
              ₦{getTotalReorderValue().toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading stock alerts...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && alerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-green-600">
              All Stock Levels Good!
            </h3>
            <p className="text-muted-foreground">
              No products are currently below their minimum stock thresholds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgent:</strong> {criticalAlerts.length} product(s) are
            completely out of stock and need immediate restocking.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts List */}
      {alerts.length > 0 && (
        <div className="space-y-6 print:space-y-4">
          {criticalAlerts.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Critical - Out of Stock
                </CardTitle>
                <CardDescription>
                  These products require immediate restocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts.map(alert => (
                    <AlertCard key={alert.productId} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockAlerts.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Package className="h-5 w-5" />
                  Low Stock Warnings
                </CardTitle>
                <CardDescription>
                  These products are below minimum threshold and should be
                  restocked soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockAlerts.map(alert => (
                    <AlertCard key={alert.productId} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert }: { alert: LowStockAlert }) {
  const stockStatus = getStockStatus(alert.currentStock, alert.minThreshold)

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{alert.productName}</h4>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {alert.type.toUpperCase()}
            </Badge>
            {alert.brand !== "N/A" && (
              <Badge variant="secondary" className="text-xs">
                {alert.brand}
              </Badge>
            )}
          </div>
        </div>
        <Badge className={`${stockStatus.color} text-white`}>
          {stockStatus.text}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Current Stock</p>
          <p className="font-medium">
            {parseFloat(alert.currentStock).toLocaleString()} {alert.unit}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Min Threshold</p>
          <p className="font-medium">
            {parseFloat(alert.minThreshold).toLocaleString()} {alert.unit}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Recommended Reorder</p>
          <p className="font-medium text-blue-600">
            {parseFloat(alert.reorderQuantity).toLocaleString()} {alert.unit}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Stock Level</p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${stockStatus.color}`}
                style={{
                  width: `${Math.min(100, (parseFloat(alert.currentStock) / parseFloat(alert.minThreshold)) * 100)}%`
                }}
              />
            </div>
            <span className="text-xs">
              {Math.round(
                (parseFloat(alert.currentStock) /
                  parseFloat(alert.minThreshold)) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStockStatus(currentStock: string, minThreshold: string) {
  const current = parseFloat(currentStock)
  const threshold = parseFloat(minThreshold)
  const percentage = (current / threshold) * 100

  if (current === 0) {
    return { status: "out-of-stock", color: "bg-red-500", text: "Out of Stock" }
  } else if (percentage <= 50) {
    return { status: "critical", color: "bg-red-500", text: "Critical" }
  } else if (percentage <= 100) {
    return { status: "low", color: "bg-yellow-500", text: "Low Stock" }
  }
  return { status: "normal", color: "bg-green-500", text: "Normal" }
}

function generateCSVContent(alerts: LowStockAlert[]): string {
  const lines = [
    `Low Stock Alerts - ${new Date().toLocaleDateString()}`,
    "",
    "Product Name,Brand,Type,Current Stock,Min Threshold,Recommended Reorder,Unit,Status"
  ]

  alerts.forEach(alert => {
    const status = getStockStatus(alert.currentStock, alert.minThreshold)
    lines.push(
      `${alert.productName},${alert.brand},${alert.type},${alert.currentStock},${alert.minThreshold},${alert.reorderQuantity},${alert.unit},${status.text}`
    )
  })

  return lines.join("\n")
}
