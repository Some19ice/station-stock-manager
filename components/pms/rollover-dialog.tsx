"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  RotateCcw,
  AlertTriangle,
  Calculator,
  Gauge,
  CheckCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"

interface RolloverCalculation {
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
  meterCapacity: string
  isEstimated: boolean
}

interface RolloverDialogProps {
  calculation: RolloverCalculation | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    calculationId: string
    rolloverValue: number
    newReading: number
    notes?: string
  }) => Promise<void>
  className?: string
}

export function RolloverDialog({
  calculation,
  isOpen,
  onClose,
  onConfirm,
  className
}: RolloverDialogProps): React.ReactElement {
  const [submitting, setSubmitting] = useState(false)
  const [rolloverValue, setRolloverValue] = useState("")
  const [newReading, setNewReading] = useState("")
  const [notes, setNotes] = useState("")
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null)
  const [calculatedRevenue, setCalculatedRevenue] = useState<number | null>(
    null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when dialog opens with new calculation
  useEffect(() => {
    if (calculation && isOpen) {
      setRolloverValue(calculation.rolloverValue || calculation.meterCapacity)
      setNewReading(calculation.closingReading)
      setNotes("")
      setErrors({})
      setCalculatedVolume(null)
      setCalculatedRevenue(null)
    }
  }, [calculation, isOpen])

  // Recalculate volume and revenue when values change
  useEffect(() => {
    if (calculation && rolloverValue && newReading) {
      try {
        const opening = parseFloat(calculation.openingReading)
        const rollover = parseFloat(rolloverValue)
        const closing = parseFloat(newReading)
        const unitPrice = parseFloat(calculation.unitPrice)

        if (
          !isNaN(opening) &&
          !isNaN(rollover) &&
          !isNaN(closing) &&
          !isNaN(unitPrice)
        ) {
          // Calculate volume: (rollover - opening) + closing
          const volumeBeforeRollover = rollover - opening
          const volumeAfterRollover = closing
          const totalVolume = volumeBeforeRollover + volumeAfterRollover

          if (totalVolume >= 0) {
            setCalculatedVolume(totalVolume)
            setCalculatedRevenue(totalVolume * unitPrice)
          } else {
            setCalculatedVolume(null)
            setCalculatedRevenue(null)
          }
        }
      } catch (error) {
        setCalculatedVolume(null)
        setCalculatedRevenue(null)
      }
    } else {
      setCalculatedVolume(null)
      setCalculatedRevenue(null)
    }
  }, [calculation, rolloverValue, newReading])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!rolloverValue.trim()) {
      newErrors.rolloverValue = "Rollover value is required"
    } else {
      const value = parseFloat(rolloverValue)
      if (isNaN(value) || value <= 0) {
        newErrors.rolloverValue = "Must be a positive number"
      } else if (calculation && value > parseFloat(calculation.meterCapacity)) {
        newErrors.rolloverValue = `Cannot exceed meter capacity of ${calculation.meterCapacity}L`
      } else if (
        calculation &&
        value <= parseFloat(calculation.openingReading)
      ) {
        newErrors.rolloverValue = "Must be greater than opening reading"
      }
    }

    if (!newReading.trim()) {
      newErrors.newReading = "New reading is required"
    } else {
      const value = parseFloat(newReading)
      if (isNaN(value) || value < 0) {
        newErrors.newReading = "Must be a non-negative number"
      } else if (calculation && value > parseFloat(calculation.meterCapacity)) {
        newErrors.newReading = `Cannot exceed meter capacity of ${calculation.meterCapacity}L`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!calculation || !validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      await onConfirm({
        calculationId: calculation.id,
        rolloverValue: parseFloat(rolloverValue),
        newReading: parseFloat(newReading),
        notes: notes.trim() || undefined
      })

      toast.success("Rollover confirmed successfully")
      onClose()
    } catch (error) {
      console.error("Error confirming rollover:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm rollover"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = (): void => {
    if (!submitting) {
      onClose()
    }
  }

  if (!calculation) {
    return <div />
  }

  const originalVolume = parseFloat(calculation.volumeDispensed)
  const originalRevenue = parseFloat(calculation.totalRevenue)
  const meterCapacity = parseFloat(calculation.meterCapacity)
  const openingReading = parseFloat(calculation.openingReading)
  const currentClosingReading = parseFloat(calculation.closingReading)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            Confirm Meter Rollover
          </DialogTitle>
          <DialogDescription>
            Pump {calculation.pumpNumber} appears to have experienced a meter
            rollover on{" "}
            {new Date(calculation.calculationDate).toLocaleDateString()}. Please
            confirm the actual rollover point and final reading.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Calculation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Opening Reading:
                  </span>
                  <div className="font-medium">
                    {openingReading.toFixed(1)}L
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Closing Reading:
                  </span>
                  <div className="font-medium">
                    {currentClosingReading.toFixed(1)}L
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Calculated Volume:
                  </span>
                  <div className="font-medium">
                    {originalVolume.toFixed(1)}L
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue:</span>
                  <div className="font-medium">
                    ₦{originalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rollover detected:</strong> The closing reading (
                  {currentClosingReading.toFixed(1)}L) is less than the opening
                  reading ({openingReading.toFixed(1)}L), indicating the meter
                  rolled over during this period.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Rollover Confirmation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4" />
                  Rollover Details
                </CardTitle>
                <CardDescription>
                  Specify the exact meter reading where the rollover occurred
                  and the final reading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="rolloverValue">
                      Rollover Point (L) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rolloverValue"
                      type="number"
                      step="0.1"
                      min={openingReading}
                      max={meterCapacity}
                      value={rolloverValue}
                      onChange={e => setRolloverValue(e.target.value)}
                      className={errors.rolloverValue ? "border-red-500" : ""}
                      placeholder={`Max: ${meterCapacity}`}
                    />
                    {errors.rolloverValue && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.rolloverValue}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      The meter reading where rollover occurred (usually{" "}
                      {meterCapacity}L)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="newReading">
                      Final Reading (L) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newReading"
                      type="number"
                      step="0.1"
                      min="0"
                      max={meterCapacity}
                      value={newReading}
                      onChange={e => setNewReading(e.target.value)}
                      className={errors.newReading ? "border-red-500" : ""}
                      placeholder="0.0"
                    />
                    {errors.newReading && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.newReading}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      The actual closing meter reading after rollover
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional notes about the rollover confirmation..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recalculated Results */}
            {calculatedVolume !== null && calculatedRevenue !== null && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calculator className="h-4 w-4 text-green-600" />
                    Corrected Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Volume Before Rollover:
                        </span>
                        <div className="font-medium">
                          {(parseFloat(rolloverValue) - openingReading).toFixed(
                            1
                          )}
                          L
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Volume After Rollover:
                        </span>
                        <div className="font-medium">
                          {parseFloat(newReading).toFixed(1)}L
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Volume:
                        </span>
                        <div className="font-bold text-green-600">
                          {calculatedVolume.toFixed(1)}L
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Revenue:
                        </span>
                        <div className="font-bold text-green-600">
                          ₦{calculatedRevenue.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3 text-sm">
                      <Info className="mt-0.5 h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Volume Difference:</p>
                        <p className="text-muted-foreground">
                          {(calculatedVolume - originalVolume).toFixed(1)}L
                          {calculatedVolume > originalVolume
                            ? " (increase)"
                            : " (decrease)"}
                        </p>
                      </div>
                    </div>

                    {Math.abs(calculatedVolume - originalVolume) >
                      originalVolume * 0.1 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          The corrected volume differs significantly from the
                          original calculation. Please verify the rollover point
                          and final reading are correct.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !rolloverValue ||
              !newReading ||
              submitting ||
              calculatedVolume === null
            }
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Rollover
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Additional component for rollover detection status
interface RolloverStatusProps {
  calculation: RolloverCalculation
  onShowDialog: () => void
  className?: string
}

export function RolloverStatus({
  calculation,
  onShowDialog,
  className
}: RolloverStatusProps): React.ReactElement {
  if (!calculation.hasRollover) {
    return <div />
  }

  const isConfirmed = calculation.rolloverValue !== null
  const openingReading = parseFloat(calculation.openingReading)
  const closingReading = parseFloat(calculation.closingReading)

  return (
    <Alert className={className}>
      <RotateCcw className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Meter Rollover Detected:</strong> Opening (
          {openingReading.toFixed(1)}L) &gt; Closing (
          {closingReading.toFixed(1)}L)
          {isConfirmed ? (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="mr-1 h-3 w-3" />
              Confirmed
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Needs Confirmation
            </Badge>
          )}
        </div>
        {!isConfirmed && (
          <Button variant="outline" size="sm" onClick={onShowDialog}>
            Confirm Rollover
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

