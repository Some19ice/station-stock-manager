"use client"

import { useState, useEffect, useCallback } from "react"
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
  Settings
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
}

export function InventoryDashboard({
  stationId,
  onViewProduct,
  onAdjustStock,
  onRecordDelivery
}: InventoryDashboardProps) {
  const [inventoryStatus, setInventoryStatus] =
    useState<InventoryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded" />
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
        </Card>

        <Card>
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
        </Card>

        <Card>
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
        </Card>

        <Card>
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
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
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
          />
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <InventoryItemsList
            items={lowStockItems}
            title="Low Stock Items"
            onViewProduct={onViewProduct}
            onAdjustStock={onAdjustStock}
            onRecordDelivery={onRecordDelivery}
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
            emptyMessage="No out of stock items found"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface InventoryItemsListProps {
  items: InventoryItem[]
  title: string
  onViewProduct: (product: InventoryItem) => void
  onAdjustStock: (product: InventoryItem) => void
  onRecordDelivery: (product: InventoryItem) => void
  emptyMessage?: string
}

function InventoryItemsList({
  items,
  title,
  onViewProduct,
  onAdjustStock,
  onRecordDelivery,
  emptyMessage = "No products found"
}: InventoryItemsListProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="font-medium">{item.name}</h4>
                  {item.brand && (
                    <Badge variant="outline" className="text-xs">
                      {item.brand}
                    </Badge>
                  )}
                  <Badge variant={getStatusColor(item.stockStatus)}>
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
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStock(item)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecordDelivery(item)}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
