"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateReorderRecommendations } from "@/actions/inventory"
import { 
  AlertTriangle,
  Clock,
  Phone,
  RefreshCw,
  ShoppingCart,
  TrendingDown
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ReorderRecommendation {
  productId: string
  name: string
  brand?: string
  type: "pms" | "lubricant"
  currentStock: number
  minThreshold: number
  recommendedQuantity: number
  avgDailySales: number
  daysUntilStockout: number | null
  supplier?: {
    id: string
    name: string
    contactPerson?: string
    phone?: string
  } | null
  priority: "urgent" | "high" | "medium"
}

interface ReorderRecommendationsProps {
  stationId: string
  onRecordDelivery?: (productId: string) => void
}

export function ReorderRecommendations({ 
  stationId, 
  onRecordDelivery 
}: ReorderRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([])
  const [summary, setSummary] = useState({
    totalProducts: 0,
    urgentCount: 0,
    highPriorityCount: 0,
    mediumPriorityCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecommendations = async () => {
    try {
      const result = await generateReorderRecommendations(stationId)
      if (result.isSuccess && result.data) {
        setRecommendations(result.data.recommendations)
        setSummary(result.data.summary)
      }
    } catch (error) {
      console.error("Error fetching reorder recommendations:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [stationId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRecommendations()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reorder Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.urgentCount}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Order soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.mediumPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Plan ahead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Reorder Recommendations
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reorder recommendations</p>
              <p className="text-sm text-muted-foreground mt-1">
                All products are above their minimum thresholds
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.productId}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{recommendation.name}</h4>
                        {recommendation.brand && (
                          <Badge variant="outline" className="text-xs">
                            {recommendation.brand}
                          </Badge>
                        )}
                        <Badge variant={getPriorityColor(recommendation.priority)}>
                          {getPriorityIcon(recommendation.priority)}
                          <span className="ml-1 capitalize">{recommendation.priority}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Current Stock:</span>
                          <br />
                          <span className={recommendation.currentStock === 0 ? "text-red-600 font-medium" : ""}>
                            {recommendation.currentStock} units
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Min Threshold:</span>
                          <br />
                          <span>{recommendation.minThreshold} units</span>
                        </div>
                        <div>
                          <span className="font-medium">Recommended Order:</span>
                          <br />
                          <span className="text-green-600 font-medium">
                            {recommendation.recommendedQuantity} units
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Avg Daily Sales:</span>
                          <br />
                          <span>{recommendation.avgDailySales} units/day</span>
                        </div>
                      </div>

                      {recommendation.daysUntilStockout !== null && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Days until stockout:</span>
                          <span className={`ml-1 ${recommendation.daysUntilStockout <= 3 ? "text-red-600 font-medium" : 
                                                   recommendation.daysUntilStockout <= 7 ? "text-orange-600" : ""}`}>
                            {recommendation.daysUntilStockout} days
                          </span>
                        </div>
                      )}

                      {recommendation.supplier && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Supplier:</span>
                            <span>{recommendation.supplier.name}</span>
                            {recommendation.supplier.contactPerson && (
                              <span className="text-muted-foreground">
                                ({recommendation.supplier.contactPerson})
                              </span>
                            )}
                            {recommendation.supplier.phone && (
                              <a 
                                href={`tel:${recommendation.supplier.phone}`}
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {recommendation.supplier.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {onRecordDelivery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRecordDelivery(recommendation.productId)}
                        >
                          Record Delivery
                        </Button>
                      )}
                      {recommendation.supplier?.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`tel:${recommendation.supplier.phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
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