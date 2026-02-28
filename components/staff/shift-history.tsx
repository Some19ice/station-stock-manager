"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react"
import { getShiftHistory, getShiftDetails } from "@/actions/shifts"

interface ShiftRecord {
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
  user: {
    id: string
    username: string
    role: string
  }
}

interface ShiftHistoryProps {
  stationId: string
  refreshTrigger?: number
}

export function ShiftHistory({ stationId, refreshTrigger }: ShiftHistoryProps) {
  const [shifts, setShifts] = useState<ShiftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedShift, setExpandedShift] = useState<string | null>(null)
  const [shiftDetails, setShiftDetails] = useState<Record<string, unknown>>({})

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        const result = await getShiftHistory(stationId)
        if (result.isSuccess && result.data) {
          setShifts(result.data as ShiftRecord[])
        }
      } catch {
        // Non-critical, fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [stationId, refreshTrigger])

  const toggleExpand = async (shiftId: string) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null)
      return
    }

    setExpandedShift(shiftId)

    if (!shiftDetails[shiftId]) {
      const result = await getShiftDetails(shiftId)
      if (result.isSuccess && result.data) {
        setShiftDetails(prev => ({ ...prev, [shiftId]: result.data }))
      }
    }
  }

  function formatDuration(start: Date, end: Date | null): string {
    const endTime = end ? new Date(end).getTime() : Date.now()
    const diff = endTime - new Date(start).getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  function getCashDiscrepancy(shift: ShiftRecord): number | null {
    if (!shift.closingCash || !shift.expectedCash) return null
    return parseFloat(shift.closingCash) - parseFloat(shift.expectedCash)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <span className="ml-3 text-slate-500">Loading shift history...</span>
        </CardContent>
      </Card>
    )
  }

  if (shifts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-600">No shift records yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Start your first shift from the dashboard
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {shifts.map(shift => {
        const discrepancy = getCashDiscrepancy(shift)
        const isExpanded = expandedShift === shift.id
        const details = shiftDetails[shift.id] as
          | (ShiftRecord & {
              transactions: Array<{
                id: string
                totalAmount: string
                transactionDate: Date
                items: Array<{
                  quantity: string
                  totalPrice: string
                  product: { name: string; type: string; unit: string }
                }>
              }>
            })
          | undefined

        return (
          <Card
            key={shift.id}
            className={`transition-all ${
              shift.status === "active" ? "border-green-200" : ""
            }`}
          >
            <CardContent className="p-4">
              <div
                className="flex cursor-pointer items-center justify-between"
                onClick={() => toggleExpand(shift.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      shift.status === "active"
                        ? "bg-green-100"
                        : shift.status === "completed"
                          ? "bg-blue-100"
                          : "bg-red-100"
                    }`}
                  >
                    {shift.status === "active" ? (
                      <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                    ) : shift.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(shift.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </p>
                      <Badge
                        variant={
                          shift.status === "active" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {shift.status}
                      </Badge>
                      {discrepancy !== null && Math.abs(discrepancy) > 100 && (
                        <Badge variant="destructive" className="text-xs">
                          ₦{discrepancy.toLocaleString()} off
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {shift.user.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(shift.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        {" — "}
                        {shift.endedAt
                          ? new Date(shift.endedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "ongoing"}
                      </span>
                      <span>
                        {formatDuration(shift.startedAt, shift.endedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ₦{parseFloat(shift.totalSales).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {shift.transactionCount} txns
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-xs text-slate-500">Opening Cash</p>
                      <p className="font-semibold">
                        {shift.openingCash
                          ? `₦${parseFloat(shift.openingCash).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-xs text-slate-500">Closing Cash</p>
                      <p className="font-semibold">
                        {shift.closingCash
                          ? `₦${parseFloat(shift.closingCash).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-xs text-slate-500">Expected Cash</p>
                      <p className="font-semibold">
                        {shift.expectedCash
                          ? `₦${parseFloat(shift.expectedCash).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg p-2 ${
                        discrepancy !== null && Math.abs(discrepancy) > 100
                          ? "bg-red-50"
                          : "bg-green-50"
                      }`}
                    >
                      <p className="text-xs text-slate-500">Discrepancy</p>
                      <p
                        className={`font-semibold ${
                          discrepancy !== null && Math.abs(discrepancy) > 100
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {discrepancy !== null
                          ? `₦${discrepancy.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {(shift.notes || shift.handoverNotes) && (
                    <div className="space-y-2">
                      {shift.notes && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            Shift Notes
                          </p>
                          <p className="mt-1 text-sm">{shift.notes}</p>
                        </div>
                      )}
                      {shift.handoverNotes && (
                        <div className="rounded-lg bg-amber-50 p-3">
                          <p className="text-xs font-medium text-amber-700">
                            Handover Notes
                          </p>
                          <p className="mt-1 text-sm">
                            {shift.handoverNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {details?.transactions && details.transactions.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Transactions ({details.transactions.length})
                      </p>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {details.transactions.map(tx => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="text-slate-500">
                                {new Date(
                                  tx.transactionDate
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              <span className="ml-2 text-slate-700">
                                {tx.items
                                  .map(i => i.product.name)
                                  .join(", ")}
                              </span>
                            </div>
                            <span className="font-semibold">
                              ₦{parseFloat(tx.totalAmount).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
