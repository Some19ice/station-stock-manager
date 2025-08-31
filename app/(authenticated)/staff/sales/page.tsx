"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShoppingCart, BarChart3 } from "lucide-react"
import Link from "next/link"
import { SalesInterface } from "@/components/sales/sales-interface"
import { SalesSummary } from "@/components/sales/sales-summary"
import { useStationAuth } from "@/hooks/use-station-auth"

export default function StaffSalesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user, station } = useStationAuth()

  const handleSaleComplete = () => {
    // Trigger refresh of sales summary
    setRefreshTrigger(prev => prev + 1)
  }

  if (!user || !station) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/staff" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
        <p className="text-muted-foreground mt-2">
          Record sales and view your daily performance
        </p>
      </div>

      <Tabs defaultValue="record" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Record Sales
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Daily Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-6">
          <SalesInterface
            stationId={station.id}
            onSaleComplete={handleSaleComplete}
          />
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <SalesSummary
            stationId={station.id}
            userId={user.id}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
