"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"
import { getTodaysSalesSummary } from "@/actions/sales"
import { toast } from "sonner"

interface SalesSummaryProps {
  stationId: string
  userId?: string
  refreshTrigger?: number
}

interface SalesSummaryData {
  date: string
  totalTransactions: number
  totalAmount: number
  productTypeSummary: Record<string, {
    totalQuantity: number
    totalAmount: number
    transactionCount: number
  }>
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
  transactions: any[]
}

export function SalesSummary({ stationId, userId, refreshTrigger }: SalesSummaryProps) {
  const [summary, setSummary] = useState<SalesSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSummary = async () => {
    setLoading(true)
    try {
      const result = await getTodaysSalesSummary(stationId, userId)
      if (result.isSuccess && result.data) {
        setSummary(result.data)
      } else {
        toast.error(result.error || "Failed to load sales summary")
      }
    } catch (error) {
      toast.error("Failed to load sales summary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [stationId, userId, refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No sales data available</p>
          <Button variant="outline" onClick={loadSummary} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Today's Sales Summary</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(summary.date).toLocaleDateString('en-NG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSummary}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {summary.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ₦{summary.totalTransactions > 0 ? (summary.totalAmount / summary.totalTransactions).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary.productTypeSummary).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Types sold today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Type Breakdown */}
      {Object.keys(summary.productTypeSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.productTypeSummary).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={type === "pms" ? "default" : "secondary"}>
                      {type.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {data.totalQuantity} {type === "pms" ? "litres" : "units"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{data.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((data.totalAmount / summary.totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {summary.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>Best performing products today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.totalQuantity} {item.product.unit} • {item.transactionCount} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{item.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {summary.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Latest {Math.min(5, summary.transactions.length)} transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(transaction.transactionDate).toLocaleTimeString('en-NG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-semibold">₦{parseFloat(transaction.totalAmount).toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {transaction.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {parseFloat(item.quantity)} {item.product.unit} × {item.product.name}
                        </span>
                        <span>₦{parseFloat(item.totalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary.totalTransactions === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No sales recorded today</h3>
            <p className="text-muted-foreground">
              Start recording sales to see your daily summary here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}