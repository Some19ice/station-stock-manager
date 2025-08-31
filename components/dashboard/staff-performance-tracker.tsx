"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react"

interface PerformanceData {
  dailyTarget: number
  currentSales: number
  weeklyAverage: number
  monthlyRank: number
  totalStaff: number
  achievements: string[]
}

export function StaffPerformanceTracker() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null)

  useEffect(() => {
    // Mock data - replace with actual API call
    setPerformance({
      dailyTarget: 50000,
      currentSales: 35000,
      weeklyAverage: 42000,
      monthlyRank: 3,
      totalStaff: 8,
      achievements: ["Top Seller This Week", "Customer Favorite"]
    })
  }, [])

  if (!performance) return null

  const targetProgress = (performance.currentSales / performance.dailyTarget) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Performance Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Daily Target Progress</span>
            <span className="text-sm font-medium">
              ₦{performance.currentSales.toLocaleString()} / ₦{performance.dailyTarget.toLocaleString()}
            </span>
          </div>
          <Progress value={targetProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {targetProgress.toFixed(1)}% of daily target achieved
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Weekly Avg</span>
            </div>
            <p className="font-semibold">₦{performance.weeklyAverage.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Rank</span>
            </div>
            <p className="font-semibold">#{performance.monthlyRank} of {performance.totalStaff}</p>
          </div>
        </div>

        {performance.achievements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Achievements</p>
            <div className="flex flex-wrap gap-1">
              {performance.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
