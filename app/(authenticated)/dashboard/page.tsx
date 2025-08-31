"use client"

export const dynamic = "force-dynamic"

import { validateUserRole, getCurrentUserProfile } from "@/actions/auth"
import {
  getDashboardMetrics,
  getLowStockAlerts,
  getRecentTransactions
} from "@/actions/dashboard"
import { redirect } from "next/navigation"
import { useState, useEffect, ReactNode, useRef } from "react"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CustomizableDashboard } from "@/components/dashboard/customizable-dashboard"
import {
  DashboardErrorBoundary,
  WidgetError
} from "@/components/dashboard/error-boundary"
import { useDashboardCache } from "@/hooks/use-dashboard-cache"
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates"
import { WidgetWrapper } from "@/components/dashboard/widget-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AnimatedPage,
  AnimatedGrid,
  AnimatedText,
  AnimatedLoader
} from "@/components/ui/animated-page"
import {
  AnimatedSkeleton,
  AnimatedLoadingGrid
} from "@/components/ui/animated-loading"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Activity,
  Clock,
  Users,
  TrendingUp,
  Bell,
  Settings,
  RefreshCw,
  Zap
} from "lucide-react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

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

// Enhanced loading components with better animations
function MetricsLoading() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loadingRef.current) {
      const cards = loadingRef.current.children
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      )
    }
  }, [])

  return (
    <div
      ref={loadingRef}
      className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <AnimatedSkeleton className="h-4 w-20" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-to-r from-blue-100 to-purple-100" />
            </div>
            <AnimatedSkeleton className="mb-3 h-10 w-24" />
            <div className="flex items-center justify-between">
              <AnimatedSkeleton className="h-3 w-16" />
              <AnimatedSkeleton className="h-3 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AlertsLoading() {
  const alertsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (alertsRef.current) {
      const items = alertsRef.current.querySelectorAll(".loading-item")
      gsap.fromTo(
        items,
        { opacity: 0, x: -30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "back.out(1.2)"
        }
      )
    }
  }, [])

  return (
    <div ref={alertsRef} className="mb-6">
      <div className="mb-4 flex items-center gap-3">
        <AnimatedSkeleton className="h-6 w-40" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-red-100 to-red-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="loading-item">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-r from-red-100 to-red-200" />
                <div className="flex-1 space-y-2">
                  <AnimatedSkeleton className="h-4 w-32" />
                  <AnimatedSkeleton className="h-3 w-48" />
                </div>
                <AnimatedSkeleton className="h-8 w-20 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ActivityLoading() {
  const activityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activityRef.current) {
      const timeline = activityRef.current.querySelector(".timeline-line")
      const items = activityRef.current.querySelectorAll(".activity-item")

      // Animate timeline first
      if (timeline) {
        gsap.fromTo(
          timeline,
          { scaleY: 0, transformOrigin: "top center" },
          { scaleY: 1, duration: 1, ease: "power2.out" }
        )
      }

      // Then animate items
      gsap.fromTo(
        items,
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3
        }
      )
    }
  }, [])

  return (
    <div ref={activityRef}>
      <div className="mb-4 flex items-center justify-between">
        <AnimatedSkeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <AnimatedSkeleton className="h-4 w-16" />
          <AnimatedSkeleton className="h-8 w-20 rounded" />
        </div>
      </div>
      <div className="relative">
        <div className="timeline-line absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-blue-300 to-transparent opacity-30" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="activity-item flex items-start gap-4">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gradient-to-r from-blue-100 to-blue-200" />
              <Card className="flex-1">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <AnimatedSkeleton className="h-4 w-40" />
                      <AnimatedSkeleton className="h-3 w-24" />
                    </div>
                    <AnimatedSkeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Data fetching components with caching
function DashboardMetricsWidget() {
  const {
    data: metrics,
    isLoading,
    error,
    refresh,
    isValidating
  } = useDashboardCache("dashboard-metrics", getDashboardMetrics, {
    ttl: 5 * 60 * 1000,
    refreshInterval: 30000
  })

  if (isLoading) return <MetricsLoading />
  if (error)
    return (
      <WidgetError
        title="Metrics"
        error="Failed to load metrics"
        onRetry={refresh}
      />
    )
  if (!metrics?.isSuccess || !metrics.data) {
    return (
      <WidgetError
        title="Metrics"
        error="No data available"
        onRetry={refresh}
      />
    )
  }

  return (
    <MetricsCards
      metrics={metrics.data}
      onRetry={refresh}
      isRefreshing={isValidating}
    />
  )
}

function StockAlertsWidget() {
  const {
    data: alerts,
    isLoading,
    error,
    refresh
  } = useDashboardCache("stock-alerts", getLowStockAlerts, {
    ttl: 2 * 60 * 1000,
    refreshInterval: 60000
  })

  if (isLoading) return <AlertsLoading />
  if (error)
    return (
      <WidgetError
        title="Stock Alerts"
        error="Failed to load alerts"
        onRetry={refresh}
      />
    )
  if (!alerts?.isSuccess) {
    return (
      <WidgetError
        title="Stock Alerts"
        error="Unable to load stock alerts"
        onRetry={refresh}
      />
    )
  }

  return <LowStockAlerts alerts={alerts.data || []} />
}

function EnhancedQuickActionsWidget({
  userRole,
  lowStockCount = 0,
  isLoading = false
}: {
  userRole: string
  lowStockCount?: number
  isLoading?: boolean
}) {
  const pendingTasks = 3 // This could be fetched from a tasks API

  return (
    <QuickActions
      lowStockCount={lowStockCount}
      pendingTasks={pendingTasks}
      userRole={userRole as "staff" | "manager"}
      isLoading={isLoading}
    />
  )
}

function RecentActivityWidget() {
  const {
    data: transactions,
    isLoading,
    error,
    refresh
  } = useDashboardCache(
    "recent-transactions",
    () => getRecentTransactions(10),
    { ttl: 1 * 60 * 1000, refreshInterval: 15000 }
  )

  if (isLoading) return <ActivityLoading />
  if (error)
    return (
      <WidgetError
        title="Recent Activity"
        error="Failed to load activity"
        onRetry={refresh}
      />
    )
  if (!transactions?.isSuccess) {
    return (
      <WidgetError
        title="Recent Activity"
        error="Unable to load recent transactions"
        onRetry={refresh}
      />
    )
  }

  return <RecentActivity transactions={transactions.data || []} />
}

export default function ManagerDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("connected")
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  // Shared data fetching
  const {
    data: alerts,
    isLoading: alertsLoading,
    invalidate: invalidateAlerts
  } = useDashboardCache("stock-alerts", getLowStockAlerts, {
    ttl: 2 * 60 * 1000,
    refreshInterval: 60000
  })

  const lowStockCount = alerts?.isSuccess ? alerts.data?.length || 0 : 0

  // Real-time updates with enhanced animations
  useRealtimeUpdates({
    enabled: true,
    onUpdate: event => {
      if (
        event === "data_update" ||
        event === "visibility_change" ||
        event === "connection_restored"
      ) {
        setIsRefreshing(true)
        setLastUpdateTime(new Date())

        // Animate update indicator
        if (statsRef.current) {
          gsap.fromTo(
            statsRef.current,
            { scale: 1 },
            {
              scale: 1.02,
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: "power2.out"
            }
          )
        }

        invalidateAlerts()

        setTimeout(() => setIsRefreshing(false), 1000)
      }

      if (event === "connection_restored") {
        setConnectionStatus("connected")
      } else if (event === "connection_lost") {
        setConnectionStatus("disconnected")
      } else if (event === "reconnecting") {
        setConnectionStatus("reconnecting")
      }
    }
  })

  // Header entrance animation
  useEffect(() => {
    if (headerRef.current && userProfile) {
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: -30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.2)"
        }
      )
    }
  }, [userProfile])

  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "metrics",
      title: "Key Metrics",
      component: (
        <WidgetWrapper title="Key Metrics">
          <DashboardMetricsWidget />
        </WidgetWrapper>
      ),
      visible: true,
      order: 1
    },
    {
      id: "alerts",
      title: "Stock Alerts",
      component: (
        <WidgetWrapper title="Stock Alerts">
          <StockAlertsWidget />
        </WidgetWrapper>
      ),
      visible: true,
      order: 2
    },
    {
      id: "activity",
      title: "Recent Activity",
      component: (
        <WidgetWrapper title="Recent Activity">
          <RecentActivityWidget />
        </WidgetWrapper>
      ),
      visible: true,
      order: 3
    },
    {
      id: "actions",
      title: "Quick Actions",
      component: null,
      visible: true,
      order: 4
    }
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
        console.error("Auth check failed:", error)
        redirect("/login")
      }
    }

    checkAuth()
  }, [])

  const handleWidgetToggle = (id: string) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    )
  }

  const handleWidgetReorder = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
  }

  if (!userProfile) {
    return (
      <AnimatedPage animation="morphIn" className="space-y-6" duration={1.2}>
        <div className="mb-6 flex items-center gap-4">
          <AnimatedSkeleton className="h-8 w-64" />
          <AnimatedLoader type="dots" size="md" color="blue" />
        </div>
        <MetricsLoading />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <AlertsLoading />
            <ActivityLoading />
          </div>
          <div className="lg:col-span-1">
            <Card className="h-96">
              <CardContent className="flex items-center justify-center p-6">
                <AnimatedLoader type="wave" size="lg" color="gray" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  const { user, station } = userProfile

  return (
    <DashboardErrorBoundary>
      <AnimatedPage
        animation="slideUp"
        className="space-y-6"
        enableScrollTriggers={true}
        staggerChildren={true}
      >
        {/* Enhanced Welcome Header with Status Indicators */}
        <div ref={headerRef} className="dashboard-header relative">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedText
                animation="slideUp"
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent"
              >
                Welcome back, {user.username}
              </AnimatedText>
              <div className="mt-2 flex items-center gap-4">
                <p className="text-muted-foreground">
                  {station.name} • Manager Dashboard
                </p>
                <Badge
                  variant={
                    connectionStatus === "connected" ? "default" : "destructive"
                  }
                  className={cn(
                    "animate-pulse",
                    connectionStatus === "connected" &&
                      "border-green-300 bg-green-100 text-green-700"
                  )}
                >
                  <div className="mr-1 h-2 w-2 rounded-full bg-current" />
                  {connectionStatus === "connected"
                    ? "Live"
                    : connectionStatus === "reconnecting"
                      ? "Reconnecting"
                      : "Offline"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3" data-scroll-animate>
              <div className="text-right">
                <div className="text-xs text-gray-500">Last updated</div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-3 w-3" />
                  {lastUpdateTime.toLocaleTimeString()}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className={cn(
                  "transition-all hover:scale-105",
                  isRefreshing && "animate-pulse"
                )}
              >
                <RefreshCw
                  className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")}
                />
                {isRefreshing ? "Updating..." : "Refresh"}
              </Button>

              {lowStockCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="animate-bounce"
                >
                  <Bell className="mr-1 h-4 w-4" />
                  {lowStockCount} Alert{lowStockCount > 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>

          {/* Ambient background effects */}
          <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50" />
          <div className="absolute top-0 left-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-200 opacity-20 mix-blend-multiply blur-xl filter" />
          <div className="animation-delay-2000 absolute top-0 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-200 opacity-20 mix-blend-multiply blur-xl filter" />
        </div>

        {/* Performance Stats Bar */}
        <div
          ref={statsRef}
          className="grid grid-cols-4 gap-4 rounded-lg border bg-white/60 p-4 backdrop-blur-sm"
          data-scroll-animate
        >
          {[
            {
              label: "Active Sessions",
              value: "3",
              icon: Users,
              color: "text-blue-600"
            },
            {
              label: "Avg Response",
              value: "1.2s",
              icon: Activity,
              color: "text-green-600"
            },
            {
              label: "Uptime",
              value: "99.9%",
              icon: TrendingUp,
              color: "text-purple-600"
            },
            {
              label: "Data Sync",
              value: "Live",
              icon: Zap,
              color: "text-orange-600"
            }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className={cn("mb-1 flex justify-center", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Enhanced Customizable Dashboard */}
        <AnimatedGrid
          className="dashboard-widgets"
          stagger={0.15}
          animation="slideUp"
          enableScrollTrigger={true}
        >
          <CustomizableDashboard
            widgets={widgets.map(widget =>
              widget.id === "actions"
                ? {
                    ...widget,
                    component: (
                      <WidgetWrapper title="Quick Actions">
                        <EnhancedQuickActionsWidget
                          userRole={user.role}
                          lowStockCount={lowStockCount}
                          isLoading={alertsLoading}
                        />
                      </WidgetWrapper>
                    )
                  }
                : widget
            )}
            onWidgetToggle={handleWidgetToggle}
            onWidgetReorder={handleWidgetReorder}
            userRole={user.role}
          />
        </AnimatedGrid>
      </AnimatedPage>
    </DashboardErrorBoundary>
  )
}
