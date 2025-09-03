"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  getStaffPerformanceReport,
  type StaffPerformanceData
} from "@/actions/reports"
import { useStationAuth } from "@/hooks/use-station-auth"
import { toast } from "sonner"
import { Loader2, Download, Printer, TrendingUp, Users } from "lucide-react"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"
import { SimpleLoading } from "@/components/ui/simple-loading"

export function StaffPerformanceTab() {
  const { user } = useStationAuth()
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [performanceData, setPerformanceData] = useState<
    StaffPerformanceData[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // Animate performance data when it appears
  useEffect(() => {
    if (performanceData.length > 0 && reportRef.current && !isLoading) {
      const tl = gsap.timeline()
      
      tl.fromTo(
        reportRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      ).fromTo(
        reportRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.3"
      )
    }
  }, [performanceData, isLoading])

  const handleGenerateReport = async () => {
    if (!user?.stationId) {
      toast.error("Station information not found")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date")
      return
    }

    setIsLoading(true)
    try {
      const result = await getStaffPerformanceReport({
        stationId: user.stationId,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })

      if (result.isSuccess && result.data) {
        setPerformanceData(result.data)
        toast.success("Staff performance report generated successfully")
      } else {
        toast.error(result.error || "Failed to generate report")
      }
    } catch (error) {
      toast.error("An error occurred while generating the report")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (performanceData.length === 0) return

    const csvContent = generateCSVContent(performanceData, startDate, endDate)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-performance-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  const getTotalStats = () => {
    const totalTransactions = performanceData.reduce(
      (sum, staff) => sum + staff.transactionCount,
      0
    )
    const totalSales = performanceData.reduce(
      (sum, staff) => sum + parseFloat(staff.totalSales),
      0
    )
    const averagePerStaff =
      performanceData.length > 0 ? totalSales / performanceData.length : 0

    return {
      totalTransactions,
      totalSales: totalSales.toFixed(2),
      averagePerStaff: averagePerStaff.toFixed(2),
      staffCount: performanceData.length
    }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <AnimatedCard className="text-center">
          <SimpleLoading message="Generating Staff Performance Report" />
        </AnimatedCard>
      )}

      {performanceData.length > 0 && !isLoading && (
        <div ref={reportRef} className="space-y-6 print:space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-semibold">
              Staff Performance Report (
              {new Date(startDate).toLocaleDateString()} -{" "}
              {new Date(endDate).toLocaleDateString()})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <AnimatedCard hoverEffect={true} className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <p className="text-muted-foreground text-sm">Active Staff</p>
              </div>
              <p className="text-2xl font-bold">{stats.staffCount}</p>
            </AnimatedCard>
            <AnimatedCard hoverEffect={true} className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-muted-foreground text-sm">Total Sales</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSales)}
              </p>
            </AnimatedCard>
            <AnimatedCard hoverEffect={true} className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-muted-foreground text-sm">
                  Total Transactions
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </AnimatedCard>
            <AnimatedCard hoverEffect={true} className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <p className="text-muted-foreground text-sm">Avg per Staff</p>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.averagePerStaff)}
              </p>
            </AnimatedCard>
          </div>

          {/* Individual Staff Performance */}
          <AnimatedCard title="Individual Performance" hoverEffect={true}>
            <p className="text-muted-foreground mb-4">
              Detailed breakdown of each staff member's performance
            </p>
            <div className="space-y-4">
              {performanceData.map((staff, index) => (
                <AnimatedStaffItem
                  key={staff.staffId}
                  staff={staff}
                  index={index}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </AnimatedCard>
        </div>
      )}

      {performanceData.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              No staff performance data available for the selected date range.
              Generate a report to view staff performance metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Animated staff performance item component
const AnimatedStaffItem = ({
  staff,
  index,
  formatCurrency
}: {
  staff: StaffPerformanceData
  index: number
  formatCurrency: (amount: string) => string
}) => {
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!itemRef.current) return

    gsap.fromTo(
      itemRef.current,
      { opacity: 0, x: -20, scale: 0.95 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        delay: index * 0.1,
        ease: "power2.out"
      }
    )
  }, [index])

  return (
    <div
      ref={itemRef}
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {index + 1}
            </span>
          </div>
          <div>
            <h4 className="font-semibold">{staff.username}</h4>
            <p className="text-muted-foreground text-sm">
              Top Product: {staff.topProduct}
            </p>
          </div>
        </div>
        <Badge
          variant={index === 0 ? "default" : "secondary"}
          className={index === 0 ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          {index === 0 ? "🏆 Top Performer" : `#${index + 1}`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-sm">Total Sales</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(staff.totalSales)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Transactions</p>
          <p className="text-lg font-semibold">{staff.transactionCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Avg per Transaction</p>
          <p className="text-lg font-semibold">
            {formatCurrency(staff.averageTransaction)}
          </p>
        </div>
      </div>
    </div>
  )
}

function generateCSVContent(
  data: StaffPerformanceData[],
  startDate: string,
  endDate: string
): string {
  const lines = [
    `Staff Performance Report - ${startDate} to ${endDate}`,
    "",
    "Username,Total Sales,Transaction Count,Average Transaction,Top Product"
  ]

  data.forEach(staff => {
    lines.push(
      `${staff.username},${staff.totalSales},${staff.transactionCount},${staff.averageTransaction},${staff.topProduct}`
    )
  })

  return lines.join("\n")
}
