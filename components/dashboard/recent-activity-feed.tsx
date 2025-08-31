"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ShoppingCart } from "lucide-react"

interface RecentTransaction {
  id: string
  timestamp: Date
  productName: string
  quantity: number
  unit: string
  amount: number
}

interface RecentActivityFeedProps {
  className?: string
  limit?: number
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  className = "",
  limit = 5
}) => {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        // TODO: Replace with actual API call to get recent transactions for current user
        // For now, using mock data
        const mockTransactions: RecentTransaction[] = [
          {
            id: "1",
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            productName: "PMS Premium",
            quantity: 20,
            unit: "liters",
            amount: 13000
          },
          {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            productName: "Engine Oil 5W-30",
            quantity: 3,
            unit: "bottles",
            amount: 3600
          },
          {
            id: "3",
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
            productName: "Diesel",
            quantity: 15,
            unit: "liters",
            amount: 8700
          },
          {
            id: "4",
            timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
            productName: "Brake Fluid",
            quantity: 2,
            unit: "bottles",
            amount: 1600
          },
          {
            id: "5",
            timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
            productName: "PMS Premium",
            quantity: 25,
            unit: "liters",
            amount: 16250
          }
        ]

        setTransactions(mockTransactions.slice(0, limit))
        setLoading(false)
      } catch (err) {
        setError("Failed to load recent activity")
        setLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [limit])

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Your Recent Sales
        </h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || transactions.length === 0) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Your Recent Sales
        </h3>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <ShoppingCart className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground">
                {error || "No recent sales found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Your Recent Sales
      </h3>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.productName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transaction.quantity} {transaction.unit} •{" "}
                      {formatTimeAgo(transaction.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


