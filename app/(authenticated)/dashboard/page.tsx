import { validateUserRole, getCurrentUserProfile } from "@/actions/auth"
import { getDashboardMetrics, getLowStockAlerts, getRecentTransactions } from "@/actions/dashboard"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Loading components
function MetricsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AlertsLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Data fetching components
async function DashboardMetrics() {
  const metricsResult = await getDashboardMetrics()
  
  if (!metricsResult.isSuccess || !metricsResult.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Unable to load dashboard metrics
          </p>
        </CardContent>
      </Card>
    )
  }

  return <MetricsCards metrics={metricsResult.data} />
}

async function StockAlerts() {
  const alertsResult = await getLowStockAlerts()
  
  if (!alertsResult.isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Unable to load stock alerts
          </p>
        </CardContent>
      </Card>
    )
  }

  return <LowStockAlerts alerts={alertsResult.data || []} />
}

async function RecentTransactions() {
  const transactionsResult = await getRecentTransactions(10)
  
  if (!transactionsResult.isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Unable to load recent transactions
          </p>
        </CardContent>
      </Card>
    )
  }

  return <RecentActivity transactions={transactionsResult.data || []} />
}

async function QuickActionsWithData() {
  const alertsResult = await getLowStockAlerts()
  const lowStockCount = alertsResult.isSuccess ? (alertsResult.data?.length || 0) : 0
  
  return <QuickActions lowStockCount={lowStockCount} />
}

export default async function ManagerDashboard() {
  // Verify user is a manager
  const roleCheck = await validateUserRole("manager")
  
  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  const userProfile = await getCurrentUserProfile()
  
  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.username}! Manage {station.name} operations.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <Suspense fallback={<MetricsLoading />}>
        <DashboardMetrics />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Alerts and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Alerts */}
          <Suspense fallback={<AlertsLoading />}>
            <StockAlerts />
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<ActivityLoading />}>
            <RecentTransactions />
          </Suspense>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading actions...</div>}>
            <QuickActionsWithData />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
