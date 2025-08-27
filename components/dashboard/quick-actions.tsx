import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  BarChart3,
  Plus,
  TrendingUp,
  Settings
} from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  lowStockCount?: number
}

export function QuickActions({ lowStockCount = 0 }: QuickActionsProps) {
  const actions = [
    {
      title: "Record Sale",
      description: "Quickly record a customer transaction",
      icon: ShoppingCart,
      href: "/staff/sales",
      variant: "default" as const,
      priority: 1
    },
    {
      title: "Manage Inventory",
      description: lowStockCount > 0 
        ? `${lowStockCount} items need attention`
        : "Update stock levels and manage products",
      icon: Package,
      href: "/dashboard/inventory",
      variant: lowStockCount > 0 ? "destructive" as const : "outline" as const,
      priority: lowStockCount > 0 ? 1 : 2,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    {
      title: "View Reports",
      description: "Generate and view business reports",
      icon: FileText,
      href: "/dashboard/reports",
      variant: "outline" as const,
      priority: 2
    },
    {
      title: "Manage Users",
      description: "Add and manage staff accounts",
      icon: Users,
      href: "/dashboard/users",
      variant: "outline" as const,
      priority: 3
    },
    {
      title: "Add Product",
      description: "Add new products to inventory",
      icon: Plus,
      href: "/dashboard/inventory?action=add",
      variant: "outline" as const,
      priority: 3
    },
    {
      title: "Analytics",
      description: "View detailed business analytics",
      icon: BarChart3,
      href: "/dashboard/reports?tab=analytics",
      variant: "outline" as const,
      priority: 4
    }
  ]

  // Sort actions by priority and whether they have alerts
  const sortedActions = actions.sort((a, b) => {
    if (a.badge && !b.badge) return -1
    if (!a.badge && b.badge) return 1
    return a.priority - b.priority
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Common tasks and shortcuts for efficient management
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedActions.map((action) => {
          const Icon = action.icon
          
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {action.title}
                  </div>
                  {action.badge && (
                    <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {action.badge}
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  asChild 
                  className="w-full" 
                  variant={action.variant}
                  size="sm"
                >
                  <Link href={action.href}>
                    {action.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">₦0</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">0</p>
              <p className="text-xs text-muted-foreground">Staff</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/dashboard/reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}