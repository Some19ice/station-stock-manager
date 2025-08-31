"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyReportTab } from "./daily-report-tab"
import { StaffPerformanceTab } from "./staff-performance-tab"
import { LowStockAlertsTab } from "./low-stock-alerts-tab"
import { WeeklyMonthlyTab } from "./weekly-monthly-tab"
import { AnalyticsCharts } from "./analytics-charts"
import { ReportScheduler } from "./report-scheduler"
import { BarChart3, Calendar } from "lucide-react"

export function ReportsInterface() {
  const [activeTab, setActiveTab] = useState("daily")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Reports & Analytics</CardTitle>
        <CardDescription>
          Generate comprehensive reports, view analytics, and schedule automated reporting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
            <TabsTrigger value="periodic">Weekly/Monthly</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-6">
            <DailyReportTab />
          </TabsContent>
          
          <TabsContent value="staff" className="mt-6">
            <StaffPerformanceTab />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-6">
            <LowStockAlertsTab />
          </TabsContent>
          
          <TabsContent value="periodic" className="mt-6">
            <WeeklyMonthlyTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Visual Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive charts and graphs for better data insights
                </p>
              </div>
              <AnalyticsCharts 
                salesData={[]} // Would be populated with real data
                productData={[]} // Would be populated with real data
                staffData={[]} // Would be populated with real data
              />
            </div>
          </TabsContent>

          <TabsContent value="scheduler" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Automated Report Scheduling</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automatic report generation and email delivery
                </p>
              </div>
              <ReportScheduler />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}