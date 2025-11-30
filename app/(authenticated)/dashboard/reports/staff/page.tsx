"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Users, TrendingUp, Clock, Award, Download, Star, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from "recharts"
import { toast } from "sonner"
import { getStaffPerformanceReports, getStaffStats } from "@/actions/staff-reports"

interface StaffMember {
  id: string
  name: string
  role: string
  avatar?: string
  totalSales: number
  transactionCount: number
  avgTransactionValue: number
  hoursWorked: number
  efficiency: number
  customerRating: number
  lastActive: Date
  performance: "excellent" | "good" | "average" | "needs_improvement"
}

interface PerformanceMetric {
  date: string
  sales: number
  transactions: number
  efficiency: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
const PERFORMANCE_COLORS = {
  'Excellent': '#22c55e',
  'Good': '#3b82f6', 
  'Average': '#f59e0b',
  'Needs Improvement': '#ef4444'
}

export default function StaffReportsPage() {
  const [staffData, setStaffData] = useState<StaffMember[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [selectedStaff, setSelectedStaff] = useState("all")

  useEffect(() => {
    loadStaffData()
  }, [timeRange])

  const loadStaffData = async () => {
    try {
      setLoading(true)
      const result = await getStaffPerformanceReports(timeRange)
      if (result.isSuccess && result.data) {
        setStaffData(result.data.staffData || [])
        setPerformanceData(result.data.performanceData || [])
      } else {
        toast.error(result.error || "Failed to load staff data")
        setStaffData([])
        setPerformanceData([])
      }
    } catch (error) {
      console.error("Failed to load staff data:", error)
      toast.error("Failed to load staff data")
      setStaffData([])
      setPerformanceData([])
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "text-green-600 bg-green-50"
      case "good": return "text-blue-600 bg-blue-50"
      case "average": return "text-yellow-600 bg-yellow-50"
      case "needs_improvement": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const totalSales = staffData.reduce((sum, staff) => sum + staff.totalSales, 0)
  const totalTransactions = staffData.reduce((sum, staff) => sum + staff.transactionCount, 0)
  const avgEfficiency = staffData.length > 0 ? staffData.reduce((sum, staff) => sum + staff.efficiency, 0) / staffData.length : 0
  const topPerformer = staffData.length > 0 ? staffData.reduce((top, staff) => 
    staff.totalSales > top.totalSales ? staff : top, staffData[0]) : null

  const performanceDistribution = selectedStaff === "all" 
    ? staffData.reduce((acc, staff) => {
        const performanceName = staff.performance.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
        const existing = acc.find(p => p.name === performanceName)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ name: performanceName, value: 1 })
        }
        return acc
      }, [] as Array<{ name: string; value: number }>)
    : staffData
        .filter(staff => selectedStaff === "all" || staff.id === selectedStaff)
        .map(staff => ({
          name: staff.name,
          value: staff.totalSales
        }))

  const roleDistribution = staffData.reduce((acc, staff) => {
    const existing = acc.find(r => r.name === staff.role)
    if (existing) {
      existing.value += staff.totalSales
      existing.count += 1
    } else {
      acc.push({ name: staff.role, value: staff.totalSales, count: 1 })
    }
    return acc
  }, [] as Array<{ name: string; value: number; count: number }>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Performance</h1>
          <p className="text-muted-foreground">
            Track and analyze staff performance metrics
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
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffData.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
              ))}
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
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Staff</span>
            </div>
            <p className="text-2xl font-bold">{staffData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Total Sales</span>
            </div>
            <p className="text-2xl font-bold">₦{(totalSales / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Avg Efficiency</span>
            </div>
            <p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Top Performer</span>
            </div>
            <p className="text-lg font-bold">{topPerformer?.name || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === "sales" ? `₦${(value as number / 1000000).toFixed(1)}M` : value,
                      name === "sales" ? "Sales" : name === "transactions" ? "Transactions" : "Efficiency %"
                    ]} 
                  />
                  <Bar yAxisId="left" dataKey="sales" fill="#0088FE" name="sales" />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#00C49F" name="efficiency" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStaff === "all" ? "Performance Distribution" : "Staff Sales Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : performanceDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">No performance data available</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => 
                      (percent ?? 0) > 0.05 ? `${name}: ${selectedStaff === "all" ? (value ?? 0) : `₦${((value ?? 0) / 1000000).toFixed(1)}M`} (${((percent ?? 0) * 100).toFixed(0)}%)` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedStaff === "all" 
                          ? PERFORMANCE_COLORS[entry.name as keyof typeof PERFORMANCE_COLORS] || COLORS[index % COLORS.length]
                          : COLORS[index % COLORS.length]
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      selectedStaff === "all" 
                        ? `${value} staff members` 
                        : `₦${((value as number) / 1000000).toFixed(1)}M`, 
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales by Role</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roleDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₦${(value as number / 1000000).toFixed(1)}M`, "Sales"]} />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading staff data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffData.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₦{(staff.totalSales / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ₦{(staff.avgTransactionValue / 1000).toFixed(0)}k
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{staff.transactionCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {staff.hoursWorked}h worked
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{staff.efficiency}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${staff.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{staff.customerRating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPerformanceColor(staff.performance)}>
                        {staff.performance.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {staff.lastActive.toLocaleDateString()}
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
