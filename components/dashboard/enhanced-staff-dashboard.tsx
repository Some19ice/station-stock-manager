"use client"

import { PrimaryActionButton } from "./primary-action-button"
import { QuickStatsBar } from "./quick-stats-bar"
import { FrequentlySoldProducts } from "./frequently-sold-products"
import { RecentActivityFeed } from "./recent-activity-feed"
import { StaffPerformanceTracker } from "./staff-performance-tracker"
import { ShiftHandover } from "./shift-handover"
import { CustomerInteractionTracker } from "./customer-interaction-tracker"
import { StaffQuickActions } from "./staff-quick-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Clock, MessageSquare, Zap } from "lucide-react"

interface EnhancedStaffDashboardProps {
  user: {
    id: string
    username: string
  }
  station: {
    id: string
    name: string
  }
}

export function EnhancedStaffDashboard({ user, station }: EnhancedStaffDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.username}
        </h1>
        <p className="mt-1 text-gray-600">{station.name} • Sales Staff</p>
      </div>

      {/* Primary Action Button */}
      <PrimaryActionButton />

      {/* Quick Stats Bar */}
      <QuickStatsBar />

      {/* Tabbed Interface for Enhanced Features */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Interactions
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FrequentlySoldProducts />
            </div>
            <div className="space-y-6">
              <RecentActivityFeed />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaffPerformanceTracker />
            <ShiftHandover />
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerInteractionTracker />
            <div className="space-y-4">
              {/* Additional interaction features can go here */}
              <div className="text-center text-muted-foreground p-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Additional interaction features coming soon</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <StaffQuickActions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
