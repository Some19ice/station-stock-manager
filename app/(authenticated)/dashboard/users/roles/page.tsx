"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Shield, Users, Settings, Eye, Edit, Package, BarChart3 } from "lucide-react"
import { toast } from "sonner"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  permissions: string[]
  isSystem: boolean
}

const PERMISSIONS: Permission[] = [
  // Sales Permissions
  { id: "sales.record", name: "Record Sales", description: "Record new sales transactions", category: "Sales" },
  { id: "sales.view", name: "View Sales", description: "View sales history and transactions", category: "Sales" },
  { id: "sales.refund", name: "Process Refunds", description: "Process refunds and returns", category: "Sales" },
  
  // Inventory Permissions
  { id: "inventory.view", name: "View Inventory", description: "View product inventory levels", category: "Inventory" },
  { id: "inventory.manage", name: "Manage Inventory", description: "Add, edit, and manage products", category: "Inventory" },
  { id: "inventory.adjust", name: "Adjust Stock", description: "Make stock adjustments and corrections", category: "Inventory" },
  
  // Reports Permissions
  { id: "reports.sales", name: "Sales Reports", description: "Access sales analytics and reports", category: "Reports" },
  { id: "reports.inventory", name: "Inventory Reports", description: "Access inventory reports", category: "Reports" },
  { id: "reports.staff", name: "Staff Reports", description: "View staff performance reports", category: "Reports" },
  
  // User Management
  { id: "users.view", name: "View Users", description: "View staff member list", category: "Users" },
  { id: "users.manage", name: "Manage Users", description: "Add, edit, and manage staff accounts", category: "Users" },
  { id: "users.roles", name: "Manage Roles", description: "Assign and modify user roles", category: "Users" },
  
  // System Settings
  { id: "settings.view", name: "View Settings", description: "Access system settings", category: "Settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify system configuration", category: "Settings" }
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockRoles: Role[] = [
        {
          id: "1",
          name: "Sales Staff",
          description: "Basic sales staff with transaction recording capabilities",
          userCount: 8,
          permissions: ["sales.record", "sales.view", "inventory.view"],
          isSystem: true
        },
        {
          id: "2",
          name: "Senior Staff",
          description: "Experienced staff with additional inventory permissions",
          userCount: 3,
          permissions: ["sales.record", "sales.view", "sales.refund", "inventory.view", "inventory.adjust"],
          isSystem: false
        },
        {
          id: "3",
          name: "Manager",
          description: "Full access to all station management features",
          userCount: 2,
          permissions: PERMISSIONS.map(p => p.id),
          isSystem: true
        },
        {
          id: "4",
          name: "Inventory Manager",
          description: "Specialized role for inventory management",
          userCount: 1,
          permissions: [
            "sales.view", "inventory.view", "inventory.manage", "inventory.adjust",
            "reports.inventory", "users.view"
          ],
          isSystem: false
        }
      ]
      setRoles(mockRoles)
    } catch (error) {
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = async (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role || role.isSystem) {
      toast.error("Cannot modify system roles")
      return
    }

    try {
      setRoles(prev => prev.map(r => {
        if (r.id === roleId) {
          const hasPermission = r.permissions.includes(permissionId)
          return {
            ...r,
            permissions: hasPermission
              ? r.permissions.filter(p => p !== permissionId)
              : [...r.permissions, permissionId]
          }
        }
        return r
      }))
      toast.success("Permission updated successfully")
    } catch (error) {
      toast.error("Failed to update permission")
    }
  }

  const getPermissionsByCategory = () => {
    const categories = PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)
    return categories
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Sales": return <BarChart3 className="h-4 w-4" />
      case "Inventory": return <Package className="h-4 w-4" />
      case "Reports": return <Eye className="h-4 w-4" />
      case "Users": return <Users className="h-4 w-4" />
      case "Settings": return <Settings className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const permissionsByCategory = getPermissionsByCategory()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and their access permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Roles</span>
            </div>
            <p className="text-2xl font-bold">{roles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">
              {roles.reduce((sum, r) => sum + r.userCount, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Custom Roles</span>
            </div>
            <p className="text-2xl font-bold">
              {roles.filter(r => !r.isSystem).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Permissions</span>
            </div>
            <p className="text-2xl font-bold">{PERMISSIONS.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.userCount} users
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role.permissions.length} permissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isSystem ? "default" : "secondary"}>
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category} Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissions.map(permission => (
                <div key={permission.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {permission.description}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{role.name}</span>
                        <Switch
                          checked={role.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(role.id, permission.id)}
                          disabled={role.isSystem}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
