"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  DollarSign,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"

interface PmsCalculation {
  id: string
  pumpId: string
  pumpNumber: string
  calculationDate: string
  openingReading: string
  closingReading: string
  volumeDispensed: string
  unitPrice: string
  totalRevenue: string
  hasRollover: boolean
  rolloverValue?: string
  deviationFromAverage: string
  isEstimated: boolean
  calculationMethod: string
  calculatedBy: string
  calculatedAt: string
  approvedBy?: string
  approvedAt?: string
}

interface DailyCalculationSummary {
  calculatedCount: number
  totalVolume: number
  totalRevenue: number
  calculations: PmsCalculation[]
}

interface DailyCalculationDashboardProps {
  stationId: string
  selectedDate: string
  onRefresh?: () => void
  className?: string
}

export function DailyCalculationDashboard({
  stationId,
  selectedDate,
  onRefresh,
  className
}: DailyCalculationDashboardProps): React.ReactElement {
  const [calculations, setCalculations] = useState<PmsCalculation[]>([])
  const [summary, setSummary] = useState<DailyCalculationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)

  const loadCalculations = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/pms-calculations?stationId=${stationId}&startDate=${selectedDate}&endDate=${selectedDate}`
      )

      if (!response.ok) {
        throw new Error("Failed to load calculations")
      }

      const result = await response.json()
      if (result.isSuccess) {
        setCalculations(result.data)

        // Calculate summary
        const totalVolume = result.data.reduce(
          (sum: number, calc: PmsCalculation) =>
            sum + parseFloat(calc.volumeDispensed),
          0
        )
        const totalRevenue = result.data.reduce(
          (sum: number, calc: PmsCalculation) =>
            sum + parseFloat(calc.totalRevenue),
          0
        )

        setSummary({
          calculatedCount: result.data.length,
          totalVolume,
          totalRevenue,
          calculations: result.data
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error loading calculations:", error)
      toast.error("Failed to load PMS calculations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stationId && selectedDate) {
      loadCalculations()
    }
  }, [stationId, selectedDate])

  const handleCalculate = async (
    forceRecalculate: boolean = false
  ): Promise<void> => {
    setCalculating(true)

    try {
      const response = await fetch("/api/pms-calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stationId,
          calculationDate: selectedDate,
          forceRecalculate
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to calculate PMS sales")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success(`Calculated ${result.data.calculatedCount} pump(s)`)
        await loadCalculations()
        onRefresh?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error calculating PMS:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to calculate PMS sales"
      )
    } finally {
      setCalculating(false)
    }
  }

  const handleApproval = async (
    calculationId: string,
    approved: boolean
  ): Promise<void> => {
    setApproving(calculationId)

    try {
      const response = await fetch(
        `/api/pms-calculations/${calculationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            approved,
            notes: approved
              ? "Approved via dashboard"
              : "Rejected via dashboard"
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update approval")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success(`Calculation ${approved ? "approved" : "rejected"}`)
        await loadCalculations()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating approval:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update approval"
      )
    } finally {
      setApproving(null)
    }
  }

  const getDeviationBadge = (deviation: number): React.ReactElement => {
    const absDeviation = Math.abs(deviation)

    if (absDeviation < 10) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Normal
        </Badge>
      )
    } else if (absDeviation < 20) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Watch
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Alert</Badge>
    }
  }

  const estimatedCalculations = calculations.filter(
    calc => calc.isEstimated && !calc.approvedBy
  )
  const rolloverCalculations = calculations.filter(calc => calc.hasRollover)
  const deviationCalculations = calculations.filter(
    calc => Math.abs(parseFloat(calc.deviationFromAverage)) >= 20
  )

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading calculations...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Fuel className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalVolume.toFixed(1) || "0.0"}L
            </div>
            <p className="text-muted-foreground text-xs">
              {summary?.calculatedCount || 0} pump(s) calculated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{summary?.totalRevenue.toLocaleString() || "0"}
            </div>
            <p className="text-muted-foreground text-xs">
              Average: ₦
              {summary?.totalVolume
                ? (summary.totalRevenue / summary.totalVolume).toFixed(2)
                : "0"}
              /L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {calculations.length > 0 ? "Complete" : "Pending"}
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                onClick={() => handleCalculate(false)}
                disabled={calculating}
              >
                {calculating ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Calculator className="mr-1 h-3 w-3" />
                )}
                Calculate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCalculate(true)}
                disabled={calculating}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Recalculate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(estimatedCalculations.length > 0 ||
        rolloverCalculations.length > 0 ||
        deviationCalculations.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {estimatedCalculations.length > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {estimatedCalculations.length} estimated calculation(s)
                  require manager approval.
                </AlertDescription>
              </Alert>
            )}

            {rolloverCalculations.length > 0 && (
              <Alert>
                <RotateCcw className="h-4 w-4" />
                <AlertDescription>
                  {rolloverCalculations.length} calculation(s) detected meter
                  rollover.
                </AlertDescription>
              </Alert>
            )}

            {deviationCalculations.length > 0 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  {deviationCalculations.length} calculation(s) show significant
                  volume deviation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Pump Calculations</CardTitle>
          <CardDescription>
            Detailed breakdown of PMS calculations for {selectedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No calculations found for this date. Click "Calculate" to
              generate.
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({calculations.length})
                </TabsTrigger>
                <TabsTrigger value="estimated">
                  Estimated ({estimatedCalculations.length})
                </TabsTrigger>
                <TabsTrigger value="rollover">
                  Rollover ({rolloverCalculations.length})
                </TabsTrigger>
                <TabsTrigger value="deviations">
                  Deviations ({deviationCalculations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                {calculations.map(calc => (
                  <CalculationCard
                    key={calc.id}
                    calculation={calc}
                    onApprove={approved => handleApproval(calc.id, approved)}
                    approving={approving === calc.id}
                  />
                ))}
              </TabsContent>

              <TabsContent value="estimated" className="mt-4 space-y-4">
                {estimatedCalculations.map(calc => (
                  <CalculationCard
                    key={calc.id}
                    calculation={calc}
                    onApprove={approved => handleApproval(calc.id, approved)}
                    approving={approving === calc.id}
                  />
                ))}
              </TabsContent>

              <TabsContent value="rollover" className="mt-4 space-y-4">
                {rolloverCalculations.map(calc => (
                  <CalculationCard
                    key={calc.id}
                    calculation={calc}
                    onApprove={approved => handleApproval(calc.id, approved)}
                    approving={approving === calc.id}
                  />
                ))}
              </TabsContent>

              <TabsContent value="deviations" className="mt-4 space-y-4">
                {deviationCalculations.map(calc => (
                  <CalculationCard
                    key={calc.id}
                    calculation={calc}
                    onApprove={approved => handleApproval(calc.id, approved)}
                    approving={approving === calc.id}
                  />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface CalculationCardProps {
  calculation: PmsCalculation
  onApprove: (approved: boolean) => void
  approving: boolean
}

function CalculationCard({
  calculation,
  onApprove,
  approving
}: CalculationCardProps): React.ReactElement {
  const deviation = parseFloat(calculation.deviationFromAverage)
  const volume = parseFloat(calculation.volumeDispensed)
  const revenue = parseFloat(calculation.totalRevenue)

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h4 className="font-medium">{calculation.pumpNumber}</h4>
            <Badge variant={calculation.isEstimated ? "secondary" : "default"}>
              {calculation.calculationMethod}
            </Badge>
            {calculation.hasRollover && (
              <Badge
                variant="outline"
                className="border-orange-300 text-orange-700"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Rollover
              </Badge>
            )}
            {getDeviationBadge(deviation)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Opening:</span>
              <div className="font-medium">
                {parseFloat(calculation.openingReading).toFixed(1)}L
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Closing:</span>
              <div className="font-medium">
                {parseFloat(calculation.closingReading).toFixed(1)}L
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Volume:</span>
              <div className="font-medium">{volume.toFixed(1)}L</div>
            </div>
            <div>
              <span className="text-muted-foreground">Revenue:</span>
              <div className="font-medium">₦{revenue.toLocaleString()}</div>
            </div>
          </div>

          {Math.abs(deviation) >= 10 && (
            <div className="flex items-center gap-2 text-sm">
              {deviation > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={deviation > 0 ? "text-green-600" : "text-red-600"}
              >
                {deviation > 0 ? "+" : ""}
                {deviation.toFixed(1)}% from average
              </span>
            </div>
          )}
        </div>

        {calculation.isEstimated && !calculation.approvedBy && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApprove(true)}
              disabled={approving}
            >
              {approving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onApprove(false)}
              disabled={approving}
            >
              Reject
            </Button>
          </div>
        )}

        {calculation.approvedBy && (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )}
      </div>
    </Card>
  )
}
