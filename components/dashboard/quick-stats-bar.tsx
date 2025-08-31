"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ShoppingCart } from "lucide-react"

interface StaffStats {
  salesAmount: number
  transactionCount: number
}

interface QuickStatsBarProps {
  className?: string
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  className = ""
}) => {
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call to getTodaysSalesSummary
        // For now, using mock data
        const mockStats: StaffStats = {
          salesAmount: 45000,
          transactionCount: 12
        }

        setStats(mockStats)
        setLoading(false)
      } catch (err) {
        setError("Failed to load today's stats")
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className={`mb-6 rounded-lg bg-gray-50 p-4 ${className}`}>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={`mb-6 rounded-lg bg-gray-50 p-4 ${className}`}>
        <div className="text-center text-gray-600">
          <p>Unable to load today's statistics</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-6 rounded-lg bg-gray-50 p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center">
            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
            <p className="text-sm text-gray-600">My Sales Today</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₦{stats.salesAmount.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-600">Transactions</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.transactionCount}
          </p>
        </div>
      </div>
    </div>
  )
}



