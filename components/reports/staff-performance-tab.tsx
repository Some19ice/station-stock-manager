"use client"

import { useState } from "react"
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

      {performanceData.length > 0 && (
        <div className="space-y-6 print:space-y-4">
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
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-muted-foreground text-sm">Active Staff</p>
                </div>
                <p className="text-2xl font-bold">{stats.staffCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-muted-foreground text-sm">Total Sales</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalSales)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <p className="text-muted-foreground text-sm">
                    Total Transactions
                  </p>
                </div>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <p className="text-muted-foreground text-sm">Avg per Staff</p>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.averagePerStaff)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of each staff member's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((staff, index) => (
                  <div key={staff.staffId} className="rounded-lg border p-4">
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
                        className={
                          index === 0 ? "bg-yellow-500 hover:bg-yellow-600" : ""
                        }
                      >
                        {index === 0 ? "🏆 Top Performer" : `#${index + 1}`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Total Sales
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(staff.totalSales)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Transactions
                        </p>
                        <p className="text-lg font-semibold">
                          {staff.transactionCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Average Transaction
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(staff.averageTransaction)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
