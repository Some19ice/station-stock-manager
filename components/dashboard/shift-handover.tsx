"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ShiftData {
  startTime: string
  endTime: string
  totalSales: number
  transactionCount: number
  issues: string[]
  notes: string
}

export function ShiftHandover() {
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const mockShiftData: ShiftData = {
    startTime: "08:00",
    endTime: "16:00",
    totalSales: 125000,
    transactionCount: 45,
    issues: ["PMS pump 2 slow", "Low brake fluid stock"],
    notes: ""
  }

  const handleSubmitHandover = async () => {
    setSubmitting(true)
    try {
      // API call to submit handover
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Shift handover submitted successfully")
      setNotes("")
    } catch (error) {
      toast.error("Failed to submit handover")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Shift Handover
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {mockShiftData.startTime} - {mockShiftData.endTime}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="font-semibold">₦{mockShiftData.totalSales.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Shift Summary</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Transactions: {mockShiftData.transactionCount}</div>
            <div>Avg Sale: ₦{(mockShiftData.totalSales / mockShiftData.transactionCount).toFixed(0)}</div>
          </div>
        </div>

        {mockShiftData.issues.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Issues to Report
            </p>
            <div className="space-y-1">
              {mockShiftData.issues.map((issue, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {issue}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            Handover Notes
          </label>
          <Textarea
            placeholder="Add any important notes for the next shift..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmitHandover}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Submitting..." : "Complete Shift Handover"}
        </Button>
      </CardContent>
    </Card>
  )
}
