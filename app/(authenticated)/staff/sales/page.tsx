"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ShoppingCart,
  BarChart3,
  Plus,
  TrendingUp,
  Clock,
  Target,
  Zap,
  DollarSign,
  Package,
  RefreshCw,
  Keyboard
} from "lucide-react"
import Link from "next/link"
import { SalesInterface } from "@/components/sales/sales-interface"
import { SalesSummary } from "@/components/sales/sales-summary"
import { useStationAuth } from "@/hooks/use-station-auth"
import {
  useGSAP,
  useTextReveal,
  useMagneticHover,
  useAdvancedStagger
} from "@/hooks/use-gsap"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"
import { getTodaysSalesSummary } from "@/actions/sales"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface QuickStats {
  totalSales: number
  transactionCount: number
  avgTransaction: number
}

export default function StaffSalesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("record")
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalSales: 0,
    transactionCount: 0,
    avgTransaction: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const { user, station } = useStationAuth()

  // Load quick stats
  const loadQuickStats = useCallback(async () => {
    if (!station?.id) return
    setStatsLoading(true)
    try {
      const result = await getTodaysSalesSummary(station.id, user?.id)
      if (result.isSuccess && result.data) {
        setQuickStats({
          totalSales: result.data.totalAmount,
          transactionCount: result.data.totalTransactions,
          avgTransaction:
            result.data.totalTransactions > 0
              ? result.data.totalAmount / result.data.totalTransactions
              : 0
        })
      }
    } catch (error) {
      console.error("Failed to load quick stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [station?.id, user?.id])

  useEffect(() => {
    loadQuickStats()
  }, [loadQuickStats, refreshTrigger])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + R = Record Sale tab
      if (e.altKey && e.key === "r") {
        e.preventDefault()
        setActiveTab("record")
      }
      // Alt + S = Summary tab
      if (e.altKey && e.key === "s") {
        e.preventDefault()
        setActiveTab("summary")
      }
      // Alt + N = Refresh stats
      if (e.altKey && e.key === "n") {
        e.preventDefault()
        loadQuickStats()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [loadQuickStats])

  // GSAP refs and context
  const ctx = useGSAP()
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const handleSaleComplete = () => {
    setRefreshTrigger(prev => prev + 1)
    // Show success feedback and switch to summary tab with animation
    setTimeout(() => {
      // Add a smooth transition animation when switching tabs
      const currentTab = document.querySelector(`[data-state="active"]`)
      if (currentTab && ctx) {
        gsap.to(currentTab, {
          scale: 0.95,
          opacity: 0.7,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            setActiveTab("summary")
            gsap.to(currentTab, {
              scale: 1,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            })
          }
        })
      } else {
        setActiveTab("summary")
      }
    }, 1000)
  }

  // Page entrance animation
  useEffect(() => {
    if (!ctx || !user || !station) return

    const tl = gsap.timeline()

    // Set initial states
    gsap.set(
      [
        headerRef.current,
        statsRef.current,
        mainCardRef.current,
        footerRef.current
      ],
      {
        opacity: 0,
        y: 50
      }
    )

    // Animate in sequence
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    })
      .to(
        statsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.4"
      )
      .to(
        mainCardRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        },
        "-=0.3"
      )
      .to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        },
        "-=0.2"
      )

    return () => {
      tl.kill()
    }
  }, [ctx, user, station])

  // Text reveal animations
  useTextReveal(".page-title", {
    split: true,
    stagger: 0.03,
    delay: 0.2
  })

  useTextReveal(".page-description", {
    delay: 0.4
  })

  // Stats cards stagger animation
  useAdvancedStagger(".stats-grid", ".stat-card", {
    stagger: 0.15,
    phase1: { scale: 0.8, rotationY: -30 },
    phase2: { scale: 1, rotationY: 0, ease: "back.out(1.7)" }
  })

  // Magnetic hover effects for interactive elements
  useMagneticHover(".interactive-button", 0.2)
  useMagneticHover(".stat-card", 0.1)

  // Enhanced hover effects for stat cards
  useEffect(() => {
    if (!ctx || typeof window === "undefined") return

    ctx.add(() => {
      const statCards = gsap.utils.toArray(".stat-card")

      statCards.forEach(card => {
        const element = card as HTMLElement
        const icon = element.querySelector(".stat-icon")
        const content = element.querySelector(".stat-content")

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
          })
          if (icon) {
            gsap.to(icon, {
              scale: 1.1,
              duration: 0.3,
              ease: "power2.out"
            })
          }
          if (content) {
            gsap.to(content, {
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out"
            })
          }
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          })
          if (icon) {
            gsap.to(icon, { scale: 1, duration: 0.3, ease: "power2.out" })
          }
          if (content) {
            gsap.to(content, { scale: 1, duration: 0.3, ease: "power2.out" })
          }
        })
      })
    })
  }, [ctx])

  // Pulse animation for system status indicator
  useEffect(() => {
    if (!ctx || typeof window === "undefined") return

    ctx.add(() => {
      gsap.to(".status-indicator", {
        scale: 1.2,
        opacity: 0.7,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      })
    })
  }, [ctx])

  // Enhanced button micro-interactions
  useEffect(() => {
    if (!ctx || typeof window === "undefined") return

    ctx.add(() => {
      const buttons = gsap.utils.toArray("button")

      buttons.forEach((button, index) => {
        const element = button as HTMLElement

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            scale: 1.05,
            rotate: index % 2 === 0 ? 2 : -2, // Different rotations per button
            duration: 0.2,
            ease: "back.out(1.7)"
          })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            scale: 1,
            rotate: 0,
            duration: 0.2,
            ease: "power2.out"
          })
        })

        element.addEventListener("mousedown", () => {
          gsap.to(element, {
            scale: 0.95,
            duration: 0.1,
            ease: "power2.out"
          })
        })

        element.addEventListener("mouseup", () => {
          gsap.to(element, {
            scale: 1.05,
            duration: 0.1,
            ease: "power2.out"
          })
        })
      })
    })
  }, [ctx, user, station])

  if (!user || !station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto space-y-6 p-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-200" />
          </div>

          {/* Page Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 ml-auto" />
              <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border bg-white p-4 shadow-sm"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="h-7 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Card Skeleton */}
          <div className="overflow-hidden rounded-lg border bg-white shadow-lg">
            {/* Card Header */}
            <div className="border-b bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Tabs Skeleton */}
              <div className="h-12 w-full max-w-md animate-pulse rounded-lg bg-slate-100" />

              {/* Content Area Skeleton */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* Two Column Cards Skeleton */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="rounded-xl border bg-slate-50 p-6 space-y-4">
                    <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                    </div>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
    >
      <div className="container mx-auto space-y-6 p-6">
        {/* Header Section */}
        <div ref={headerRef} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="interactive-button"
              asChild
            >
              <Link
                href="/staff"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="page-title text-3xl font-bold text-slate-900">
                Sales Management
              </h1>
              <div className="page-description flex items-center space-x-2 text-slate-600">
                <span>{station.name}</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="text-xs">
                  {user.username}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats Bar - Real-time Data */}
        <div
          ref={statsRef}
          className="stats-grid grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <AnimatedCard
            hoverEffect={true}
            className="stat-card cursor-pointer border-l-4 border-l-emerald-500 transition-all hover:border-l-emerald-600"
            onClick={() => setActiveTab("summary")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Today's Sales
                  </p>
                  {statsLoading ? (
                    <div className="mt-1 h-7 w-24 animate-pulse rounded bg-slate-200" />
                  ) : (
                    <p className="text-2xl font-bold text-emerald-600">
                      ₦{quickStats.totalSales.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={true}
            className="stat-card cursor-pointer border-l-4 border-l-blue-500 transition-all hover:border-l-blue-600"
            onClick={() => setActiveTab("summary")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Transactions
                  </p>
                  {statsLoading ? (
                    <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-200" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">
                      {quickStats.transactionCount}
                    </p>
                  )}
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={true}
            className="stat-card cursor-pointer border-l-4 border-l-violet-500 transition-all hover:border-l-violet-600"
            onClick={() => setActiveTab("summary")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Avg. Transaction
                  </p>
                  {statsLoading ? (
                    <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200" />
                  ) : (
                    <p className="text-2xl font-bold text-violet-600">
                      ₦{quickStats.avgTransaction.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={true}
            className="stat-card cursor-pointer border-l-4 border-l-amber-500 transition-all hover:border-l-amber-600"
            onClick={() => setActiveTab("record")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Quick Action
                  </p>
                  <p className="text-lg font-bold text-amber-600">
                    New Sale
                  </p>
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Main Content - Animated Sales Operations Card */}
        <div ref={mainCardRef} className="group relative overflow-hidden rounded-2xl border bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
          {/* Animated Background Decorations */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100/40 to-cyan-100/40 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-slate-100/40 to-blue-100/40 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-100/20 to-teal-100/20 blur-2xl transition-all duration-700 group-hover:h-48 group-hover:w-48" />
          </div>

          {/* Gradient Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5">
            {/* Animated Header Pattern */}
            <div className="absolute inset-0">
              <div className="absolute -right-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-white/5 transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute right-1/4 top-1/2 h-20 w-20 rounded-full bg-white/10 transition-all duration-500 group-hover:right-1/3" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    Sales Operations
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={loadQuickStats}
                          >
                            <RefreshCw className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh stats (Alt+N)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h2>
                  <p className="text-sm text-slate-300">
                    Record sales & track daily performance
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hidden cursor-help items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 md:flex">
                        <Keyboard className="h-3.5 w-3.5" />
                        <span>Shortcuts</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1.5 text-xs">
                        <p><kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-white">Alt+R</kbd> Record Sale</p>
                        <p><kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-white">Alt+S</kbd> Summary</p>
                        <p><kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-white">Alt+N</kbd> Refresh</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1.5 backdrop-blur-sm">
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-100">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
            className="relative w-full"
            >
            <div className="border-b bg-slate-50/80 px-6 backdrop-blur-sm">
              <TabsList className="h-auto w-full max-w-lg gap-1 bg-transparent p-0">
                  <TabsTrigger
                    value="record"
                  className="group/tab relative flex-1 items-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-sm font-medium text-slate-500 transition-all data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none hover:text-slate-900"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-all group-data-[state=active]/tab:bg-blue-100">
                    <Plus className="h-4 w-4 text-slate-500 transition-all group-data-[state=active]/tab:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Record Sale</span>
                    <span className="hidden text-xs font-normal text-slate-400 group-data-[state=active]/tab:text-blue-400 sm:block">
                      New transaction
                    </span>
                  </div>
                  </TabsTrigger>
                
                  <TabsTrigger
                    value="summary"
                  className="group/tab relative flex-1 items-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-sm font-medium text-slate-500 transition-all data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none hover:text-slate-900"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-all group-data-[state=active]/tab:bg-emerald-100">
                    <BarChart3 className="h-4 w-4 text-slate-500 transition-all group-data-[state=active]/tab:text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Daily Summary</span>
                    <span className="hidden text-xs font-normal text-slate-400 group-data-[state=active]/tab:text-emerald-400 sm:block">
                      View performance
                    </span>
                  </div>
                  </TabsTrigger>
                </TabsList>
              </div>

            {/* Tab Content */}
            <div className="relative p-6">
              <TabsContent value="record" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-left-5 duration-300">
                {/* Record Sale Header */}
                <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-100/50" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-cyan-100/50" />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-200 transition-transform hover:scale-105">
                      <Plus className="h-7 w-7 text-white" />
                      </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                          New Sale Transaction
                        </h3>
                      <p className="text-sm text-slate-500">
                          Select products and quantities to record a sale
                        </p>
                      </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Clock className="mr-1 h-3 w-3" />
                        Quick Entry
                      </Badge>
                    </div>
                  </div>
                </div>
                
                  <SalesInterface
                    stationId={station.id}
                    onSaleComplete={handleSaleComplete}
                  />
                </TabsContent>

              <TabsContent value="summary" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
                {/* Summary Header */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/50" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-teal-100/50" />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 transition-transform hover:scale-105">
                      <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                          Performance Summary
                        </h3>
                      <p className="text-sm text-slate-500">
                          Your sales activity and achievements for today
                        </p>
                      </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <Target className="mr-1 h-3 w-3" />
                        {quickStats.transactionCount} Sales Today
                      </Badge>
                      </div>
                    </div>
                  </div>
                  <SalesSummary
                    stationId={station.id}
                    userId={user.id}
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

        {/* Footer Actions */}
        <div ref={footerRef} className="flex items-center justify-between rounded-lg border bg-slate-50/50 p-4">
          <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="status-indicator h-2 w-2 rounded-full bg-green-500"></div>
            <span>System Online</span>
          </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="hidden items-center gap-1 text-xs text-slate-400 md:flex">
              <Clock className="h-3 w-3" />
              <span>
                Session started:{" "}
                {new Date().toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="interactive-button text-slate-500 hover:text-slate-900"
              onClick={() => {
                loadQuickStats()
                setRefreshTrigger(prev => prev + 1)
              }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </Button>
          <Button
            variant="outline"
            size="sm"
            className="interactive-button"
            asChild
          >
              <Link href="/staff">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Dashboard
              </Link>
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
