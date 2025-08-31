"use client"

export const dynamic = "force-dynamic"

import { validateUserRole, getCurrentUserProfile } from "@/actions/auth"
import {
  getDashboardMetrics,
  getLowStockAlerts,
  getRecentTransactions
} from "@/actions/dashboard"
import { redirect } from "next/navigation"
import { useState, useEffect, ReactNode } from "react"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CustomizableDashboard } from "@/components/dashboard/customizable-dashboard"
import { DashboardErrorBoundary, WidgetError } from "@/components/dashboard/error-boundary"
import { useDashboardCache } from "@/hooks/use-dashboard-cache"
import { Skeleton } from "@/components/ui/skeleton"

interface UserProfile {
  user: {
    id: string
    username: string
    role: string
  }
  station: {
    id: string
    name: string
  }
}

interface Widget {
  id: string
  title: string
  component: ReactNode
  visible: boolean
  order: number
}

// Loading components
function MetricsLoading() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function AlertsLoading() {
  return (
    <div className="mb-6">
      <Skeleton className="mb-4 h-6 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function ActivityLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-6 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Data fetching components with caching
function DashboardMetricsWidget() {
  const { data: metrics, isLoading, error, refresh, isValidating } = useDashboardCache(
    'dashboard-metrics',
    getDashboardMetrics,
    { ttl: 5 * 60 * 1000, refreshInterval: 30000 }
  )

  if (isLoading) return <MetricsLoading />
  if (error) return <WidgetError title="Metrics" error="Failed to load metrics" onRetry={refresh} />
  if (!metrics?.isSuccess || !metrics.data) {
    return <WidgetError title="Metrics" error="No data available" onRetry={refresh} />
  }

  return <MetricsCards metrics={metrics.data} onRetry={refresh} isRefreshing={isValidating} />
}

function StockAlertsWidget() {
  const { data: alerts, isLoading, error, refresh } = useDashboardCache(
    'stock-alerts',
    getLowStockAlerts,
    { ttl: 2 * 60 * 1000, refreshInterval: 60000 }
  )

  if (isLoading) return <AlertsLoading />
  if (error) return <WidgetError title="Stock Alerts" error="Failed to load alerts" onRetry={refresh} />
  if (!alerts?.isSuccess) {
    return <WidgetError title="Stock Alerts" error="Unable to load stock alerts" onRetry={refresh} />
  }

  return <LowStockAlerts alerts={alerts.data || []} />
}

function RecentActivityWidget() {
  const { data: transactions, isLoading, error, refresh } = useDashboardCache(
    'recent-transactions',
    () => getRecentTransactions(10),
    { ttl: 1 * 60 * 1000, refreshInterval: 15000 }
  )

  if (isLoading) return <ActivityLoading />
  if (error) return <WidgetError title="Recent Activity" error="Failed to load activity" onRetry={refresh} />
  if (!transactions?.isSuccess) {
    return <WidgetError title="Recent Activity" error="Unable to load recent transactions" onRetry={refresh} />
  }

  return <RecentActivity transactions={transactions.data || []} />
}

export default function ManagerDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'metrics', title: 'Key Metrics', component: <DashboardMetricsWidget />, visible: true, order: 1 },
    { id: 'alerts', title: 'Stock Alerts', component: <StockAlertsWidget />, visible: true, order: 2 },
    { id: 'activity', title: 'Recent Activity', component: <RecentActivityWidget />, visible: true, order: 3 },
    { id: 'actions', title: 'Quick Actions', component: <QuickActions />, visible: true, order: 4 }
  ])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const roleCheck = await validateUserRole("manager")
        if (!roleCheck.isSuccess) {
          redirect("/unauthorized")
          return
        }

        const profile = await getCurrentUserProfile()
        if (!profile.isSuccess || !profile.data) {
          redirect("/setup-profile")
          return
        }

        setUserProfile(profile.data)
      } catch (error) {
        console.error('Auth check failed:', error)
        redirect("/login")
      }
    }

    checkAuth()
  }, [])

  const handleWidgetToggle = (id: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ))
  }

  const handleWidgetReorder = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
  }

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <MetricsLoading />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <AlertsLoading />
            <ActivityLoading />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const { user, station } = userProfile

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.username}
          </h1>
          <p className="text-muted-foreground">
            {station.name} • Manager Dashboard
          </p>
        </div>

        {/* Customizable Dashboard */}
        <CustomizableDashboard
          widgets={widgets}
          onWidgetToggle={handleWidgetToggle}
          onWidgetReorder={handleWidgetReorder}
        />
      </div>
    </DashboardErrorBoundary>
  )
}
