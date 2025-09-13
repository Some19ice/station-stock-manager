"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

interface PumpConfiguration {
  id: string
  pumpNumber: string
  isActive: boolean
  status: string
}

interface MeterReadingFormProps {
  stationId: string
  selectedDate: string
  readingType: "opening" | "closing"
  onSuccess?: () => void
  className?: string
}

interface ReadingFormData {
  pumpId: string
  meterValue: string
  notes: string
}

export function MeterReadingForm({
  stationId,
  selectedDate,
  readingType,
  onSuccess,
  className
}: MeterReadingFormProps): React.ReactElement {
  const [pumps, setPumps] = useState<PumpConfiguration[]>([])
  const [loadingPumps, setLoadingPumps] = useState(true)
  const [readings, setReadings] = useState<ReadingFormData[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Load pump configurations
  useEffect(() => {
    async function loadPumps(): Promise<void> {
      try {
        const response = await fetch(
          `/api/pump-configurations?stationId=${stationId}`
        )
        if (!response.ok) {
          console.error("Failed to load pump configurations:", response.status, response.statusText)
          if (response.status === 500) {
            setError("Database setup required. Please ensure pump configurations table exists and is properly migrated.")
          } else if (response.status === 401) {
            setError("Authentication required. Please log in again.")
          } else {
            setError("Failed to load pump configurations. Please check if pump configurations are set up.")
          }
          setLoadingPumps(false)
          return
        }

        const result = await response.json()
        if (result.isSuccess) {
          const activePumps = result.data.filter(
            (pump: PumpConfiguration) =>
              pump.isActive && pump.status === "active"
          )
          
          if (activePumps.length === 0) {
            setError("No active pump configurations found. Please set up pump configurations first.")
            setLoadingPumps(false)
            return
          }
          
          setPumps(activePumps)
          setError(null) // Clear any previous errors

          // Initialize readings form for each pump
          setReadings(
            activePumps.map(pump => ({
              pumpId: pump.id,
              meterValue: "",
              notes: ""
            }))
          )
        } else {
          console.error("API error:", result.error)
          setError(result.error || "Failed to load pump configurations")
        }
      } catch (error) {
        console.error("Error loading pumps:", error)
        setError("Failed to load pump configurations. Please try again or contact support.")
        toast.error("Failed to load pump configurations")
      } finally {
        setLoadingPumps(false)
      }
    }

    if (stationId) {
      loadPumps()
    }
  }, [stationId])

  const updateReading = (
    pumpIndex: number,
    field: keyof ReadingFormData,
    value: string
  ): void => {
    setReadings(prev =>
      prev.map((reading, index) =>
        index === pumpIndex ? { ...reading, [field]: value } : reading
      )
    )

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`${pumpIndex}-${field}`]
      return newErrors
    })
  }

  const validateReadings = (): boolean => {
    const newErrors: Record<string, string> = {}

    readings.forEach((reading, index) => {
      if (!reading.meterValue.trim()) {
        newErrors[`${index}-meterValue`] = "Meter value is required"
      } else {
        const value = parseFloat(reading.meterValue)
        if (isNaN(value) || value < 0) {
          newErrors[`${index}-meterValue`] =
            "Must be a valid non-negative number"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!validateReadings()) {
      toast.error("Please fix validation errors")
      return
    }

    setSubmitting(true)

    try {
      // Submit readings using bulk API
      const bulkData = {
        stationId,
        readingDate: selectedDate,
        readingType,
        readings: readings
          .filter(r => r.meterValue.trim()) // Only submit readings with values
          .map(r => ({
            pumpId: r.pumpId,
            meterValue: parseFloat(r.meterValue),
            notes: r.notes.trim() || undefined
          }))
      }

      const response = await fetch("/api/meter-readings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bulkData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit readings")
      }

      const result = await response.json()

      if (result.isSuccess) {
        const { recordedCount, errors: submitErrors } = result.data

        if (submitErrors.length > 0) {
          toast.warning(
            `${recordedCount} readings recorded. ${submitErrors.length} failed.`
          )
          console.warn("Submission errors:", submitErrors)
        } else {
          toast.success(
            `Successfully recorded ${recordedCount} ${readingType} readings`
          )
        }

        // Reset form
        setReadings(readings.map(r => ({ ...r, meterValue: "", notes: "" })))
        onSuccess?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error submitting readings:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to submit readings"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSingleSubmit = async (pumpIndex: number): Promise<void> => {
    const reading = readings[pumpIndex]
    const pump = pumps[pumpIndex]

    if (!reading.meterValue.trim()) {
      toast.error("Please enter a meter value")
      return
    }

    const value = parseFloat(reading.meterValue)
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid meter value")
      return
    }

    try {
      const response = await fetch("/api/meter-readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pumpId: reading.pumpId,
          readingDate: selectedDate,
          readingType,
          meterValue: value,
          notes: reading.notes.trim() || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit reading")
      }

      const result = await response.json()

      if (result.isSuccess) {
        toast.success(`${readingType} reading recorded for ${pump.pumpNumber}`)

        // Clear this reading
        updateReading(pumpIndex, "meterValue", "")
        updateReading(pumpIndex, "notes", "")

        onSuccess?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error submitting reading:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to submit reading"
      )
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (loadingPumps) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading pump configurations...</span>
        </CardContent>
      </Card>
    )
  }

  if (pumps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active pumps found for this station. Please configure pumps
              first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const hasAnyValues = readings.some(r => r.meterValue.trim())

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Record {readingType.charAt(0).toUpperCase() +
            readingType.slice(1)}{" "}
          Readings
        </CardTitle>
        <CardDescription>
          Enter meter readings for {selectedDate}. All values must be
          non-negative numbers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {pumps.map((pump, index) => {
              const reading = readings[index]
              const hasError = Object.keys(errors).some(key =>
                key.startsWith(`${index}-`)
              )

              return (
                <Card
                  key={pump.id}
                  className={`p-4 ${hasError ? "border-red-200" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{pump.pumpNumber}</Label>
                      <Badge variant="secondary" className="text-xs">
                        {pump.status}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSingleSubmit(index)}
                      disabled={!reading.meterValue.trim() || submitting}
                    >
                      Submit
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`meter-${index}`} className="text-sm">
                        Meter Reading <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`meter-${index}`}
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={reading.meterValue}
                        onChange={e =>
                          updateReading(index, "meterValue", e.target.value)
                        }
                        className={
                          errors[`${index}-meterValue`] ? "border-red-500" : ""
                        }
                      />
                      {errors[`${index}-meterValue`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`${index}-meterValue`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`notes-${index}`} className="text-sm">
                        Notes
                      </Label>
                      <Textarea
                        id={`notes-${index}`}
                        placeholder="Optional notes..."
                        value={reading.notes}
                        onChange={e =>
                          updateReading(index, "notes", e.target.value)
                        }
                        rows={1}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-3 border-t pt-4">
            <Button
              type="submit"
              disabled={!hasAnyValues || submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit All Readings
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReadings(
                  readings.map(r => ({ ...r, meterValue: "", notes: "" }))
                )
                setErrors({})
              }}
              disabled={submitting}
            >
              Clear All
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
