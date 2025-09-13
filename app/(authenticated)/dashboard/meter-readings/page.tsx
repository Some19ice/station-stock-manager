"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MeterReadingForm } from "@/components/pms/meter-reading-form"
import { DailyCalculationDashboard } from "@/components/pms/daily-calculation-dashboard"
import { PumpStatusManagement } from "@/components/pms/pump-status-management"
import { DeviationAlerts } from "@/components/pms/deviation-alerts"
import { useStationAuth } from "@/hooks/use-station-auth"
import {
  Gauge,
  Calculator,
  Settings,
  AlertTriangle,
  Fuel,
  Calendar
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export default function MeterReadingsPage() {
  const { user, station } = useStationAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [readingType, setReadingType] = useState<"opening" | "closing">(
    "opening"
  )

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!station) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-muted-foreground">Loading station data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            PMS Meter Readings
          </h1>
          <p className="text-muted-foreground">
            Record daily meter readings and monitor pump performance
          </p>
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
                Meter-Based PMS Sales
              </CardTitle>
              <CardDescription className="text-blue-700">
                Record opening and closing meter readings to calculate daily PMS
                sales
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-800">
            This system replaces individual PMS transaction recording. Enter
            daily meter readings for each pump, and the system will
            automatically calculate sales volumes and revenue.
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="readings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="readings" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Meter Readings
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Daily Calculations
          </TabsTrigger>
          <TabsTrigger value="pumps" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pump Management
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Deviation Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readings" className="space-y-6">
          {/* Date and Reading Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reading Configuration
              </CardTitle>
              <CardDescription>
                Select the date and type of readings to record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="selectedDate">Date</Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]} // Don't allow future dates
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readingType">Reading Type</Label>
                  <Select
                    value={readingType}
                    onValueChange={(value: "opening" | "closing") =>
                      setReadingType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reading type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opening">Opening Readings</SelectItem>
                      <SelectItem value="closing">Closing Readings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meter Reading Form */}
          <MeterReadingForm
            key={`${refreshKey}-${selectedDate}-${readingType}`}
            stationId={station.id}
            selectedDate={selectedDate}
            readingType={readingType}
            onSuccess={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="calculations" className="space-y-6">
          <DailyCalculationDashboard 
            key={refreshKey} 
            stationId={station.id}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="pumps" className="space-y-6">
          <PumpStatusManagement key={refreshKey} stationId={station.id} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <DeviationAlerts
            key={refreshKey}
            stationId={station.id}
            onResolve={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
