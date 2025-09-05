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
import {
  AnimatedPage,
  AnimatedGrid,
  AnimatedText,
  AnimatedLoader
} from "@/components/ui/animated-page"
import { LoadingScreen } from "@/components/ui/loading-screen"
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
const MetricsLoading = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
    <div className="h-8 w-1/2 rounded bg-gray-200"></div>
  </div>
)

const AlertsLoading = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 rounded bg-gray-200"></div>
    <div className="h-4 w-5/6 rounded bg-gray-200"></div>
  </div>
)

const ActivityLoading = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-3 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function EnhancedDashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [alerts, setAlerts] = useState<LowStockAlert[] | null>(null)
  const [activities, setActivities] = useState<RecentTransaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  // Enhanced cache and real-time updates
  const { invalidate: clearCache } = useDashboardCache(
    "dashboard",
    async (): Promise<null> => {
      // Placeholder fetcher function for cache invalidation only
      return null
    },
    { refreshInterval: 0 } // Disable auto-refresh since we manage it manually
  )
  const { isOnline: isConnected } = useRealtimeUpdates({ enabled: true })

  // Stable reference for loadDashboardData using useRef to prevent infinite re-renders
  const loadDashboardDataRef = useRef<(useCache?: boolean, signal?: AbortSignal) => Promise<void>>()
  
  loadDashboardDataRef.current = async (useCache = true, signal?: AbortSignal) => {
    // Prevent multiple simultaneous requests
    if (isDataLoading && !refreshing) return
    
    try {
      if (signal?.aborted || !mountedRef.current) return

      setIsDataLoading(true)
      setError(null)

      // Load user profile first - critical for authorization
      const profileResult = await getCurrentUserProfile()
      if (signal?.aborted || !mountedRef.current) return

      if (!profileResult.isSuccess) {
        throw new Error("Failed to load user profile")
      }
      
      // Only update state if request wasn't cancelled and component is mounted
      if (profileResult.data && !signal?.aborted && mountedRef.current) {
        setUserProfile(profileResult.data)
      }

      // Load dashboard data in parallel with individual error handling
      const dataPromises = [
        getDashboardMetrics().catch(err => ({ isSuccess: false, error: err.message })),
        getLowStockAlerts().catch(err => ({ isSuccess: false, error: err.message })),
        getRecentTransactions().catch(err => ({ isSuccess: false, error: err.message }))
      ]

      const [metricsResult, alertsResult, activitiesResult] = await Promise.all(dataPromises)
      
      // Check for cancellation after all requests complete
      if (signal?.aborted || !mountedRef.current) return

      // Update state atomically to prevent partial updates
      const updates: (() => void)[] = []
      
      if (metricsResult.isSuccess && metricsResult.data) {
        updates.push(() => setMetrics(metricsResult.data))
      }

      if (alertsResult.isSuccess && alertsResult.data) {
        updates.push(() => setAlerts(alertsResult.data))
      }

      if (activitiesResult.isSuccess && activitiesResult.data) {
        updates.push(() => setActivities(activitiesResult.data))
      }

      // Apply all updates if not cancelled and component is mounted
      if (!signal?.aborted && mountedRef.current) {
        updates.forEach(update => update())
      }

    } catch (err) {
      if (signal?.aborted || !mountedRef.current) return
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard"
      )
    } finally {
      if (!signal?.aborted && mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
        setIsDataLoading(false)
      }
    }
  }

  const loadDashboardData = useCallback((useCache = true, signal?: AbortSignal) => {
    return loadDashboardDataRef.current?.(useCache, signal) || Promise.resolve()
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    loadDashboardData(true, abortControllerRef.current.signal)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
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
    // Prevent multiple refresh requests
    if (isDataLoading) return
    
    setRefreshing(true)
    clearCache()
    
    // Cancel existing request and create new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    await loadDashboardData(false, abortControllerRef.current.signal)
  }

  if (loading) {
    return (
      <LoadingScreen
        title="Dashboard Overview"
        subtitle="Loading your station data..."
      />
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
