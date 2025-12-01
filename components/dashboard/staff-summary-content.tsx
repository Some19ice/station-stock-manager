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
import { AnimatedPage } from "@/components/ui/animated-page"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Clock,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react"
import Link from "next/link"

interface TopProduct {
  product: {
    id: string
    name: string
    type: string
    unit: string
  }
  totalQuantity: number
  totalAmount: number
  transactionCount: number
}

interface Transaction {
  id: string
  totalAmount: string
  transactionDate: Date
  items: Array<{
    id: string
    quantity: string
    totalPrice: string
    product: {
      id: string
      name: string
      type: string
      unit: string
    }
  }>
}

interface StaffSummaryContentProps {
  user: { id: string; username: string }
  station: { id: string; name: string }
  summary: {
    date: string
    totalTransactions: number
    totalAmount: number
    productTypeSummary: Record<string, { totalQuantity: number; totalAmount: number }>
    topProducts: TopProduct[]
    transactions: Transaction[]
  }
}

export function StaffSummaryContent({
  user,
  station,
  summary
}: StaffSummaryContentProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const avgTransaction = summary.totalTransactions > 0
    ? summary.totalAmount / summary.totalTransactions
    : 0

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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <AnimatedPage ref={pageRef} className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">Daily Summary</h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{station.name}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-700">
                    {user.username}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {new Date(summary.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AnimatedCard
            hoverEffect={false}
            className="stat-card border-l-4 border-l-emerald-500 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₦{summary.totalAmount.toLocaleString()}
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
            className="stat-card border-l-4 border-l-blue-500 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalTransactions}
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
            className="stat-card border-l-4 border-l-violet-500 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Avg. Transaction
                  </p>
                  <p className="text-2xl font-bold text-violet-600">
                    ₦{Math.round(avgTransaction).toLocaleString()}
                  </p>
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            hoverEffect={false}
            className="stat-card border-l-4 border-l-amber-500 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Products Sold
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {summary.topProducts.length}
                  </p>
                </div>
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
          {/* Transactions List */}
          <div className="group relative flex-1 overflow-hidden rounded-2xl border bg-white shadow-xl transition-all duration-500 hover:shadow-2xl lg:col-span-2">
            {/* Animated Background */}
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
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                  <h3 className="text-base font-semibold text-white">Transaction History</h3>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {summary.transactions.length} today
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="relative overflow-auto p-4" style={{ maxHeight: "calc(100% - 52px)" }}>
              {summary.transactions.length > 0 ? (
                <div className="space-y-2">
                  {summary.transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                            <span className="text-xs font-semibold text-blue-600">
                              #{summary.transactions.length - index}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {transaction.items.length} item{transaction.items.length > 1 ? "s" : ""}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {formatTime(transaction.transactionDate)}
                            </div>
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          ₦{parseFloat(transaction.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      {/* Items */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {transaction.items.map(item => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.product.name} × {parseFloat(item.quantity)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No transactions today</p>
                  <p className="text-xs text-slate-500">Start recording sales!</p>
                  <Button asChild className="mt-4">
                    <Link href="/staff/sales">Record Sale</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <Card className="flex-1 overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto" style={{ maxHeight: "calc(100% - 60px)" }}>
              {summary.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {summary.topProducts.map((item, index) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-xs font-bold text-emerald-700">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.totalQuantity} {item.product.unit} • {item.transactionCount} sales
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        ₦{item.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No products sold yet</p>
                </div>
              )}

              {/* Product Type Breakdown */}
              {Object.keys(summary.productTypeSummary).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      By Category
                    </p>
                    <div className="space-y-2">
                      {Object.entries(summary.productTypeSummary).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-slate-600">{type}</span>
                          <span className="font-semibold">₦{data.totalAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
