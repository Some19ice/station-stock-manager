"use client"

import { useState, useEffect } from "react"
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
  brand?: string
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
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchInventoryStatus = async () => {
    try {
      const result = await getInventoryStatus(stationId)
      if (result.isSuccess && result.data) {
        setInventoryStatus(result.data)
      }
    } catch (error) {
      console.error("Error fetching inventory status:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInventoryStatus()
  }, [stationId])

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
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!inventoryStatus) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load inventory status</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
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

  const lowStockItems = items.filter(item => item.isLowStock && !item.isOutOfStock)
  const outOfStockItems = items.filter(item => item.isOutOfStock)
  const normalStockItems = items.filter(item => !item.isLowStock)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
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
            <div className="text-2xl font-bold text-red-600">{summary.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
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
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
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
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Stock: {item.currentStock} {item.unit}
                  </span>
                  <span>
                    Min: {item.minThreshold} {item.unit}
                  </span>
                  <span>
                    Value: {formatCurrency(item.value)}
                  </span>
                  {item.supplier && (
                    <span>
                      Supplier: {item.supplier.name}
                    </span>
                  )}
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