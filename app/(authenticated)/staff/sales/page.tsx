"use client"

import { useState, useEffect, useRef } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ShoppingCart,
  BarChart3,
  Plus,
  TrendingUp,
  Clock,
  Target
} from "lucide-react"
import Link from "next/link"
import { SalesInterface } from "@/components/sales/sales-interface"
import { SalesSummary } from "@/components/sales/sales-summary"
import { useStationAuth } from "@/hooks/use-station-auth"
import {
  useGSAP,
  useStaggerAnimation,
  useTextReveal,
  useMagneticHover,
  useAdvancedStagger
} from "@/hooks/use-gsap"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function StaffSalesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("record")
  const { user, station } = useStationAuth()

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Loading Sales Management...</p>
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

        {/* Quick Stats Bar */}
        <div
          ref={statsRef}
          className="stats-grid grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <AnimatedCard
            hoverEffect={true}
            className="stat-card border-l-4 border-l-green-500"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-sm font-medium text-slate-600">
                    Quick Sale
                  </p>
                  <p className="text-xs text-slate-500">Start recording</p>
                </div>
                <div className="stat-icon flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={true}
            className="stat-card border-l-4 border-l-blue-500"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-sm font-medium text-slate-600">
                    View Summary
                  </p>
                  <p className="text-xs text-slate-500">Today's performance</p>
                </div>
                <div className="stat-icon flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={true}
            className="stat-card border-l-4 border-l-purple-500"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="stat-content">
                  <p className="text-sm font-medium text-slate-600">
                    Active Session
                  </p>
                  <p className="text-xs text-slate-500">Ready to sell</p>
                </div>
                <div className="stat-icon flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Main Content */}
        <Card ref={mainCardRef} className="shadow-lg">
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Sales Operations</CardTitle>
                <CardDescription>
                  Record new sales and monitor your daily performance
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Live Session
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6 pt-6">
                <TabsList className="grid h-12 w-full max-w-md grid-cols-2">
                  <TabsTrigger
                    value="record"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Record Sale
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Daily Summary
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="record" className="mt-0 space-y-6">
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Plus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          New Sale Transaction
                        </h3>
                        <p className="text-sm text-slate-600">
                          Select products and quantities to record a sale
                        </p>
                      </div>
                    </div>
                  </div>
                  <SalesInterface
                    stationId={station.id}
                    onSaleComplete={handleSaleComplete}
                  />
                </TabsContent>

                <TabsContent value="summary" className="mt-0 space-y-6">
                  <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Performance Summary
                        </h3>
                        <p className="text-sm text-slate-600">
                          Your sales activity and achievements for today
                        </p>
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
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div ref={footerRef} className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="status-indicator h-2 w-2 rounded-full bg-green-500"></div>
            <span>System Online</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="interactive-button"
            asChild
          >
            <Link href="/staff">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
