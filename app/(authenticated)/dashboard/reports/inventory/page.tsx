"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Package, TrendingDown, TrendingUp, AlertTriangle, Download, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { toast } from "sonner"
import { getInventoryReports, getInventoryStats } from "@/actions/inventory-reports"

interface InventoryData {
  id: string
  productName: string
  category: string
  currentStock: number
  minLevel: number
  maxLevel: number
  avgDailyUsage: number
  daysRemaining: number
  status: "healthy" | "low" | "critical" | "overstock"
  lastRestocked: Date
  totalValue: number
}

interface StockMovement {
  date: string
  inbound: number
  outbound: number
  net: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function InventoryReportsPage() {
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    loadInventoryData()
  }, [timeRange])

  const loadInventoryData = async () => {
    try {
      const result = await getInventoryReports(timeRange)
      if (result.isSuccess && result.data) {
        setInventoryData(result.data.inventoryData)
        setStockMovements(result.data.stockMovements)
      } else {
        toast.error(result.error || "Failed to load inventory data")
      }
    } catch (error) {
      console.error("Failed to load inventory data:", error)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600 bg-green-50"
      case "low": return "text-yellow-600 bg-yellow-50"
      case "critical": return "text-red-600 bg-red-50"
      case "overstock": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <TrendingUp className="h-4 w-4" />
      case "low": return <TrendingDown className="h-4 w-4" />
      case "critical": return <AlertTriangle className="h-4 w-4" />
      case "overstock": return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const categoryData = inventoryData.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category)
    if (existing) {
      existing.value += item.totalValue
      existing.count += 1
    } else {
      acc.push({ name: item.category, value: item.totalValue, count: 1 })
    }
    return acc
  }, [] as Array<{ name: string; value: number; count: number }>)

  const statusData = inventoryData.reduce((acc, item) => {
    const existing = acc.find(s => s.name === item.status)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: item.status, value: 1 })
    }
    return acc
  }, [] as Array<{ name: string; value: number }>)

  const totalValue = inventoryData.reduce((sum, item) => sum + item.totalValue, 0)
  const criticalItems = inventoryData.filter(item => item.status === "critical").length
  const lowStockItems = inventoryData.filter(item => item.status === "low").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive inventory analysis and stock insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Products</span>
            </div>
            <p className="text-2xl font-bold">{inventoryData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <p className="text-2xl font-bold">₦{(totalValue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Critical Items</span>
            </div>
            <p className="text-2xl font-bold">{criticalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <p className="text-2xl font-bold">{lowStockItems}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockMovements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}L`, ""]} />
                <Line type="monotone" dataKey="inbound" stroke="#00C49F" name="Inbound" />
                <Line type="monotone" dataKey="outbound" stroke="#FF8042" name="Outbound" />
                <Line type="monotone" dataKey="net" stroke="#0088FE" name="Net Change" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₦${(value as number / 1000000).toFixed(1)}M`, "Value"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detailed Inventory Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading inventory data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Restocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{item.currentStock.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Min: {item.minLevel.toLocaleString()} | Max: {item.maxLevel.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.daysRemaining} days</div>
                      <div className="text-xs text-muted-foreground">
                        {item.avgDailyUsage}/day avg
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₦{(item.totalValue / 1000000).toFixed(1)}M
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {item.lastRestocked.toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
