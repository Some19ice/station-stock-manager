import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Users,
  Fuel,
  Package
} from "lucide-react"
import { DashboardMetrics } from "@/actions/dashboard"

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount))
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Today's Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.todaysSales.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatCurrency(metrics.todaysSales.averageTransaction)} per transaction
          </p>
        </CardContent>
      </Card>

      {/* Transactions Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(metrics.todaysSales.transactionCount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Today's transaction count
          </p>
        </CardContent>
      </Card>

      {/* Low Stock Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${
            metrics.stockStatus.lowStockCount > 0 
              ? 'text-red-500' 
              : 'text-muted-foreground'
          }`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            metrics.stockStatus.lowStockCount > 0 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {formatNumber(metrics.stockStatus.lowStockCount)}
          </div>
          <p className="text-xs text-muted-foreground">
            of {formatNumber(metrics.stockStatus.totalProducts)} products
          </p>
        </CardContent>
      </Card>

      {/* Active Staff */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(metrics.staffActivity.activeStaffCount)}
          </div>
          <p className="text-xs text-muted-foreground">
            of {formatNumber(metrics.staffActivity.totalStaff)} total staff
          </p>
        </CardContent>
      </Card>

      {/* PMS Level - Additional card for fuel level */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PMS Level</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(parseFloat(metrics.stockStatus.pmsLevel || "0"))} L
          </div>
          <p className="text-xs text-muted-foreground">
            Total PMS in stock
          </p>
        </CardContent>
      </Card>

      {/* Top Products Summary */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Selling Today</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics.topProducts.length > 0 ? (
            <div className="space-y-2">
              {metrics.topProducts.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">
                    {index + 1}. {product.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales today</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}