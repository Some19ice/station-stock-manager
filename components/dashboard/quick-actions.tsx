import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  ArrowUpIcon,
  ChartBarIcon,
  Package,
  UsersIcon,
  ClockIcon
} from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  lowStockCount?: number
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  lowStockCount = 0
}) => {
  const actions = [
    {
      title: "Record Sale",
      icon: ShoppingCart,
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/staff/sales"
    },
    {
      title: "Add Stock",
      icon: ArrowUpIcon,
      color: "bg-green-600 hover:bg-green-700",
      href: "/dashboard/inventory/add"
    },
    {
      title: "View Reports",
      icon: ChartBarIcon,
      color: "bg-purple-600 hover:bg-purple-700",
      href: "/dashboard/reports"
    },
    {
      title: "Manage Products",
      icon: Package,
      color: "bg-orange-600 hover:bg-orange-700",
      href: "/dashboard/inventory"
    },
    {
      title: "Staff Management",
      icon: UsersIcon,
      color: "bg-indigo-600 hover:bg-indigo-700",
      href: "/dashboard/users"
    },
    {
      title: "End-of-Day Summary",
      icon: ClockIcon,
      color: "bg-gray-600 hover:bg-gray-700",
      href: "/dashboard/reports/daily"
    }
  ]

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map(action => {
          const Icon = action.icon

          return (
            <Button
              key={action.title}
              asChild
              className={`${action.color} h-auto min-h-[60px] flex-col gap-2 rounded-lg p-4 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <Link href={action.href}>
                <Icon className="h-5 w-5" />
                <span className="text-center text-sm leading-tight">{action.title}</span>
              </Link>
            </Button>
          )
        })}
      </div>
      
      {lowStockCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-800">
              {lowStockCount} items need restocking
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
