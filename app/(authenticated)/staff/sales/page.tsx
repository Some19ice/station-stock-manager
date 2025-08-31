"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  ShoppingCart, 
  BarChart3, 
  Plus,
  TrendingUp,
  Clock,
  Target
} from "lucide-react"
import Link from "next/link"
import { SalesInterface } from "@/components/sales/sales-interface"
import { SalesSummary } from "@/components/sales/sales-summary"
import { useStationAuth } from "@/hooks/use-station-auth"

export default function StaffSalesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("record")
  const { user, station } = useStationAuth()

  const handleSaleComplete = () => {
    setRefreshTrigger(prev => prev + 1)
    // Show success feedback and switch to summary tab
    setTimeout(() => {
      setActiveTab("summary")
    }, 1000)
  }

  if (!user || !station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-slate-600 mt-4">Loading sales interface...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sales Management</h1>
              <div className="flex items-center space-x-2 text-slate-600">
                <span>{station.name}</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="text-xs">
                  {user.username}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Quick Sale</p>
                  <p className="text-xs text-slate-500">Start recording</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">View Summary</p>
                  <p className="text-xs text-slate-500">Today's performance</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Session</p>
                  <p className="text-xs text-slate-500">Ready to sell</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Sales Operations</CardTitle>
                <CardDescription>
                  Record new sales and monitor your daily performance
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Live Session
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                  <TabsTrigger value="record" className="flex items-center gap-2 text-sm font-medium">
                    <ShoppingCart className="h-4 w-4" />
                    Record Sale
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="flex items-center gap-2 text-sm font-medium">
                    <BarChart3 className="h-4 w-4" />
                    Daily Summary
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="record" className="mt-0 space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">New Sale Transaction</h3>
                        <p className="text-sm text-slate-600">Select products and quantities to record a sale</p>
                      </div>
                    </div>
                  </div>
                  <SalesInterface
                    stationId={station.id}
                    onSaleComplete={handleSaleComplete}
                  />
                </TabsContent>

                <TabsContent value="summary" className="mt-0 space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Performance Summary</h3>
                        <p className="text-sm text-slate-600">Your sales activity and achievements for today</p>
                      </div>
                    </div>
                  </div>
                  <SalesSummary
                    stationId={station.id}
                    userId={user.id}
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>System Online</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/staff">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
