"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Target } from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { toast } from "sonner"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface AnalyticsData {
  salesTrend: Array<{ date: string; sales: number; transactions: number }>
  profitMargins: Array<{ product: string; margin: number; revenue: number }>
  staffPerformance: Array<{ name: string; sales: number; efficiency: number }>
  categoryBreakdown: Array<{ name: string; value: number; percentage: number }>
  kpis: {
    totalRevenue: number
    totalProfit: number
    avgTransactionValue: number
    customerRetention: number
    inventoryTurnover: number
    profitMargin: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        salesTrend: [
          { date: "Week 1", sales: 2500000, transactions: 156 },
          { date: "Week 2", sales: 2800000, transactions: 178 },
          { date: "Week 3", sales: 2200000, transactions: 134 },
          { date: "Week 4", sales: 3100000, transactions: 198 }
        ],
        profitMargins: [
          { product: "Premium Petrol", margin: 15, revenue: 1800000 },
          { product: "Diesel", margin: 12, revenue: 1200000 },
          { product: "Engine Oil", margin: 35, revenue: 450000 },
          { product: "Brake Fluid", margin: 40, revenue: 180000 }
        ],
        staffPerformance: [
          { name: "John Adebayo", sales: 850000, efficiency: 92 },
          { name: "Sarah Okafor", sales: 720000, efficiency: 88 },
          { name: "Ahmed Hassan", sales: 650000, efficiency: 75 }
        ],
        categoryBreakdown: [
          { name: "Fuel", value: 3200000, percentage: 75 },
          { name: "Lubricants", value: 800000, percentage: 18 },
          { name: "Accessories", value: 300000, percentage: 7 }
        ],
        kpis: {
          totalRevenue: 4300000,
          totalProfit: 645000,
          avgTransactionValue: 15800,
          customerRetention: 78,
          inventoryTurnover: 12.5,
          profitMargin: 15
        }
      }
      setData(mockData)
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>
  }

  if (!data) {
    return <div className="p-8 text-center">No data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">Insights and performance metrics</p>
        </div>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <p className="text-xl font-bold">₦{(data.kpis.totalRevenue / 1000000).toFixed(1)}M</p>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Profit</span>
            </div>
            <p className="text-xl font-bold">₦{(data.kpis.totalProfit / 1000).toFixed(0)}K</p>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Avg Transaction</span>
            </div>
            <p className="text-xl font-bold">₦{(data.kpis.avgTransactionValue / 1000).toFixed(0)}K</p>
            <Badge variant="secondary" className="text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Retention</span>
            </div>
            <p className="text-xl font-bold">{data.kpis.customerRetention}%</p>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-medium">Turnover</span>
            </div>
            <p className="text-xl font-bold">{data.kpis.inventoryTurnover}x</p>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Margin</span>
            </div>
            <p className="text-xl font-bold">{data.kpis.profitMargin}%</p>
            <Badge variant="default" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₦${(value as number / 1000000).toFixed(1)}M`, "Sales"]} />
                <Line type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₦${(value as number / 1000000).toFixed(1)}M`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margins by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.profitMargins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Margin"]} />
                <Bar dataKey="margin" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.staffPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === "sales" ? `₦${(value as number / 1000).toFixed(0)}K` : `${value}%`,
                  name === "sales" ? "Sales" : "Efficiency"
                ]} />
                <Bar dataKey="sales" fill="#0088FE" />
                <Bar dataKey="efficiency" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
