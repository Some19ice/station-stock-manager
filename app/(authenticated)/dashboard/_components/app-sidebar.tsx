"use client"

import { 
  BarChart3, 
  Package, 
  Users, 
  Settings, 
  ShoppingCart,
  FileText,
  AlertTriangle,
  Home
} from "lucide-react"
import * as React from "react"
import { useInventoryModalTrigger } from "@/hooks/use-inventory-modal"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "../_components/nav-main"
import { NavUser } from "../_components/nav-user"

export function AppSidebar({
  userData,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userData: {
    name: string
    email: string
    avatar: string
    membership: string
  }
}) {
  const { openAddProductModal } = useInventoryModalTrigger()

  const data = {
    user: userData,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        items: []
      },
      {
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: Package,
        items: [
          {
            title: "View Products",
            url: "/dashboard/inventory"
          },
          {
            title: "Add Product",
            url: "/dashboard/inventory",
            onClick: openAddProductModal
          },
          {
            title: "Low Stock Alerts",
            url: "/dashboard/inventory?filter=low-stock"
          }
        ]
      },
      {
        title: "Sales & Transactions",
        url: "/dashboard/sales",
        icon: ShoppingCart,
        items: [
          {
            title: "Record Sale",
            url: "/staff/sales"
          },
          {
            title: "Transaction History",
            url: "/dashboard/sales/history"
          },
          {
            title: "Daily Summary",
            url: "/staff/summary"
          }
        ]
      },
      {
        title: "Reports & Analytics",
        url: "/dashboard/reports",
        icon: BarChart3,
        items: [
          {
            title: "Sales Reports",
            url: "/dashboard/reports"
          },
          {
            title: "Inventory Reports",
            url: "/dashboard/reports/inventory"
          },
          {
            title: "Staff Performance",
            url: "/dashboard/reports/staff"
          }
        ]
      },
      {
        title: "Staff Management",
        url: "/dashboard/users",
        icon: Users,
        items: [
          {
            title: "View Staff",
            url: "/dashboard/users"
          },
          {
            title: "Add Staff Member",
            url: "/dashboard/users/add"
          },
          {
            title: "Roles & Permissions",
            url: "/dashboard/users/roles"
          }
        ]
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        items: [
          {
            title: "Station Settings",
            url: "/dashboard/settings"
          },
          {
            title: "Product Categories",
            url: "/dashboard/settings/categories"
          },
          {
            title: "Suppliers",
            url: "/dashboard/settings/suppliers"
          }
        ]
      }
    ]
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Station Stock Manager</span>
            <span className="truncate text-xs text-muted-foreground">Manager Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
