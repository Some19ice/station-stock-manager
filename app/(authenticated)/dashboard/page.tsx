"use client"

export const dynamic = "force-dynamic"

import { validateUserRole, getCurrentUserProfile } from "@/actions/auth"
import {
  getDashboardMetrics,
  getLowStockAlerts,
  getRecentTransactions
} from "@/actions/dashboard"
import { redirect } from "next/navigation"
import { useState, useEffect, ReactNode, useRef, useCallback } from "react"
import type { DashboardMetrics, LowStockAlert } from "@/actions/dashboard"

type RecentTransaction = {
  id: string
  totalAmount: string
  transactionDate: Date
  userName: string
  itemCount: number
}
import { EnhancedMetricsCards } from "@/components/dashboard/enhanced-metrics-cards"
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
import {
  EnhancedCard,
  EnhancedCardContent
} from "@/components/ui/enhanced-card"
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
import { motion, AnimatePresence } from "framer-motion"
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
      className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <EnhancedCard key={i} variant="metric" className="overflow-hidden">
          <EnhancedCardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <AnimatedSkeleton className="h-4 w-20" />
              <div className="bg-primary/20 h-8 w-8 animate-pulse rounded-full" />
            </div>
            <AnimatedSkeleton className="mb-3 h-10 w-24" />
            <div className="flex items-center justify-between">
              <AnimatedSkeleton className="h-6 w-16 rounded-full" />
              <AnimatedSkeleton className="h-5 w-12 rounded" />
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
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
        <div className="bg-destructive/20 h-6 w-16 animate-pulse rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <EnhancedCard key={i} variant="alert" className="loading-item">
            <EnhancedCardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-destructive/20 h-10 w-10 animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <AnimatedSkeleton className="h-4 w-32" />
                  <AnimatedSkeleton className="h-3 w-24" />
                </div>
                <AnimatedSkeleton className="h-8 w-16 rounded" />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>
    </div>
  )
}

function ActivityLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-3">
        <AnimatedSkeleton className="h-6 w-32" />
        <div className="bg-chart-2/20 h-6 w-12 animate-pulse rounded-full" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <EnhancedCard key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-chart-1/20 h-8 w-8 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <AnimatedSkeleton className="h-4 w-48" />
              <AnimatedSkeleton className="h-3 w-24" />
            </div>
            <AnimatedSkeleton className="h-6 w-16 rounded" />
          </div>
        </EnhancedCard>
      ))}
    </div>
  )
}

export default function EnhancedDashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [alerts, setAlerts] = useState<LowStockAlert[] | null>(null)
  const [activities, setActivities] = useState<RecentTransaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  // Enhanced cache and real-time updates
  const { invalidate: clearCache } = useDashboardCache(
    "dashboard",
    async () => null
  )
  const { isOnline: isConnected } = useRealtimeUpdates({ enabled: true })

  const loadDashboardData = useCallback(async (useCache = true) => {
    try {
      setError(null)

      // Load user profile
      const profileResult = await getCurrentUserProfile()
      if (!profileResult.isSuccess) {
        throw new Error("Failed to load user profile")
      }
      if (profileResult.data) {
        setUserProfile(profileResult.data)
      }

      // Load dashboard data in parallel
      const [metricsResult, alertsResult, activitiesResult] = await Promise.all(
        [getDashboardMetrics(), getLowStockAlerts(), getRecentTransactions()]
      )

      if (metricsResult.isSuccess && metricsResult.data) {
        setMetrics(metricsResult.data)
      }

      if (alertsResult.isSuccess && alertsResult.data) {
        setAlerts(alertsResult.data)
      }

      if (activitiesResult.isSuccess && activitiesResult.data) {
        setActivities(activitiesResult.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    // Page entrance animation
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      )
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    clearCache()
    await loadDashboardData(false)
  }

  if (loading) {
    return (
      <AnimatedPage>
        <div className="space-y-8">
          {/* Enhanced loading header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="text-primary h-8 w-8" />
              </motion.div>
              <div>
                <AnimatedSkeleton className="mb-2 h-8 w-48" />
                <AnimatedSkeleton className="h-4 w-32" />
              </div>
            </div>
            <AnimatedSkeleton className="h-10 w-24 rounded" />
          </motion.div>

          <MetricsLoading />
          <div className="grid gap-6 lg:grid-cols-2">
            <AlertsLoading />
            <ActivityLoading />
          </div>
        </div>
      </AnimatedPage>
    )
  }

  if (error) {
    return (
      <AnimatedPage>
        <DashboardErrorBoundary onRetry={() => loadDashboardData(false)}>
          <div className="py-8 text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </DashboardErrorBoundary>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage ref={pageRef}>
      <div className="space-y-8">
        {/* Enhanced header with status indicators */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="text-primary h-8 w-8" />
            </motion.div>
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                Dashboard Overview
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isConnected ? "Live" : "Offline"}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  Updated {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh All
          </Button>
        </motion.div>

        {/* Enhanced metrics */}
        <DashboardErrorBoundary>
          <WidgetWrapper title="Key Metrics">
            {metrics ? (
              <EnhancedMetricsCards
                metrics={metrics}
                onRetry={handleRefresh}
                isRefreshing={refreshing}
              />
            ) : (
              <MetricsLoading />
            )}
          </WidgetWrapper>
        </DashboardErrorBoundary>

        {/* Stock Alerts - moved above recent activities */}
        <DashboardErrorBoundary>
          <WidgetWrapper title="Stock Alerts">
            {alerts ? <LowStockAlerts alerts={alerts} /> : <AlertsLoading />}
          </WidgetWrapper>
        </DashboardErrorBoundary>

        {/* Enhanced grid layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardErrorBoundary>
            <WidgetWrapper title="Recent Activity">
              {activities ? (
                <RecentActivity transactions={activities} />
              ) : (
                <ActivityLoading />
              )}
            </WidgetWrapper>
          </DashboardErrorBoundary>

          <DashboardErrorBoundary>
            <WidgetWrapper title="Quick Actions">
              <QuickActions userRole="manager" />
            </WidgetWrapper>
          </DashboardErrorBoundary>
        </div>

        {/* Customizable dashboard */}
        <DashboardErrorBoundary>
          <CustomizableDashboard
            widgets={[]}
            onWidgetToggle={() => {}}
            onWidgetReorder={() => {}}
            userRole="manager"
          />
        </DashboardErrorBoundary>
      </div>
    </AnimatedPage>
  )
}
