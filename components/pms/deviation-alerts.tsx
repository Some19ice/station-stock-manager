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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Calendar,
  Fuel,
  BarChart3,
  CheckCircle,
  X
} from "lucide-react"
import { toast } from "sonner"

interface DeviationCalculation {
  id: string
  pumpId: string
  pumpNumber: string
  calculationDate: string
  volumeDispensed: string
  totalRevenue: string
  deviationFromAverage: string
  averageVolume: number
  deviationPercent: number
  isEstimated: boolean
  calculationMethod: string
  hasRollover: boolean
  calculatedAt: string
}

interface DeviationAlertsProps {
  stationId: string
  defaultThreshold?: number
  defaultDays?: number
  onResolve?: (calculationId: string) => void
  className?: string
}

export function DeviationAlerts({
  stationId,
  defaultThreshold = 20,
  defaultDays = 7,
  onResolve,
  className
}: DeviationAlertsProps): React.ReactElement {
  const [deviations, setDeviations] = useState<DeviationCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [threshold, setThreshold] = useState(defaultThreshold)
  const [days, setDays] = useState(defaultDays)
  const [resolving, setResolving] = useState<string | null>(null)

  const loadDeviations = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/pms-calculations/deviations?stationId=${stationId}&thresholdPercent=${threshold}&days=${days}`
      )

      if (!response.ok) {
        throw new Error("Failed to load deviation calculations")
      }

      const result = await response.json()
      if (result.isSuccess) {
        setDeviations(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error loading deviations:", error)
      toast.error("Failed to load deviation alerts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stationId) {
      loadDeviations()
    }
  }, [stationId, threshold, days])

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    await loadDeviations()
    setRefreshing(false)
  }

  const handleResolve = async (calculationId: string): Promise<void> => {
    setResolving(calculationId)

    try {
      // In a real implementation, you might mark the deviation as acknowledged
      // or add a resolution note. For now, we'll just trigger a callback
      onResolve?.(calculationId)

      // Remove from local state for immediate feedback
      setDeviations(prev => prev.filter(d => d.id !== calculationId))

      toast.success("Deviation acknowledged")
    } catch (error) {
      console.error("Error resolving deviation:", error)
      toast.error("Failed to resolve deviation")
    } finally {
      setResolving(null)
    }
  }

  const getSeverityLevel = (deviation: number): "low" | "medium" | "high" => {
    const absDeviation = Math.abs(deviation)
    if (absDeviation >= 50) return "high"
    if (absDeviation >= 30) return "medium"
    return "low"
  }

  const getSeverityBadge = (deviation: number): React.ReactElement => {
    const severity = getSeverityLevel(deviation)
    const absDeviation = Math.abs(deviation)

    switch (severity) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Critical ({absDeviation.toFixed(1)}%)
          </Badge>
        )
      case "medium":
        return (
          <Badge className="gap-1 bg-orange-100 text-orange-700">
            <AlertTriangle className="h-3 w-3" />
            High ({absDeviation.toFixed(1)}%)
          </Badge>
        )
      case "low":
        return (
          <Badge
            variant="secondary"
            className="gap-1 bg-yellow-100 text-yellow-700"
          >
            <TrendingUp className="h-3 w-3" />
            Moderate ({absDeviation.toFixed(1)}%)
          </Badge>
        )
    }
  }

  const getDeviationIcon = (deviation: number) => {
    return deviation > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const criticalDeviations = deviations.filter(
    d => getSeverityLevel(d.deviationPercent) === "high"
  )
  const highDeviations = deviations.filter(
    d => getSeverityLevel(d.deviationPercent) === "medium"
  )
  const moderateDeviations = deviations.filter(
    d => getSeverityLevel(d.deviationPercent) === "low"
  )

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading deviation alerts...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Volume Deviation Alerts
              </CardTitle>
              <CardDescription>
                Monitor pumps with significant volume deviations from historical
                averages
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Threshold:</label>
                <Select
                  value={threshold.toString()}
                  onValueChange={value => setThreshold(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Period:</label>
                <Select
                  value={days.toString()}
                  onValueChange={value => setDays(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3d</SelectItem>
                    <SelectItem value="7">7d</SelectItem>
                    <SelectItem value="14">14d</SelectItem>
                    <SelectItem value="30">30d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="mr-1 h-3 w-3" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalDeviations.length}
            </div>
            <p className="text-muted-foreground text-xs">
              ≥50% deviation from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {highDeviations.length}
            </div>
            <p className="text-muted-foreground text-xs">
              30-49% deviation from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderate</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {moderateDeviations.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {threshold}%-29% deviation from average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* No Deviations */}
      {deviations.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="text-lg font-medium">All Clear!</h3>
              <p className="text-muted-foreground">
                No volume deviations above {threshold}% detected in the last{" "}
                {days} days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deviation Alerts Table */}
      {deviations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deviation Details</CardTitle>
            <CardDescription>
              Pumps with volume deviations requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pump</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Deviation</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ...criticalDeviations,
                    ...highDeviations,
                    ...moderateDeviations
                  ].map(deviation => {
                    const volume = parseFloat(deviation.volumeDispensed)
                    const deviationPercent = deviation.deviationPercent

                    return (
                      <TableRow key={deviation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {deviation.pumpNumber}
                            {deviation.hasRollover && (
                              <Badge variant="outline" className="text-xs">
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Rollover
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="text-muted-foreground h-3 w-3" />
                            {new Date(
                              deviation.calculationDate
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Fuel className="text-muted-foreground h-3 w-3" />
                            {volume.toFixed(1)}L
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {deviation.averageVolume.toFixed(1)}L
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviationIcon(deviationPercent)}
                            <span
                              className={
                                deviationPercent > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {deviationPercent > 0 ? "+" : ""}
                              {deviationPercent.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(deviationPercent)}
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground space-y-1 text-xs">
                            <div>Method: {deviation.calculationMethod}</div>
                            {deviation.isEstimated && (
                              <Badge variant="secondary" className="text-xs">
                                Estimated
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(deviation.id)}
                            disabled={resolving === deviation.id}
                          >
                            {resolving === deviation.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {resolving === deviation.id
                              ? "Resolving..."
                              : "Acknowledge"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Understanding Deviations:</strong> Volume deviations
              compare daily fuel dispensed against the {days}-day historical
              average. Large deviations may indicate meter calibration issues,
              unusual customer patterns, or data entry errors. Investigate
              deviations above {threshold}% and consider recalibrating pumps
              with consistent high deviations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

