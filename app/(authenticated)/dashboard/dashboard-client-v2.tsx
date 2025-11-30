"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, Package, Users, DollarSign, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { getDashboardMetrics, getLowStockAlerts, getRecentTransactions } from "@/actions/dashboard"
import type { DashboardMetrics, LowStockAlert } from "@/actions/dashboard"

interface DashboardClientProps {
  initialMetrics: DashboardMetrics | null
  initialAlerts: LowStockAlert[] | null
  initialActivities: any[] | null
  initialUserProfile: any | null
}

export default function DashboardClientV2({
  initialMetrics,
  initialAlerts,
  initialActivities,
  initialUserProfile
}: DashboardClientProps) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [activities, setActivities] = useState(initialActivities)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [metricsResult, alertsResult, activitiesResult] = await Promise.all([
        getDashboardMetrics(),
        getLowStockAlerts(),
        getRecentTransactions(10)
      ])

      if (metricsResult.isSuccess) setMetrics(metricsResult.data)
      if (alertsResult.isSuccess) setAlerts(alertsResult.data)
      if (activitiesResult.isSuccess) setActivities(activitiesResult.data)
      
      toast.success("Dashboard refreshed")
    } catch (error) {
      toast.error("Failed to refresh dashboard")
    } finally {
      setRefreshing(false)
    }
  }

  if (!metrics) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Station overview and key metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{parseFloat(metrics.todaysSales.totalValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.todaysSales.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stockStatus.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.stockStatus.lowStockCount} low stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.staffActivity.activeStaffCount}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.staffActivity.totalStaff} staff active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PMS Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.stockStatus.pmsLevel ? `${parseFloat(metrics.stockStatus.pmsLevel).toLocaleString()}L` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Current fuel level</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{alert.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {parseFloat(alert.currentStock).toLocaleString()} {alert.unit}
                    </span>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {metrics.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{product.name}</span>
                  <div className="text-right">
                    <div className="font-medium">₦{parseFloat(product.revenue).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {parseFloat(product.totalSold).toLocaleString()} sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">Transaction #{activity.id.slice(-6)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      by {activity.userName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₦{parseFloat(activity.totalAmount).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.transactionDate).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
