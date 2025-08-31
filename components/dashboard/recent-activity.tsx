import { Clock, ShoppingCart, User } from "lucide-react"

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

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions
}) => {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const transactionDate = new Date(date)
    const diffInMinutes = Math.floor(
      (now.getTime() - transactionDate.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="text-center">
            <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {transactions.slice(0, 10).map(transaction => (
          <div
            key={transaction.id}
            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.userName} recorded a sale
                  </p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                    <span>{formatCurrency(transaction.totalAmount)}</span>
                    <span>
                      {transaction.itemCount} item
                      {transaction.itemCount !== 1 ? "s" : ""}
                    </span>
                    <span>{formatTimeAgo(transaction.transactionDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>{formatTimeAgo(transaction.transactionDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
