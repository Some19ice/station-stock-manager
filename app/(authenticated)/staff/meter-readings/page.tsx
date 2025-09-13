"use client"

import { useState } from "react"
import { useStationAuth } from "@/hooks/use-station-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Gauge,
  Clock,
  Fuel,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

// Simplified staff meter reading form
import { StaffMeterReadingForm } from "@/components/pms/staff-meter-reading-form"

export default function StaffMeterReadingsPage() {
  const { user, station } = useStationAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Show loading state while user/station data is being fetched
  if (!user || !station) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Loading PMS Meter Readings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/staff" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                PMS Meter Readings
              </h1>
              <p className="text-muted-foreground">
                Record closing meter readings for your shift
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Fuel className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">
                  Staff Meter Reading Entry
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Record your shift's closing readings for PMS sales calculation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>How it works:</strong>
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Opening readings are set by the manager at start of day</li>
                <li>Record closing readings at end of your shift</li>
                <li>
                  System automatically calculates PMS sales from the difference
                </li>
                <li>No need to record individual PMS transactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Current Shift Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Shift Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="border-green-300 bg-green-50 text-green-700"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Opening Set
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Manager has set opening readings
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="border-yellow-300 bg-yellow-50 text-yellow-700"
                  >
                    <Gauge className="mr-1 h-3 w-3" />
                    Readings Pending
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Waiting for closing readings
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-50 text-gray-700"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Calculation Pending
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Will calculate after closing readings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meter Reading Form */}
        <Tabs defaultValue="readings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="readings" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Record Readings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readings" className="space-y-6">
            <StaffMeterReadingForm
              key={refreshKey}
              stationId={station.id}
              staffId={user.id}
              onSuccess={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Readings</CardTitle>
                <CardDescription>
                  Last 7 days of meter readings you've recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground py-8 text-center">
                  Reading history will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
