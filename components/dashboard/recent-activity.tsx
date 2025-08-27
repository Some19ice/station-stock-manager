import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ShoppingCart, User } from "lucide-react"
import Link from "next/link"

interface RecentTransaction {
  id: string
  totalAmount: string
  transactionDate: Date
  userName: string
  itemCount: number
}

interface RecentActivityProps {
  transactions: RecentTransaction[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount))
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date))
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const transactionDate = new Date(date)
    const diffInHours = Math.abs(now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatTime(transactionDate)
    } else {
      return new Intl.DateTimeFormat('en-NG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(transactionDate)
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest transactions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No recent transactions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions will appear here as they are recorded
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest transactions and activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {formatCurrency(transaction.totalAmount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.itemCount} item{transaction.itemCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{transaction.userName}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.transactionDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                >
                  <Link href={`/dashboard/reports?transaction=${transaction.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {transactions.length >= 10 && (
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/reports">
                View All Transactions
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}