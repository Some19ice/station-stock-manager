"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Gauge,
  Fuel,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save
} from "lucide-react"
import { toast } from "sonner"

interface PumpReading {
  pumpId: string
  pumpNumber: string
  openingReading: number | null
  closingReading: number | null
  hasOpeningReading: boolean
  capacity: number
}

interface PumpConfiguration {
  id: string
  pumpNumber: string
  meterCapacity: string
}

interface MeterReading {
  pumpId: string
  openingReading?: number
  closingReading?: number
}

interface StaffMeterReadingFormProps {
  stationId: string
  staffId: string
  onSuccess?: () => void
}

export function StaffMeterReadingForm({
  stationId,
  staffId,
  onSuccess
}: StaffMeterReadingFormProps): React.ReactElement {
  const [pumps, setPumps] = useState<PumpReading[]>([])
  const [closingReadings, setClosingReadings] = useState<
    Record<string, string>
  >({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  const loadPumpReadings = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      // Get pump configurations and today's readings
      const [pumpsResponse, readingsResponse] = await Promise.all([
        fetch(`/api/pump-configurations?stationId=${stationId}`),
        fetch(`/api/meter-readings?stationId=${stationId}&startDate=${today}&endDate=${today}`)
      ])

      if (!pumpsResponse.ok || !readingsResponse.ok) {
        throw new Error("Failed to load pump data")
      }

      const [pumpsResult, readingsResult] = await Promise.all([
        pumpsResponse.json(),
        readingsResponse.json()
      ])

      if (pumpsResult.isSuccess && readingsResult.isSuccess) {
        const pumpReadings: PumpReading[] = pumpsResult.data.map((pump: PumpConfiguration) => {
          const todayReading = readingsResult.data.find(
            (reading: MeterReading) => reading.pumpId === pump.id
          )

          return {
            pumpId: pump.id,
            pumpNumber: pump.pumpNumber,
            openingReading: todayReading?.openingReading || null,
            closingReading: todayReading?.closingReading || null,
            hasOpeningReading: !!todayReading?.openingReading,
            capacity: parseFloat(pump.meterCapacity)
          }
        })

        setPumps(pumpReadings)

        // Initialize closing readings state
        const initialClosingReadings: Record<string, string> = {}
        pumpReadings.forEach(pump => {
          if (pump.closingReading !== null) {
            initialClosingReadings[pump.pumpId] = pump.closingReading.toString()
          }
        })
        setClosingReadings(initialClosingReadings)
      } else {
        throw new Error("Failed to process pump data")
      }
    } catch (error) {
      console.error("Error loading pump readings:", error)
      toast.error("Failed to load pump readings")
    } finally {
      setLoading(false)
    }
  }, [stationId, today])

  useEffect(() => {
    if (stationId) {
      loadPumpReadings()
    } else {
      setLoading(false)
    }
  }, [loadPumpReadings, stationId])

  if (!stationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="space-y-3 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="text-lg font-semibold">Station Not Found</h3>
            <p className="text-muted-foreground">
              Unable to load station information. Please try refreshing the
              page.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const validateReading = (pumpId: string, value: string): string | null => {
    const pump = pumps.find(p => p.pumpId === pumpId)
    if (!pump) return "Pump not found"

    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      return "Reading must be a valid positive number"
    }

    if (numValue > pump.capacity) {
      return `Reading cannot exceed pump capacity of ${pump.capacity.toFixed(1)}L`
    }

    // Check for obvious rollover (closing much less than opening)
    if (pump.openingReading !== null && numValue < pump.openingReading * 0.5) {
      return "Possible meter rollover detected - please verify reading or contact manager"
    }

    return null
  }

  const handleClosingReadingChange = (pumpId: string, value: string): void => {
    setClosingReadings(prev => ({ ...prev, [pumpId]: value }))

    // Clear error when user starts typing
    if (errors[pumpId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[pumpId]
        return newErrors
      })
    }

    // Validate on change
    if (value.trim()) {
      const error = validateReading(pumpId, value)
      if (error) {
        setErrors(prev => ({ ...prev, [pumpId]: error }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate all readings
      const newErrors: Record<string, string> = {}
      const readingsToSubmit = []

      for (const pump of pumps) {
        if (!pump.hasOpeningReading) {
          newErrors[pump.pumpId] = "Opening reading not set by manager"
          continue
        }

        const closingValue = closingReadings[pump.pumpId]?.trim()
        if (!closingValue) {
          newErrors[pump.pumpId] = "Closing reading is required"
          continue
        }

        const error = validateReading(pump.pumpId, closingValue)
        if (error) {
          newErrors[pump.pumpId] = error
          continue
        }

        readingsToSubmit.push({
          pumpId: pump.pumpId,
          readingDate: today,
          readingType: "closing",
          meterValue: parseFloat(closingValue),
          notes: notes[pump.pumpId] || ""
        })
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        toast.error("Please fix the errors before submitting")
        return
      }

      // Submit readings via bulk endpoint
      const response = await fetch("/api/meter-readings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stationId,
          readingDate: today,
          readingType: "closing",
          readings: readingsToSubmit.map(r => ({
            pumpId: r.pumpId,
            meterValue: r.meterValue,
            notes: r.notes
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit readings")
      }

      const result = await response.json()

      if (!result.isSuccess) {
        throw new Error(result.error || "Failed to submit readings")
      }

      toast.success(
        `Successfully recorded ${readingsToSubmit.length} closing readings`
      )
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting readings:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to submit readings"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="space-y-3 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading pump readings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pumps.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="space-y-3 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="text-lg font-semibold">No Active Pumps Found</h3>
            <p className="text-muted-foreground">
              No active pumps are configured for this station. Contact your
              manager.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pumpsWithoutOpening = pumps.filter(p => !p.hasOpeningReading)
  const pumpsWithOpening = pumps.filter(p => p.hasOpeningReading)
  const allReadingsComplete = pumpsWithOpening.every(p =>
    closingReadings[p.pumpId]?.trim()
  )

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {pumpsWithoutOpening.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Opening readings missing:</strong>{" "}
            {pumpsWithoutOpening.length} pump(s) don't have opening readings set
            by the manager. You can only record closing readings for pumps with
            opening readings.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Record Closing Readings
            </CardTitle>
            <CardDescription>
              Enter the final meter readings for each pump at the end of your
              shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pumpsWithOpening.map((pump, index) => (
              <div key={pump.pumpId}>
                {index > 0 && <Separator />}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 font-semibold">
                      <Fuel className="h-4 w-4 text-blue-600" />
                      {pump.pumpNumber}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Opening Set
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Opening Reading (Read-only) */}
                    <div>
                      <Label htmlFor={`opening-${pump.pumpId}`}>
                        Opening Reading (L)
                      </Label>
                      <Input
                        id={`opening-${pump.pumpId}`}
                        value={pump.openingReading?.toFixed(1) || "0.0"}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-muted-foreground mt-1 text-xs">
                        Set by manager at start of day
                      </p>
                    </div>

                    {/* Closing Reading (Editable) */}
                    <div>
                      <Label htmlFor={`closing-${pump.pumpId}`}>
                        Closing Reading (L) *
                      </Label>
                      <Input
                        id={`closing-${pump.pumpId}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max={pump.capacity}
                        value={closingReadings[pump.pumpId] || ""}
                        onChange={e =>
                          handleClosingReadingChange(
                            pump.pumpId,
                            e.target.value
                          )
                        }
                        className={errors[pump.pumpId] ? "border-red-500" : ""}
                        placeholder="Enter closing reading"
                      />
                      {errors[pump.pumpId] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[pump.pumpId]}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 text-xs">
                        Maximum: {pump.capacity.toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  {/* Calculated Volume */}
                  {pump.openingReading !== null &&
                    closingReadings[pump.pumpId] &&
                    !errors[pump.pumpId] && (
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-blue-700">
                            Calculated Volume:
                          </span>
                          <span className="font-semibold text-blue-900">
                            {(
                              parseFloat(closingReadings[pump.pumpId]) -
                              pump.openingReading
                            ).toFixed(1)}
                            L
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor={`notes-${pump.pumpId}`}>
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id={`notes-${pump.pumpId}`}
                      value={notes[pump.pumpId] || ""}
                      onChange={e =>
                        setNotes(prev => ({
                          ...prev,
                          [pump.pumpId]: e.target.value
                        }))
                      }
                      placeholder="Any observations about this pump's readings..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}

            {pumpsWithOpening.length === 0 && (
              <div className="py-8 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Waiting for Opening Readings
                </h3>
                <p className="text-gray-600">
                  The manager needs to set opening readings before you can
                  record closing readings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {pumpsWithOpening.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {pumpsWithOpening.length} pump(s) ready for closing readings
            </p>
            <Button
              type="submit"
              disabled={submitting || !allReadingsComplete}
              className="min-w-32"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Readings
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
