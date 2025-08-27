"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyReportTab } from "./daily-report-tab"
import { StaffPerformanceTab } from "./staff-performance-tab"
import { LowStockAlertsTab } from "./low-stock-alerts-tab"
import { WeeklyMonthlyTab } from "./weekly-monthly-tab"

export function ReportsInterface() {
  const [activeTab, setActiveTab] = useState("daily")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Reports</CardTitle>
        <CardDescription>
          Generate and view comprehensive reports for your station
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
            <TabsTrigger value="periodic">Weekly/Monthly</TabsTrigger>
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
        </Tabs>
      </CardContent>
    </Card>
  )
}