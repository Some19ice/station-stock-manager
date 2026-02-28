"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Square,
  Clock,
  DollarSign,
  ShoppingCart,
  Timer
} from "lucide-react"
import { toast } from "sonner"
import { startShift, endShift, getActiveShift } from "@/actions/shifts"

interface ShiftData {
  id: string
  stationId: string
  userId: string
  status: "active" | "completed" | "abandoned"
  startedAt: Date
  endedAt: Date | null
  openingCash: string | null
  closingCash: string | null
  expectedCash: string | null
  totalSales: string
  transactionCount: string
  notes: string | null
  handoverNotes: string | null
  currentTotalSales?: string
  currentTransactionCount?: number
}

interface ShiftClockProps {
  stationId: string
  onShiftChange?: (shift: ShiftData | null) => void
}

export function ShiftClock({ stationId, onShiftChange }: ShiftClockProps) {
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [openingCash, setOpeningCash] = useState("")
  const [closingCash, setClosingCash] = useState("")
  const [notes, setNotes] = useState("")
  const [handoverNotes, setHandoverNotes] = useState("")
  const [showEndForm, setShowEndForm] = useState(false)
  const [elapsed, setElapsed] = useState("")

  const fetchActiveShift = useCallback(async () => {
    try {
      const result = await getActiveShift(stationId)
      if (result.isSuccess) {
        setActiveShift(result.data as ShiftData | null)
        onShiftChange?.(result.data as ShiftData | null)
      }
    } catch {
      // Silently handle — shift data is non-critical for page load
    } finally {
      setLoading(false)
    }
  }, [stationId, onShiftChange])

  useEffect(() => {
    fetchActiveShift()
  }, [fetchActiveShift])

  useEffect(() => {
    if (!activeShift) {
      setElapsed("")
      return
    }

    const updateElapsed = () => {
      const start = new Date(activeShift.startedAt).getTime()
      const now = Date.now()
      const diff = now - start
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeShift])

  const handleStartShift = async () => {
    setActionLoading(true)
    try {
      const result = await startShift({
        stationId,
        openingCash: openingCash ? parseFloat(openingCash) : undefined
      })

      if (result.isSuccess) {
        toast.success("Shift started successfully")
        setOpeningCash("")
        await fetchActiveShift()
      } else {
        toast.error(result.error || "Failed to start shift")
      }
    } catch {
      toast.error("Failed to start shift")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEndShift = async () => {
    if (!activeShift) return

    setActionLoading(true)
    try {
      const result = await endShift({
        shiftId: activeShift.id,
        closingCash: closingCash ? parseFloat(closingCash) : undefined,
        notes: notes || undefined,
        handoverNotes: handoverNotes || undefined
      })

      if (result.isSuccess) {
        toast.success("Shift ended successfully")
        setClosingCash("")
        setNotes("")
        setHandoverNotes("")
        setShowEndForm(false)
        setActiveShift(null)
        onShiftChange?.(null)
      } else {
        toast.error(result.error || "Failed to end shift")
      }
    } catch {
      toast.error("Failed to end shift")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (activeShift && !showEndForm) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
              Shift Active
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-sm">
              <Timer className="mr-1 h-3 w-3" />
              {elapsed}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/70 p-3 text-center">
              <Clock className="mx-auto mb-1 h-4 w-4 text-slate-500" />
              <p className="text-xs text-slate-500">Started</p>
              <p className="text-sm font-semibold">
                {new Date(activeShift.startedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 text-center">
              <DollarSign className="mx-auto mb-1 h-4 w-4 text-green-600" />
              <p className="text-xs text-slate-500">Sales</p>
              <p className="text-sm font-semibold">
                ₦
                {parseFloat(
                  activeShift.currentTotalSales || "0"
                ).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 text-center">
              <ShoppingCart className="mx-auto mb-1 h-4 w-4 text-blue-600" />
              <p className="text-xs text-slate-500">Txns</p>
              <p className="text-sm font-semibold">
                {activeShift.currentTransactionCount || 0}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowEndForm(true)}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            <Square className="mr-2 h-4 w-4" />
            End Shift
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (activeShift && showEndForm) {
    const expectedCash =
      parseFloat(activeShift.openingCash || "0") +
      parseFloat(activeShift.currentTotalSales || "0")

    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Square className="h-5 w-5 text-orange-600" />
            End Shift
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white/70 p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">Duration:</span>
                <span className="ml-1 font-semibold">{elapsed}</span>
              </div>
              <div>
                <span className="text-slate-500">Sales:</span>
                <span className="ml-1 font-semibold">
                  ₦
                  {parseFloat(
                    activeShift.currentTotalSales || "0"
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Transactions:</span>
                <span className="ml-1 font-semibold">
                  {activeShift.currentTransactionCount || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Expected Cash:</span>
                <span className="ml-1 font-semibold">
                  ₦{expectedCash.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="closingCash">Closing Cash (₦)</Label>
              <Input
                id="closingCash"
                type="number"
                min="0"
                step="0.01"
                placeholder="Count and enter cash on hand"
                value={closingCash}
                onChange={e => setClosingCash(e.target.value)}
              />
              {closingCash && (
                <p
                  className={`mt-1 text-xs ${
                    Math.abs(parseFloat(closingCash) - expectedCash) > 100
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  Difference: ₦
                  {(parseFloat(closingCash) - expectedCash).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Shift Notes</Label>
              <Input
                id="notes"
                placeholder="Issues, observations, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="handoverNotes">Handover Notes</Label>
              <Input
                id="handoverNotes"
                placeholder="Notes for the next attendant"
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowEndForm(false)}
              variant="outline"
              className="flex-1"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndShift}
              variant="destructive"
              className="flex-1"
              disabled={actionLoading}
            >
              {actionLoading ? "Ending..." : "Confirm End Shift"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No active shift — show start form
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Play className="h-5 w-5 text-blue-600" />
          Start Your Shift
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Clock in to start tracking your sales and activity.
        </p>
        <div>
          <Label htmlFor="openingCash">Opening Cash (₦) — optional</Label>
          <Input
            id="openingCash"
            type="number"
            min="0"
            step="0.01"
            placeholder="Cash in register at start"
            value={openingCash}
            onChange={e => setOpeningCash(e.target.value)}
          />
        </div>
        <Button
          onClick={handleStartShift}
          className="w-full"
          disabled={actionLoading}
        >
          {actionLoading ? (
            "Starting..."
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Clock In
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
