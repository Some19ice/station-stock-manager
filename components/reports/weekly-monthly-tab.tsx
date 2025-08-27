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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { generateWeeklyReport, generateMonthlyReport } from "@/actions/reports"
import { useStationAuth } from "@/hooks/use-station-auth"
import { toast } from "sonner"
import {
  Loader2,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react"

interface WeeklyReportData {
  dailyBreakdown: Array<{
    date: string
    totalSales: string
    transactionCount: number
  }>
  weekTotals: {
    totalSales: string
    totalTransactions: number
  }
}

interface MonthlyReportData {
  weeklyBreakdown: Array<{
    week: string
    totalSales: string
    transactionCount: number
  }>
  monthTotals: {
    totalSales: string
    totalTransactions: number
  }
  productPerformance: Array<{
    productName: string
    type: string
    totalQuantity: string
    totalRevenue: string
  }>
}

export function WeeklyMonthlyTab() {
  const { user } = useStationAuth()
  const [activeTab, setActiveTab] = useState("weekly")

  // Weekly report state
  const [weeklyStartDate, setWeeklyStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [weeklyEndDate, setWeeklyEndDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null)
  const [weeklyLoading, setWeeklyLoading] = useState(false)

  // Monthly report state
  const [monthlyStartDate, setMonthlyStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  )
  const [monthlyEndDate, setMonthlyEndDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [monthlyData, setMonthlyData] = useState<MonthlyReportData | null>(null)
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  const handleGenerateWeeklyReport = async () => {
    if (!user?.stationId) {
      toast.error("Station information not found")
      return
    }

    if (new Date(weeklyStartDate) > new Date(weeklyEndDate)) {
      toast.error("Start date cannot be after end date")
      return
    }

    setWeeklyLoading(true)
    try {
      const result = await generateWeeklyReport({
        stationId: user.stationId,
        startDate: new Date(weeklyStartDate),
        endDate: new Date(weeklyEndDate)
      })

      if (result.isSuccess && result.data) {
        // Transform null values to "0" strings
        const transformedData = {
          ...result.data,
          dailyBreakdown: result.data.dailyBreakdown.map(day => ({
            ...day,
            totalSales: day.totalSales || "0"
          })),
          weekTotals: {
            ...result.data.weekTotals,
            totalSales: result.data.weekTotals.totalSales || "0"
          }
        }
        setWeeklyData(transformedData)
        toast.success("Weekly report generated successfully")
      } else {
        toast.error(result.error || "Failed to generate weekly report")
      }
    } catch (error) {
      toast.error("An error occurred while generating the report")
    } finally {
      setWeeklyLoading(false)
    }
  }

  const handleGenerateMonthlyReport = async () => {
    if (!user?.stationId) {
      toast.error("Station information not found")
      return
    }

    if (new Date(monthlyStartDate) > new Date(monthlyEndDate)) {
      toast.error("Start date cannot be after end date")
      return
    }

    setMonthlyLoading(true)
    try {
      const result = await generateMonthlyReport({
        stationId: user.stationId,
        startDate: new Date(monthlyStartDate),
        endDate: new Date(monthlyEndDate)
      })

      if (result.isSuccess && result.data) {
        // Transform null values to "0" strings
        const transformedData = {
          ...result.data,
          weeklyBreakdown: result.data.weeklyBreakdown.map(week => ({
            ...week,
            totalSales: week.totalSales || "0"
          })),
          monthTotals: {
            ...result.data.monthTotals,
            totalSales: result.data.monthTotals.totalSales || "0"
          },
          productPerformance: result.data.productPerformance.map(product => ({
            ...product,
            totalQuantity: product.totalQuantity || "0",
            totalRevenue: product.totalRevenue || "0"
          }))
        }
        setMonthlyData(transformedData)
        toast.success("Monthly report generated successfully")
      } else {
        toast.error(result.error || "Failed to generate monthly report")
      }
    } catch (error) {
      toast.error("An error occurred while generating the report")
    } finally {
      setMonthlyLoading(false)
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportWeekly = () => {
    if (!weeklyData) return
    const csvContent = generateWeeklyCSV(
      weeklyData,
      weeklyStartDate,
      weeklyEndDate
    )
    downloadCSV(
      csvContent,
      `weekly-report-${weeklyStartDate}-to-${weeklyEndDate}.csv`
    )
  }

  const handleExportMonthly = () => {
    if (!monthlyData) return
    const csvContent = generateMonthlyCSV(
      monthlyData,
      monthlyStartDate,
      monthlyEndDate
    )
    downloadCSV(
      csvContent,
      `monthly-report-${monthlyStartDate}-to-${monthlyEndDate}.csv`
    )
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Reports</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <div className="space-y-6">
            {/* Weekly Report Controls */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="weekly-start-date">Start Date</Label>
                <Input
                  id="weekly-start-date"
                  type="date"
                  value={weeklyStartDate}
                  onChange={e => setWeeklyStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="weekly-end-date">End Date</Label>
                <Input
                  id="weekly-end-date"
                  type="date"
                  value={weeklyEndDate}
                  onChange={e => setWeeklyEndDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateWeeklyReport}
                  disabled={weeklyLoading}
                  className="w-full"
                >
                  {weeklyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Generate Weekly Report
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Weekly Report Display */}
            {weeklyData && (
              <div className="space-y-6 print:space-y-4">
                <div className="flex items-center justify-between print:hidden">
                  <h3 className="text-lg font-semibold">
                    Weekly Report (
                    {new Date(weeklyStartDate).toLocaleDateString()} -{" "}
                    {new Date(weeklyEndDate).toLocaleDateString()})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportWeekly}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-muted-foreground text-sm">
                          Total Sales
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(weeklyData.weekTotals.totalSales)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <p className="text-muted-foreground text-sm">
                          Total Transactions
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {weeklyData.weekTotals.totalTransactions}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <p className="text-muted-foreground text-sm">
                          Daily Average
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          (
                            parseFloat(weeklyData.weekTotals.totalSales) /
                            weeklyData.dailyBreakdown.length
                          ).toFixed(2)
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklyData.dailyBreakdown.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric"
                              })}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {day.transactionCount} transactions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(day.totalSales)}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {day.transactionCount > 0
                                ? formatCurrency(
                                    (
                                      parseFloat(day.totalSales) /
                                      day.transactionCount
                                    ).toFixed(2)
                                  )
                                : "₦0"}{" "}
                              avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="space-y-6">
            {/* Monthly Report Controls */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="monthly-start-date">Start Date</Label>
                <Input
                  id="monthly-start-date"
                  type="date"
                  value={monthlyStartDate}
                  onChange={e => setMonthlyStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="monthly-end-date">End Date</Label>
                <Input
                  id="monthly-end-date"
                  type="date"
                  value={monthlyEndDate}
                  onChange={e => setMonthlyEndDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateMonthlyReport}
                  disabled={monthlyLoading}
                  className="w-full"
                >
                  {monthlyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Generate Monthly Report
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Monthly Report Display */}
            {monthlyData && (
              <div className="space-y-6 print:space-y-4">
                <div className="flex items-center justify-between print:hidden">
                  <h3 className="text-lg font-semibold">
                    Monthly Report (
                    {new Date(monthlyStartDate).toLocaleDateString()} -{" "}
                    {new Date(monthlyEndDate).toLocaleDateString()})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportMonthly}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>

                {/* Monthly Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-muted-foreground text-sm">
                          Total Sales
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(monthlyData.monthTotals.totalSales)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <p className="text-muted-foreground text-sm">
                          Total Transactions
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {monthlyData.monthTotals.totalTransactions}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <p className="text-muted-foreground text-sm">
                          Weekly Average
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          (
                            parseFloat(monthlyData.monthTotals.totalSales) /
                            Math.max(monthlyData.weeklyBreakdown.length, 1)
                          ).toFixed(2)
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {monthlyData.weeklyBreakdown.map((week, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">Week {week.week}</p>
                            <p className="text-muted-foreground text-sm">
                              {week.transactionCount} transactions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(week.totalSales)}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {week.transactionCount > 0
                                ? formatCurrency(
                                    (
                                      parseFloat(week.totalSales) /
                                      week.transactionCount
                                    ).toFixed(2)
                                  )
                                : "₦0"}{" "}
                              avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>
                      Top performing products for the month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {monthlyData.productPerformance
                        .slice(0, 10)
                        .map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                <span className="text-xs font-semibold text-blue-600">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {product.productName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {product.type.toUpperCase()}
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    {parseFloat(
                                      product.totalQuantity
                                    ).toLocaleString()}{" "}
                                    units
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {formatCurrency(product.totalRevenue)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generateWeeklyCSV(
  data: WeeklyReportData,
  startDate: string,
  endDate: string
): string {
  const lines = [
    `Weekly Report - ${startDate} to ${endDate}`,
    "",
    "Summary",
    `Total Sales,${data.weekTotals.totalSales}`,
    `Total Transactions,${data.weekTotals.totalTransactions}`,
    "",
    "Daily Breakdown",
    "Date,Sales,Transactions,Average Transaction"
  ]

  data.dailyBreakdown.forEach(day => {
    const avgTransaction =
      day.transactionCount > 0
        ? (parseFloat(day.totalSales) / day.transactionCount).toFixed(2)
        : "0"
    lines.push(
      `${day.date},${day.totalSales},${day.transactionCount},${avgTransaction}`
    )
  })

  return lines.join("\n")
}

function generateMonthlyCSV(
  data: MonthlyReportData,
  startDate: string,
  endDate: string
): string {
  const lines = [
    `Monthly Report - ${startDate} to ${endDate}`,
    "",
    "Summary",
    `Total Sales,${data.monthTotals.totalSales}`,
    `Total Transactions,${data.monthTotals.totalTransactions}`,
    "",
    "Weekly Breakdown",
    "Week,Sales,Transactions,Average Transaction"
  ]

  data.weeklyBreakdown.forEach(week => {
    const avgTransaction =
      week.transactionCount > 0
        ? (parseFloat(week.totalSales) / week.transactionCount).toFixed(2)
        : "0"
    lines.push(
      `Week ${week.week},${week.totalSales},${week.transactionCount},${avgTransaction}`
    )
  })

  lines.push("")
  lines.push("Product Performance")
  lines.push("Product Name,Type,Total Quantity,Total Revenue")

  data.productPerformance.forEach(product => {
    lines.push(
      `${product.productName},${product.type},${product.totalQuantity},${product.totalRevenue}`
    )
  })

  return lines.join("\n")
}
