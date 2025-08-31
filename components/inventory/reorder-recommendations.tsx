"use client"

import { useState, useEffect, useCallback } from "react"
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
  brand?: string | null
  type: "pms" | "lubricant"
  currentStock: number
  minThreshold: number
  recommendedQuantity: number
  avgDailySales: number
  daysUntilStockout: number | null
  supplier?: {
    id: string
    name: string
    contactPerson?: string | null
    phone?: string | null
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
  const [recommendations, setRecommendations] = useState<
    ReorderRecommendation[]
  >([])
  const [summary, setSummary] = useState({
    totalProducts: 0,
    urgentCount: 0,
    highPriorityCount: 0,
    mediumPriorityCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecommendations = useCallback(async () => {
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
  }, [stationId])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

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
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="bg-muted h-5 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-36 animate-pulse rounded" />
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
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-muted-foreground text-xs">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.urgentCount}
            </div>
            <p className="text-muted-foreground text-xs">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.highPriorityCount}
            </div>
            <p className="text-muted-foreground text-xs">Order soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medium Priority
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.mediumPriorityCount}
            </div>
            <p className="text-muted-foreground text-xs">Plan ahead</p>
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
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No reorder recommendations
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                All products are above their minimum thresholds
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map(recommendation => (
                <div
                  key={recommendation.productId}
                  className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold">{recommendation.name}</h4>
                        {recommendation.brand && (
                          <Badge variant="outline" className="text-xs">
                            {recommendation.brand}
                          </Badge>
                        )}
                        <Badge
                          variant={getPriorityColor(recommendation.priority)}
                        >
                          {getPriorityIcon(recommendation.priority)}
                          <span className="ml-1 capitalize">
                            {recommendation.priority}
                          </span>
                        </Badge>
                      </div>

                      <div className="text-muted-foreground grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <span className="font-medium">Current Stock:</span>
                          <br />
                          <span
                            className={
                              recommendation.currentStock === 0
                                ? "font-medium text-red-600"
                                : ""
                            }
                          >
                            {recommendation.currentStock} units
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Min Threshold:</span>
                          <br />
                          <span>{recommendation.minThreshold} units</span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Recommended Order:
                          </span>
                          <br />
                          <span className="font-medium text-green-600">
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
                          <span className="font-medium">
                            Days until stockout:
                          </span>
                          <span
                            className={`ml-1 ${
                              recommendation.daysUntilStockout <= 3
                                ? "font-medium text-red-600"
                                : recommendation.daysUntilStockout <= 7
                                  ? "text-orange-600"
                                  : ""
                            }`}
                          >
                            {recommendation.daysUntilStockout} days
                          </span>
                        </div>
                      )}

                      {recommendation.supplier && (
                        <div className="bg-muted mt-2 rounded p-2 text-sm">
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

                    <div className="ml-4 flex flex-col gap-2">
                      {onRecordDelivery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onRecordDelivery(recommendation.productId)
                          }
                        >
                          Record Delivery
                        </Button>
                      )}
                      {recommendation.supplier?.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${recommendation.supplier.phone}`}>
                            <Phone className="mr-1 h-4 w-4" />
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
