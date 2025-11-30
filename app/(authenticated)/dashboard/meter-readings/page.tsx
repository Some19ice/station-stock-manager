"use client"

import { useState, useEffect } from "react"
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
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
  History,
  CheckCircle2,
  AlertCircle
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"

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
  const [readingStatus, setReadingStatus] = useState<{
    openingComplete: boolean
    closingComplete: boolean
    totalPumps: number
    activePumps: number
  }>({
    openingComplete: false,
    closingComplete: false,
    totalPumps: 0,
    activePumps: 0
  })
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    loadReadingStatus()
  }

  const loadReadingStatus = async () => {
    if (!station) return
    
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      setReadingStatus({
        openingComplete: Math.random() > 0.5,
        closingComplete: Math.random() > 0.3,
        totalPumps: 8,
        activePumps: 7
      })
    } catch (error) {
      console.error("Failed to load reading status:", error)
      toast.error("Failed to load reading status")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "opening":
        setReadingType("opening")
        break
      case "closing":
        setReadingType("closing")
        break
      case "export":
        toast.success("Export functionality coming soon")
        break
      case "history":
        toast.success("History view coming soon")
        break
    }
  }

  useEffect(() => {
    if (station) {
      loadReadingStatus()
    }
  }, [station, selectedDate])

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            PMS Meter Readings
          </h1>
          <p className="text-muted-foreground">
            Record daily meter readings and monitor pump performance for {station.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("opening")}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Opening Readings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("closing")}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Closing Readings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("export")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Opening Readings</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold">
                {readingStatus.openingComplete ? "Complete" : "Pending"}
              </p>
              {readingStatus.openingComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Closing Readings</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold">
                {readingStatus.closingComplete ? "Complete" : "Pending"}
              </p>
              {readingStatus.closingComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Active Pumps</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {readingStatus.activePumps}/{readingStatus.totalPumps}
            </p>
            <p className="text-xs text-muted-foreground">
              {((readingStatus.activePumps / readingStatus.totalPumps) * 100).toFixed(0)}% operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Today's Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {readingStatus.openingComplete && readingStatus.closingComplete ? "100%" : 
               readingStatus.openingComplete || readingStatus.closingComplete ? "50%" : "0%"}
            </p>
            <p className="text-xs text-muted-foreground">
              Daily readings completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Info Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <Fuel className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  Meter-Based PMS Sales Tracking
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Automated sales calculation from daily meter readings
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
              Date: {new Date(selectedDate).toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-blue-800 mb-2">
                <strong>How it works:</strong> Record opening and closing meter readings 
                for each pump. The system automatically calculates sales volumes and revenue.
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Opening readings: Start of business day</li>
                <li>• Closing readings: End of business day</li>
                <li>• Automatic volume calculation</li>
                <li>• Real-time deviation alerts</li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {readingType === "opening" ? "Morning" : "Evening"} Session
                </div>
                <div className="text-sm text-blue-700">
                  Recording {readingType} readings for {new Date(selectedDate).toDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="readings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="readings" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Meter Readings</span>
            <span className="sm:hidden">Readings</span>
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Calculations</span>
            <span className="sm:hidden">Calculations</span>
          </TabsTrigger>
          <TabsTrigger value="pumps" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pump Management</span>
            <span className="sm:hidden">Pumps</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Deviation Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readings" className="space-y-6">
          {/* Enhanced Date and Reading Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reading Configuration
              </CardTitle>
              <CardDescription>
                Configure date and reading type for meter data entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="selectedDate" className="text-sm font-medium">
                    Reading Date
                  </Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Select the date for meter readings
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="readingType" className="text-sm font-medium">
                    Reading Type
                  </Label>
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
                      <SelectItem value="opening">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Opening Readings
                        </div>
                      </SelectItem>
                      <SelectItem value="closing">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Closing Readings
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {readingType === "opening" 
                      ? "Start of business day readings" 
                      : "End of business day readings"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction("history")}
                      className="flex items-center gap-1"
                    >
                      <History className="h-3 w-3" />
                      History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction("export")}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    View history or export readings
                  </p>
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
