"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { getShiftHistory } from "@/actions/shifts"

interface ShiftRecord {
  id: string
  userId: string
  status: "active" | "completed" | "abandoned"
  startedAt: Date
  endedAt: Date | null
  totalSales: string
  transactionCount: string
  closingCash: string | null
  expectedCash: string | null
  notes: string | null
  handoverNotes: string | null
  user: {
    id: string
    username: string
    role: string
  }
}

interface ShiftHandoverProps {
  stationId: string
}

export function ShiftHandover({ stationId }: ShiftHandoverProps) {
  const [recentShifts, setRecentShifts] = useState<ShiftRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShifts() {
      try {
        const result = await getShiftHistory(stationId, 5)
        if (result.isSuccess && result.data) {
          setRecentShifts(result.data as ShiftRecord[])
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchShifts()
  }, [stationId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </CardContent>
      </Card>
    )
  }

  const completedShifts = recentShifts.filter(s => s.status === "completed")
  const activeShifts = recentShifts.filter(s => s.status === "active")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Shift Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeShifts.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="mb-2 text-xs font-medium text-green-700">
              Active Shifts ({activeShifts.length})
            </p>
            {activeShifts.map(shift => (
              <div
                key={shift.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  {shift.user.username}
                </span>
                <span className="text-slate-500">
                  since{" "}
                  {new Date(shift.startedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            ))}
          </div>
        )}

        {completedShifts.length === 0 && activeShifts.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            No recent shift records
          </p>
        )}

        {completedShifts.slice(0, 3).map(shift => {
          const discrepancy =
            shift.closingCash && shift.expectedCash
              ? parseFloat(shift.closingCash) - parseFloat(shift.expectedCash)
              : null

          return (
            <div key={shift.id} className="space-y-2 border-b pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {shift.user.username}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(shift.startedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>
                    {new Date(shift.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}{" "}
                    —{" "}
                    {shift.endedAt
                      ? new Date(shift.endedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "—"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">
                    ₦{parseFloat(shift.totalSales).toLocaleString()}
                  </span>
                  <span className="ml-1 text-slate-400">
                    ({shift.transactionCount} txns)
                  </span>
                </div>
              </div>

              {discrepancy !== null && Math.abs(discrepancy) > 100 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Cash discrepancy: ₦{discrepancy.toLocaleString()}
                </div>
              )}

              {shift.handoverNotes && (
                <div className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  <span className="font-medium">Handover: </span>
                  {shift.handoverNotes}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
