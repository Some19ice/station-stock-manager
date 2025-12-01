"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AnimatedPage } from "@/components/ui/animated-page"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  Plus,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  Fuel,
  Package,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react"
import Link from "next/link"

interface StaffDashboardContentProps {
  user: { username: string }
  station: { name: string }
  todaysSales: {
    totalAmount: number
    transactionCount: number
    pmsSales: number
    lubricantSales: number
  }
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    time: string
  }>
  greeting: string
  shiftProgress: number
  hoursLeft: number
  dailyTarget: number
  targetProgress: number
}

export function StaffDashboardContent({
  user,
  station,
  todaysSales,
  recentTransactions,
  greeting,
  shiftProgress,
  hoursLeft,
  dailyTarget,
  targetProgress
}: StaffDashboardContentProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      )
    }

    // Stats cards hover animation
    if (statsRef.current) {
      const statCards = statsRef.current.querySelectorAll(".stat-card")
      statCards.forEach(card => {
        const element = card as HTMLElement
        const icon = element.querySelector(".stat-icon")

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
          })
          if (icon) {
            gsap.to(icon, { scale: 1.1, duration: 0.3, ease: "power2.out" })
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
        })
      })
    }
  }, [])

  return (
    <AnimatedPage ref={pageRef} className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {greeting}, {user.username}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{station.name}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-700">
                    Staff
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {mounted ? `• ${new Date().toLocaleTimeString()}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>{hoursLeft}h left</span>
              </div>
              <Progress value={shiftProgress} className="mt-1 h-1 w-20" />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* Actions */}
            <div className="flex gap-3">
              <Button asChild size="lg" className="h-12 flex-1 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/staff/sales" className="flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  Record New Sale
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-orange-200 bg-orange-50 text-orange-700 transition-transform hover:scale-[1.02] hover:bg-orange-100 active:scale-[0.98]">
                <Link href="/staff/meter-readings" className="flex items-center justify-center gap-2">
                  <Fuel className="h-5 w-5" />
                  PMS Readings
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/staff/summary" className="flex items-center justify-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Summary
                </Link>
              </Button>
            </div>

            {/* Stats - Sales page design */}
            <div ref={statsRef} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <AnimatedCard
                hoverEffect={false}
                className="stat-card cursor-pointer border-l-4 border-l-emerald-500 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Today's Sales
                      </p>
                      <p className="text-xl font-bold text-emerald-600">
                        ₦{todaysSales.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard
                hoverEffect={false}
                className="stat-card cursor-pointer border-l-4 border-l-blue-500 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Transactions
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {todaysSales.transactionCount}
                      </p>
                    </div>
                    <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard
                hoverEffect={false}
                className="stat-card cursor-pointer border-l-4 border-l-orange-500 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        PMS Sales
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        ₦{todaysSales.pmsSales.toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                      <Fuel className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard
                hoverEffect={false}
                className="stat-card cursor-pointer border-l-4 border-l-violet-500 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Lubricants
                      </p>
                      <p className="text-xl font-bold text-violet-600">
                        ₦{todaysSales.lubricantSales.toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200">
                      <Package className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Transactions - Main card with animated background */}
            <div className="group relative flex-1 overflow-hidden rounded-2xl border bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
              {/* Animated Background Decorations */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100/40 to-cyan-100/40 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-slate-100/40 to-blue-100/40 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
              </div>

              {/* Gradient Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-3">
                <div className="absolute inset-0">
                  <div className="absolute -right-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-white/10" />
                  <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-white/5" />
                </div>
                <div className="relative flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {recentTransactions.length} today
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="relative overflow-auto p-4" style={{ maxHeight: "calc(100% - 52px)" }}>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                            <span className="text-xs font-semibold text-blue-600">
                              #{recentTransactions.length - index}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{transaction.type}</p>
                            <p className="text-xs text-slate-500">{transaction.time}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900">₦{transaction.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No transactions yet</p>
                    <p className="text-xs text-slate-500">Record your first sale!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Daily Target */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-800">Daily Target</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ₦{todaysSales.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">of ₦{dailyTarget.toLocaleString()}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-green-700">
                    <span>{Math.round(targetProgress)}%</span>
                    <span>₦{Math.max(0, dailyTarget - todaysSales.totalAmount).toLocaleString()} to go</span>
                  </div>
                  <Progress value={targetProgress} className="h-2 bg-green-200 [&>div]:bg-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="flex-1 transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Sales</span>
                  <span className="font-semibold">₦{todaysSales.totalAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Transactions</span>
                  <span className="font-semibold">{todaysSales.transactionCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Avg. Sale</span>
                  <span className="font-semibold">
                    ₦{todaysSales.transactionCount > 0
                      ? Math.round(todaysSales.totalAmount / todaysSales.transactionCount).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">PMS %</span>
                  <span className="font-semibold text-orange-600">
                    {todaysSales.totalAmount > 0
                      ? Math.round((todaysSales.pmsSales / todaysSales.totalAmount) * 100)
                      : 0}%
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Lubricants %</span>
                  <span className="font-semibold text-violet-600">
                    {todaysSales.totalAmount > 0
                      ? Math.round((todaysSales.lubricantSales / todaysSales.totalAmount) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}
