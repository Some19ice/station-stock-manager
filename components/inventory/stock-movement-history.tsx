"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getStockMovementHistory } from "@/actions/inventory"
import { getProducts } from "@/actions/products"
import {
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Settings
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface StockMovement {
  id: string
  productId: string
  movementType: "sale" | "adjustment" | "delivery"
  quantity: string
  previousStock: string
  newStock: string
  reference?: string | null
  createdAt: Date
  product: {
    id: string
    name: string
    brand?: string | null
    type: "pms" | "lubricant"
    unit: string
  } | null
}

interface Product {
  id: string
  name: string
  brand?: string | null
  type: "pms" | "lubricant"
}

interface StockMovementHistoryProps {
  stationId: string
}

export function StockMovementHistory({ stationId }: StockMovementHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [selectedMovementType, setSelectedMovementType] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [limit, setLimit] = useState<number>(50)

  const fetchData = useCallback(async () => {
    try {
      // Fetch products for filter dropdown
      const productsResult = await getProducts(stationId)
      if (productsResult.isSuccess && productsResult.data) {
        setProducts(productsResult.data)
      }

      // Fetch stock movements with filters
      const filters: {
        productId?: string
        movementType?: "sale" | "adjustment" | "delivery"
        startDate?: Date
        endDate?: Date
        limit?: number
      } = { limit }
      if (selectedProduct && selectedProduct !== "all") filters.productId = selectedProduct
      if (selectedMovementType && selectedMovementType !== "all")
        filters.movementType = selectedMovementType as
          | "sale"
          | "adjustment"
          | "delivery"
      if (startDate) filters.startDate = new Date(startDate)
      if (endDate) filters.endDate = new Date(endDate)

      const movementsResult = await getStockMovementHistory({
        stationId,
        ...filters
      })
      if (movementsResult.isSuccess && movementsResult.data) {
        setMovements(movementsResult.data)
      }
    } catch (error) {
      console.error("Error fetching stock movement history:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [
    stationId,
    selectedProduct,
    selectedMovementType,
    startDate,
    endDate,
    limit
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  const clearFilters = () => {
    setSelectedProduct("")
    setSelectedMovementType("")
    setStartDate("")
    setEndDate("")
    setLimit(50)
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "delivery":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "adjustment":
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "sale":
        return "destructive"
      case "delivery":
        return "default"
      case "adjustment":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getMovementText = (type: string) => {
    switch (type) {
      case "sale":
        return "Sale"
      case "delivery":
        return "Delivery"
      case "adjustment":
        return "Adjustment"
      default:
        return type
    }
  }

  const formatQuantity = (quantity: string, type: string) => {
    const num = parseFloat(quantity)
    const sign = type === "sale" ? "-" : "+"
    return `${sign}${Math.abs(num)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 rounded-lg border p-4"
              >
                <div className="bg-muted h-8 w-8 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-48 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-6 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="product-filter">Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} {product.brand && `(${product.brand})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Movement Type</Label>
              <Select
                value={selectedMovementType}
                onValueChange={setSelectedMovementType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="delivery">Deliveries</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Select
                value={limit.toString()}
                onValueChange={value => setLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 records</SelectItem>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="200">200 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stock Movement History
            <Badge variant="outline">{movements.length} movements</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No stock movements found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map(movement => (
                <div
                  key={movement.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getMovementIcon(movement.movementType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {movement.product && (
                        <>
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="truncate font-medium">
                              {movement.product.name}
                            </h4>
                            {movement.product.brand && (
                              <Badge variant="outline" className="text-xs">
                                {movement.product.brand}
                              </Badge>
                            )}
                            <Badge
                              variant={getMovementColor(movement.movementType)}
                            >
                              {getMovementText(movement.movementType)}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <span>
                              {formatQuantity(
                                movement.quantity,
                                movement.movementType
                              )}{" "}
                              {movement.product.unit}
                            </span>
                            <span>
                              Stock: {movement.previousStock} →{" "}
                              {movement.newStock} {movement.product.unit}
                            </span>
                            {movement.reference && (
                              <span className="truncate">
                                {movement.reference}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(movement.createdAt), {
                        addSuffix: true
                      })}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
