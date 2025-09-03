"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"
import { getTodaysSalesSummary } from "@/actions/sales"
import { toast } from "sonner"
import { gsap } from "gsap"

interface SalesSummaryProps {
  stationId: string
  userId?: string
  refreshTrigger?: number
}

interface SalesSummaryData {
  date: string
  totalTransactions: number
  totalAmount: number
  productTypeSummary: Record<
    string,
    {
      totalQuantity: number
      totalAmount: number
      transactionCount: number
    }
  >
  topProducts: Array<{
    product: {
      id: string
      name: string
      type: string
      unit: string
    }
    totalQuantity: number
    totalAmount: number
    transactionCount: number
  }>
  transactions: Array<{
    id: string
    totalAmount: string
    transactionDate: Date
    itemCount: number
    items: Array<{
      id: string
      quantity: string
      totalPrice: string
      product: { name: string; unit: string }
    }>
  }>
}

export function SalesSummary({
  stationId,
  userId,
  refreshTrigger
}: SalesSummaryProps) {
  const [summary, setSummary] = useState<SalesSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null)
  const overviewCardsRef = useRef<HTMLDivElement>(null)
  const productTypeRef = useRef<HTMLDivElement>(null)
  const topProductsRef = useRef<HTMLDivElement>(null)
  const transactionsRef = useRef<HTMLDivElement>(null)
  const loadingSkeletonsRef = useRef<HTMLDivElement>(null)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getTodaysSalesSummary(stationId, userId)
      if (result.isSuccess && result.data) {
        // Transform data to match expected interface
        const transformedData = {
          ...result.data,
          transactions: result.data.transactions.map(transaction => ({
            id: transaction.id,
            totalAmount: transaction.totalAmount,
            transactionDate: transaction.transactionDate,
            itemCount: transaction.items ? transaction.items.length : 0,
            items: transaction.items || []
          }))
        }
        setSummary(transformedData)
      } else {
        toast.error(result.error || "Failed to load sales summary")
      }
    } catch (error) {
      toast.error("Failed to load sales summary")
    } finally {
      setLoading(false)
    }
  }, [stationId, userId])

  useEffect(() => {
    loadSummary()
  }, [loadSummary, refreshTrigger])

  // Animate content when data loads
  useEffect(() => {
    if (!loading && summary && headerRef.current && overviewCardsRef.current) {
      const tl = gsap.timeline()

      // Animate header
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
        // Animate overview cards with enhanced stagger
        .fromTo(
          overviewCardsRef.current.children,
          {
            opacity: 0,
            y: 30,
            scale: 0.95,
            rotationY: 15
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power3.out"
          },
          "-=0.3"
        )

      // Animate other sections if they exist
      if (productTypeRef.current) {
        tl.fromTo(
          productTypeRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
      }

      if (topProductsRef.current) {
        tl.fromTo(
          topProductsRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
      }

      if (transactionsRef.current) {
        tl.fromTo(
          transactionsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
      }
    }
  }, [loading, summary])

  // Animate loading skeleton shimmer effects
  useEffect(() => {
    if (loading && loadingSkeletonsRef.current) {
      const skeletonCards = loadingSkeletonsRef.current.children

      // Initial setup
      gsap.set(skeletonCards, { opacity: 0, y: 30, scale: 0.95 })

      // Staggered entrance animation
      gsap.to(skeletonCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      })

      // Create shimmer effect for skeleton elements
      Array.from(skeletonCards).forEach((card: Element) => {
        const shimmerElements = card.querySelectorAll(".skeleton-shimmer")

        Array.from(shimmerElements).forEach((element: Element) => {
          const el = element as HTMLElement
          gsap.set(el, { backgroundPosition: "-200% 0" })

          gsap.to(el, {
            backgroundPosition: "200% 0",
            duration: 1.5,
            ease: "none",
            repeat: -1
          })
        })
      })
    }
  }, [loading])

  // Animate product type items when they load
  useEffect(() => {
    if (!loading && summary && productTypeRef.current) {
      const productTypeItems =
        productTypeRef.current.querySelectorAll(".product-type-item")

      if (productTypeItems.length > 0) {
        gsap.set(productTypeItems, { opacity: 0, x: -30, scale: 0.95 })

        gsap.to(productTypeItems, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        })

        // Add hover animations for product type items
        Array.from(productTypeItems).forEach(item => {
          const element = item as HTMLElement

          element.addEventListener("mouseenter", () => {
            gsap.to(element, {
              scale: 1.02,
              y: -2,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              duration: 0.2,
              ease: "power2.out"
            })
          })

          element.addEventListener("mouseleave", () => {
            gsap.to(element, {
              scale: 1,
              y: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              duration: 0.2,
              ease: "power2.out"
            })
          })
        })
      }
    }
  }, [loading, summary])

  // Animate top products when they load
  useEffect(() => {
    if (!loading && summary && topProductsRef.current) {
      const topProductItems =
        topProductsRef.current.querySelectorAll(".top-product-item")

      if (topProductItems.length > 0) {
        gsap.set(topProductItems, { opacity: 0, x: 30, scale: 0.95 })

        gsap.to(topProductItems, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        })

        // Add hover animations for top product items
        Array.from(topProductItems).forEach(item => {
          const element = item as HTMLElement

          element.addEventListener("mouseenter", () => {
            gsap.to(element, {
              scale: 1.02,
              y: -2,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              duration: 0.2,
              ease: "power2.out"
            })
          })

          element.addEventListener("mouseleave", () => {
            gsap.to(element, {
              scale: 1,
              y: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              duration: 0.2,
              ease: "power2.out"
            })
          })
        })
      }
    }
  }, [loading, summary])

  // Animate transaction items when they load
  useEffect(() => {
    if (!loading && summary && transactionsRef.current) {
      const transactionItems =
        transactionsRef.current.querySelectorAll(".transaction-item")

      if (transactionItems.length > 0) {
        gsap.set(transactionItems, { opacity: 0, y: 20, scale: 0.95 })

        gsap.to(transactionItems, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        })

        // Add hover animations for transaction items
        Array.from(transactionItems).forEach(item => {
          const element = item as HTMLElement

          element.addEventListener("mouseenter", () => {
            gsap.to(element, {
              scale: 1.02,
              y: -3,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              duration: 0.2,
              ease: "power2.out"
            })
          })

          element.addEventListener("mouseleave", () => {
            gsap.to(element, {
              scale: 1,
              y: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              duration: 0.2,
              ease: "power2.out"
            })
          })
        })
      }
    }
  }, [loading, summary])

  if (loading) {
    return (
      <div ref={loadingSkeletonsRef} className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <div
                className="skeleton-shimmer h-4 w-1/2 rounded"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                  backgroundSize: "200% 100%"
                }}
              />
              <div
                className="skeleton-shimmer mt-2 h-3 w-1/3 rounded"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                  backgroundSize: "200% 100%"
                }}
              />
            </CardHeader>
            <CardContent>
              <div
                className="skeleton-shimmer h-8 rounded"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                  backgroundSize: "200% 100%"
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No sales data available</p>
          <Button variant="outline" onClick={loadSummary} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Today's Sales Summary</h3>
          <p className="text-muted-foreground text-sm">
            {new Date(summary.date).toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSummary}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Overview Cards */}
      <div
        ref={overviewCardsRef}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{summary.totalAmount.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">
              From {summary.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalTransactions}
            </div>
            <p className="text-muted-foreground text-xs">
              Avg: ₦
              {summary.totalTransactions > 0
                ? (summary.totalAmount / summary.totalTransactions).toFixed(2)
                : "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Types</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary.productTypeSummary).length}
            </div>
            <p className="text-muted-foreground text-xs">Types sold today</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Type Breakdown */}
      {Object.keys(summary.productTypeSummary).length > 0 && (
        <Card ref={productTypeRef}>
          <CardHeader>
            <CardTitle className="text-base">Sales by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.productTypeSummary).map(
                ([type, data]) => (
                  <div
                    key={type}
                    className="product-type-item flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={type === "pms" ? "default" : "secondary"}>
                        {type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {data.totalQuantity}{" "}
                          {type === "pms" ? "litres" : "units"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {data.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₦{data.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {(
                          (data.totalAmount / summary.totalAmount) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {summary.topProducts.length > 0 && (
        <Card ref={topProductsRef}>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>Best performing products today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topProducts.map((item, index) => (
                <div
                  key={item.product.id}
                  className="top-product-item flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.totalQuantity} {item.product.unit} •{" "}
                        {item.transactionCount} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₦{item.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {summary.transactions.length > 0 && (
        <Card ref={transactionsRef}>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>
              Latest {Math.min(5, summary.transactions.length)} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...summary.transactions]
                .reverse()
                .slice(0, 5)
                .map(transaction => (
                  <div
                    key={transaction.id}
                    className="transaction-item rounded-lg border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {transaction.itemCount} item
                          {transaction.itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="font-semibold">
                        ₦{parseFloat(transaction.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {transaction.items.map(
                        (item: {
                          id: string
                          quantity: string
                          totalPrice: string
                          product: { name: string; unit: string }
                        }) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {parseFloat(item.quantity)} {item.product.unit} ×{" "}
                              {item.product.name}
                            </span>
                            <span>
                              ₦{parseFloat(item.totalPrice).toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary.totalTransactions === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 font-semibold">No sales recorded today</h3>
            <p className="text-muted-foreground">
              Start recording sales to see your daily summary here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
