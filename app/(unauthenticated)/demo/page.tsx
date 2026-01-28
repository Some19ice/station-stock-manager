"use client"

import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle
} from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users
} from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manager Dashboard (Demo Mode)</h1>
        <Button variant="outline" asChild>
            <a href="/signup">Start Free Trial</a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedCard variant="metric" className="bg-green-950/20 border-green-500/20">
            <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Today's Revenue
                </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
                <div className="text-3xl font-bold">₦2,450,000</div>
                <div className="text-sm text-green-600">Cash in Hand</div>
            </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="metric">
             <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Transactions
                </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
                <div className="text-3xl font-bold">142</div>
                <div className="text-sm text-gray-500">Today</div>
            </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="alert" className="bg-red-950/20 border-red-500/50">
             <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2 text-red-600">
                    <Package className="h-4 w-4" /> Critical Shortage
                </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
                <div className="text-3xl font-bold text-red-600">2 Items</div>
                <div className="text-sm text-red-500 font-bold animate-pulse">Action Required</div>
            </EnhancedCardContent>
        </EnhancedCard>

         <EnhancedCard variant="metric">
             <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Staff on Duty
                </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
                <div className="text-3xl font-bold">4/6</div>
                <div className="text-sm text-gray-500">Accountability Log Active</div>
            </EnhancedCardContent>
        </EnhancedCard>
      </div>
      
      <div className="mt-8 text-center text-gray-500">
        <p>This is a static demo. Sign up to connect real station data.</p>
      </div>
    </div>
  )
}
