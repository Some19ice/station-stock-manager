"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInventoryStatus } from "@/actions/inventory"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Eye,
  Settings,
  Trash2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"

interface InventoryItem {
  id: string
  name: string
  brand?: string | null
  type: "pms" | "lubricant"
  currentStock: number
  minThreshold: number
  unitPrice: number
  value: number
  unit: string
  isLowStock: boolean
  isOutOfStock: boolean
  supplier?: { id: string; name: string } | null
  stockStatus: "out_of_stock" | "low_stock" | "normal"
}

interface InventoryStatus {
  items: InventoryItem[]
  summary: {
    totalProducts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    normalStockCount: number
  }
}

interface InventoryDashboardProps {
  stationId: string
  onViewProduct: (product: InventoryItem) => void
  onAdjustStock: (product: InventoryItem) => void
  onRecordDelivery: (product: InventoryItem) => void
  onDeleteProduct?: (product: InventoryItem) => void
}

export function InventoryDashboard({
  stationId,
  onViewProduct,
  onAdjustStock,
  onRecordDelivery,
  onDeleteProduct
}: InventoryDashboardProps) {
  const [inventoryStatus, setInventoryStatus] =
    useState<InventoryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const productsListRef = useRef<HTMLDivElement>(null)
  const loadingSkeletonsRef = useRef<HTMLDivElement>(null)

  // Animate content when data loads
  useEffect(() => {
    if (!loading && inventoryStatus && statsRef.current && contentRef.current) {
      const tl = gsap.timeline()

      // Animate summary cards with enhanced stagger
      tl.fromTo(
        statsRef.current.children,
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
        }
      )
        // Animate main content with slide up effect
        .fromTo(
          contentRef.current,
          { opacity: 0, y: 20, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" },
          "-=0.4"
        )
      // Animate tabs with subtle entrance
      if (tabsRef.current?.querySelector('[role="tablist"]')) {
        tl.fromTo(
          tabsRef.current.querySelector('[role="tablist"]'),
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "-=0.5"
        )
      }
    }
  }, [loading, inventoryStatus])

  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Animate tab content changes
  useEffect(() => {
    if (tabsRef.current) {
      const activeContent = tabsRef.current.querySelector(
        '[data-state="active"]'
      )
      if (activeContent) {
        gsap.fromTo(
          activeContent,
          { opacity: 0, y: 10, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
        )
      }
    }
  }, [activeTab])

  // Animate loading skeletons
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
          gsap.set(element, { backgroundPosition: "-200% 0" })

          gsap.to(element, {
            backgroundPosition: "200% 0",
            duration: 1.5,
            ease: "none",
            repeat: -1
          })
        })
      })
    }
  }, [loading])

  const fetchInventoryStatus = useCallback(async () => {
    try {
      setError(null)
      const result = await getInventoryStatus(stationId)
      if (result.isSuccess && result.data) {
        setInventoryStatus(result.data)
      } else {
        setError(result.error || "Failed to load inventory status")
      }
    } catch (error) {
      console.error("Error fetching inventory status:", error)
      setError("Failed to load inventory status")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [stationId])

  useEffect(() => {
    fetchInventoryStatus()
  }, [fetchInventoryStatus])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInventoryStatus()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div
          ref={loadingSkeletonsRef}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div
                  className="skeleton-shimmer h-4 w-20 rounded"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                    backgroundSize: "200% 100%"
                  }}
                />
                <div
                  className="skeleton-shimmer h-4 w-4 rounded"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                    backgroundSize: "200% 100%"
                  }}
                />
              </CardHeader>
              <CardContent>
                <div
                  className="skeleton-shimmer mb-2 h-8 w-16 rounded"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                    backgroundSize: "200% 100%"
                  }}
                />
                <div
                  className="skeleton-shimmer h-3 w-24 rounded"
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

        {/* Loading content skeleton */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div
              className="skeleton-shimmer h-6 w-32 rounded"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                backgroundSize: "200% 100%"
              }}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="skeleton-shimmer h-4 w-32 rounded"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                      backgroundSize: "200% 100%"
                    }}
                  />
                  <div
                    className="skeleton-shimmer h-4 w-20 rounded"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                      backgroundSize: "200% 100%"
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="skeleton-shimmer h-8 w-8 rounded"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                        backgroundSize: "200% 100%"
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!inventoryStatus || error) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          {error || "Failed to load inventory status"}
        </p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const { items, summary } = inventoryStatus

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "destructive"
      case "low_stock":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Out of Stock"
      case "low_stock":
        return "Low Stock"
      default:
        return "Normal"
    }
  }

  const lowStockItems = items.filter(
    item => item.isLowStock && !item.isOutOfStock
  )
  const outOfStockItems = items.filter(item => item.isOutOfStock)
  const normalStockItems = items.filter(item => !item.isLowStock)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div ref={statsRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-muted-foreground text-xs">
              Active inventory items
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalValue)}
            </div>
            <p className="text-muted-foreground text-xs">Total stock value</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.lowStockCount}
            </div>
            <p className="text-muted-foreground text-xs">
              Items below threshold
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.outOfStockCount}
            </div>
            <p className="text-muted-foreground text-xs">
              Items requiring immediate attention
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-90 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Inventory Tabs */}
      <div ref={contentRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} ref={tabsRef}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="low-stock" className="relative">
              Low Stock
              {summary.lowStockCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {summary.lowStockCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="out-of-stock" className="relative">
              Out of Stock
              {summary.outOfStockCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 text-xs"
                >
                  {summary.outOfStockCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <InventoryItemsList
              items={items}
              title="All Products"
              onViewProduct={onViewProduct}
              onAdjustStock={onAdjustStock}
              onRecordDelivery={onRecordDelivery}
              onDeleteProduct={onDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <InventoryItemsList
              items={lowStockItems}
              title="Low Stock Items"
              onViewProduct={onViewProduct}
              onAdjustStock={onAdjustStock}
              onRecordDelivery={onRecordDelivery}
              onDeleteProduct={onDeleteProduct}
              emptyMessage="No low stock items found"
            />
          </TabsContent>

          <TabsContent value="out-of-stock" className="space-y-4">
            <InventoryItemsList
              items={outOfStockItems}
              title="Out of Stock Items"
              onViewProduct={onViewProduct}
              onAdjustStock={onAdjustStock}
              onRecordDelivery={onRecordDelivery}
              onDeleteProduct={onDeleteProduct}
              emptyMessage="No out of stock items found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface InventoryItemsListProps {
  items: InventoryItem[]
  title: string
  onViewProduct: (product: InventoryItem) => void
  onAdjustStock: (product: InventoryItem) => void
  onRecordDelivery: (product: InventoryItem) => void
  onDeleteProduct?: (product: InventoryItem) => void
  emptyMessage?: string
}

function InventoryItemsList({
  items,
  title,
  onViewProduct,
  onAdjustStock,
  onRecordDelivery,
  onDeleteProduct,
  emptyMessage = "No products found"
}: InventoryItemsListProps) {
  const itemsListRef = useRef<HTMLDivElement>(null)
  const itemsContainerRef = useRef<HTMLDivElement>(null)

  // Animate items when they load or change
  useEffect(() => {
    if (items.length > 0 && itemsContainerRef.current) {
      const itemElements = itemsContainerRef.current.children

      gsap.set(itemElements, { opacity: 0, y: 20, scale: 0.95 })

      gsap.to(itemElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: {
          amount: 0.8,
          ease: "power2.out"
        },
        ease: "power3.out"
      })

      // Add hover animations for each item
      Array.from(itemElements).forEach(item => {
        const element = item as HTMLElement
        const buttons = element.querySelectorAll("button")
        const badges = element.querySelectorAll("[data-badge]")

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            scale: 1.02,
            y: -2,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            duration: 0.3,
            ease: "power2.out"
          })

          // Animate badges on hover
          gsap.to(badges, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
            stagger: 0.05
          })

          // Prepare buttons for enhanced interactions
          gsap.set(buttons, { transformOrigin: "center center" })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            scale: 1,
            y: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            duration: 0.3,
            ease: "power2.out"
          })

          gsap.to(badges, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
        })

        // Add individual button micro-interactions
        buttons.forEach((button, index) => {
          const buttonElement = button as HTMLElement

          buttonElement.addEventListener("mouseenter", () => {
            gsap.to(buttonElement, {
              scale: 1.1,
              rotate: index === 0 ? 5 : index === 1 ? -5 : 0, // Different rotations per button
              duration: 0.2,
              ease: "back.out(1.7)"
            })
          })

          buttonElement.addEventListener("mouseleave", () => {
            gsap.to(buttonElement, {
              scale: 1,
              rotate: 0,
              duration: 0.2,
              ease: "power2.out"
            })
          })

          buttonElement.addEventListener("mousedown", () => {
            gsap.to(buttonElement, {
              scale: 0.95,
              duration: 0.1,
              ease: "power2.out"
            })
          })

          buttonElement.addEventListener("mouseup", () => {
            gsap.to(buttonElement, {
              scale: 1.1,
              duration: 0.1,
              ease: "power2.out"
            })
          })
        })
      })
    }
  }, [items])

  // Animate title and header
  useEffect(() => {
    if (itemsListRef.current && items.length > 0) {
      const header = itemsListRef.current.querySelector(".card-header")
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
        )
      }
    }
  }, [items])
  const getStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "destructive"
      case "low_stock":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Out of Stock"
      case "low_stock":
        return "Low Stock"
      default:
        return "Normal"
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={itemsListRef}>
      <CardHeader className="card-header">
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={itemsContainerRef}>
          {items.map(item => (
            <div
              key={item.id}
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all"
              style={{
                transformOrigin: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="hover:text-primary font-medium transition-colors">
                    {item.name}
                  </h4>
                  {item.brand && (
                    <Badge
                      variant="outline"
                      className="hover:bg-muted text-xs transition-all"
                      data-badge="true"
                    >
                      {item.brand}
                    </Badge>
                  )}
                  <Badge
                    variant={getStatusColor(item.stockStatus)}
                    className="transition-all hover:shadow-md"
                    data-badge="true"
                    style={{
                      animation:
                        item.stockStatus === "out_of_stock"
                          ? "pulse 2s infinite"
                          : item.stockStatus === "low_stock"
                            ? "pulse 3s infinite"
                            : "none"
                    }}
                  >
                    {getStatusText(item.stockStatus)}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <span>
                    Stock: {item.currentStock} {item.unit}
                  </span>
                  <span>
                    Min: {item.minThreshold} {item.unit}
                  </span>
                  <span>Value: {formatCurrency(item.value)}</span>
                  {item.supplier && <span>Supplier: {item.supplier.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProduct(item)}
                  className="group transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  title="View Product Details"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStock(item)}
                  className="group transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                  title="Adjust Stock"
                >
                  <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecordDelivery(item)}
                  className="group transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  title="Record Delivery"
                >
                  <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                </Button>
                {onDeleteProduct && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(item)}
                    className="group text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
