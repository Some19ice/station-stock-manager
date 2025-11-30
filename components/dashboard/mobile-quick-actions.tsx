"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  ShoppingCart,
  FileText,
  Truck
} from "lucide-react"
import Link from "next/link"

interface MobileQuickActionsProps {
  userRole: "staff" | "manager" | "director"
  alerts?: {
    lowStock: number
    pendingOrders: number
    staffIssues: number
  }
}

export function MobileQuickActions({ userRole, alerts }: MobileQuickActionsProps) {
  const quickActions = [
    {
      title: "Record Sale",
      icon: ShoppingCart,
      href: "/dashboard/sales",
      color: "bg-green-500",
      description: "Quick transaction entry"
    },
    {
      title: "Add Product",
      icon: Plus,
      href: "/dashboard/inventory",
      color: "bg-blue-500",
      description: "New inventory item"
    },
    {
      title: "Stock Check",
      icon: Package,
      href: "/dashboard/inventory",
      color: "bg-orange-500",
      description: "View current levels",
      alert: alerts?.lowStock
    },
    {
      title: "Staff",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-purple-500",
      description: "Manage team",
      alert: alerts?.staffIssues
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
      color: "bg-teal-500",
      description: "View analytics"
    },
    {
      title: "Suppliers",
      icon: Truck,
      href: "/dashboard/settings/suppliers",
      color: "bg-indigo-500",
      description: "Manage vendors"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-gray-500",
      description: "System config"
    },
    {
      title: "Analytics",
      icon: FileText,
      href: "/dashboard/analytics",
      color: "bg-pink-500",
      description: "Business insights"
    }
  ]

  // Filter actions based on role
  const filteredActions = quickActions.filter(action => {
    if (userRole === "staff") {
      return ["Record Sale", "Stock Check"].includes(action.title)
    }
    return true // Managers see all actions
  })

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-accent relative"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
                {action.alert && action.alert > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {action.alert}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Emergency Actions */}
        {userRole === "manager" && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2 text-red-600">Emergency Actions</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" className="flex-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Emergency Stop
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-1" />
                Incident Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
