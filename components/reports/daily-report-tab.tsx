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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { generateDailyReport, type DailyReportData } from "@/actions/reports"
import { useStationAuth } from "@/hooks/use-station-auth"
import { toast } from "sonner"
import { Loader2, Download, Printer } from "lucide-react"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"
import { SimpleLoading } from "@/components/ui/simple-loading"

export function DailyReportTab() {
  const { user } = useStationAuth()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [reportData, setReportData] = useState<DailyReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // Load saved report data after hydration
  useEffect(() => {
    const saved = localStorage.getItem("dailyReportData")
    if (saved) {
      setReportData(JSON.parse(saved))
    }
  }, [])

  // Animate report data when it appears
  useEffect(() => {
    if (reportData && reportRef.current && !isLoading) {
      // Animate out loading state first, then animate in report
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
  }, [reportData, isLoading])

  const handleGenerateReport = async () => {
    if (!user?.stationId) {
      toast.error("Station information not found")
      return
    }

    setIsLoading(true)
    try {
      const result = await generateDailyReport({
        stationId: user.stationId,
        startDate: new Date(selectedDate),
        endDate: new Date(selectedDate)
      })

      if (result.isSuccess && result.data) {
        setReportData(result.data)
        localStorage.setItem("dailyReportData", JSON.stringify(result.data))
        toast.success("Daily report generated successfully")
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
    if (!reportData) return

    const csvContent = generateCSVContent(reportData, selectedDate)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `daily-report-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  interface LubricantItem {
    productName: string
    brand: string
    openingStock: string | number
    unitsSold: string | number
    closingStock: string | number
    revenue: string | number
  }

  // Helper function to safely convert string | number to number
  const toNumber = (value: string | number): number => {
    return typeof value === "string" ? parseFloat(value) : value
  }

  // Animated lubricant item component
  const AnimatedLubricantItem = ({
    item,
    index
  }: {
    item: LubricantItem
    index: number
  }) => {
    const itemRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!itemRef.current) return

      gsap.fromTo(
        itemRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
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
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-semibold">{item.productName}</h4>
          <Badge variant="secondary">{item.brand}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Opening Stock</p>
            <p className="font-medium">
              {toNumber(item.openingStock).toLocaleString()} units
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Units Sold</p>
            <p className="font-medium text-blue-600">
              {toNumber(item.unitsSold).toLocaleString()} units
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Closing Stock</p>
            <p className="font-medium">
              {toNumber(item.closingStock).toLocaleString()} units
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="font-medium text-green-600">
              {formatCurrency(toNumber(item.revenue).toString())}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="report-date">Report Date</Label>
          <Input
            id="report-date"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="min-w-[120px]"
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

      {isLoading && (
        <AnimatedCard className="text-center">
          <SimpleLoading message="Generating Daily Report" />
        </AnimatedCard>
      )}

      {reportData && !isLoading && (
        <div className="space-y-6 print:space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-semibold">
              Daily Report - {new Date(selectedDate).toLocaleDateString()}
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

          {/* Sales Overview */}
          <AnimatedCard title="Sales Overview" hoverEffect={true}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.salesOverview.totalSales)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Transactions</p>
                <p className="text-2xl font-bold">
                  {reportData.salesOverview.totalTransactions}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Average Transaction
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.salesOverview.averageTransaction)}
                </p>
              </div>
            </div>

            {/* All Products Sold */}
            <Separator className="my-4" />
            <div>
              <h4 className="mb-3 font-semibold">Products Sold</h4>
              {reportData.salesOverview.productsSold &&
              reportData.salesOverview.productsSold.length > 0 ? (
                <div className="space-y-3">
                  {reportData.salesOverview.productsSold.map(
                    (product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-muted-foreground text-sm">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(product.revenue)}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {parseFloat(product.quantitySold).toLocaleString()}{" "}
                            {product.unit}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">
                  No products sold on this date
                </p>
              )}
            </div>
          </AnimatedCard>

          {/* PMS Report */}
          <AnimatedCard title="PMS Report" hoverEffect={true}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-sm">Opening Stock</p>
                <p className="text-xl font-semibold">
                  {parseFloat(
                    reportData.pmsReport.openingStock
                  ).toLocaleString()}{" "}
                  L
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Litres Sold</p>
                <p className="text-xl font-semibold text-blue-600">
                  {parseFloat(reportData.pmsReport.litresSold).toLocaleString()}{" "}
                  L
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Closing Stock</p>
                <p className="text-xl font-semibold">
                  {parseFloat(
                    reportData.pmsReport.closingStock
                  ).toLocaleString()}{" "}
                  L
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenue</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(reportData.pmsReport.revenue)}
                </p>
              </div>
            </div>
          </AnimatedCard>

          {/* Lubricant Breakdown */}
          <AnimatedCard title="Lubricant Breakdown" hoverEffect={true}>
            {reportData.lubricantBreakdown.length > 0 ? (
              <div className="space-y-4">
                {reportData.lubricantBreakdown.map((item, index) => (
                  <AnimatedLubricantItem
                    key={index}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No lubricant sales recorded for this date
              </p>
            )}
          </AnimatedCard>
        </div>
      )}
    </div>
  )
}

function generateCSVContent(data: DailyReportData, date: string): string {
  const lines = [
    `Daily Report - ${date}`,
    "",
    "Sales Overview",
    `Total Sales,${data.salesOverview.totalSales}`,
    `Total Transactions,${data.salesOverview.totalTransactions}`,
    `Average Transaction,${data.salesOverview.averageTransaction}`,
    "",
    "Products Sold",
    "Product Name,Brand,Quantity Sold,Unit,Revenue"
  ]

  if (
    data.salesOverview.productsSold &&
    data.salesOverview.productsSold.length > 0
  ) {
    data.salesOverview.productsSold.forEach(product => {
      lines.push(
        `${product.productName},${product.brand},${product.quantitySold},${product.unit},${product.revenue}`
      )
    })
  } else {
    lines.push("No products sold")
  }

  lines.push(
    "",
    "PMS Report",
    `Opening Stock (L),${data.pmsReport.openingStock}`,
    `Litres Sold,${data.pmsReport.litresSold}`,
    `Closing Stock (L),${data.pmsReport.closingStock}`,
    `Revenue,${data.pmsReport.revenue}`,
    "",
    "Lubricant Breakdown",
    "Product Name,Brand,Opening Stock,Units Sold,Closing Stock,Revenue"
  )

  data.lubricantBreakdown.forEach(item => {
    lines.push(
      `${item.productName},${item.brand},${item.openingStock},${item.unitsSold},${item.closingStock},${item.revenue}`
    )
  })

  return lines.join("\n")
}
