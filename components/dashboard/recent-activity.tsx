import React from "react"
import {
  Clock,
  ShoppingCart,
  User,
  Calendar,
  TrendingUp,
  Zap,
  Activity,
  Badge as BadgeIcon
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface TimeGroup {
  period: string
  transactions: RecentTransaction[]
  totalAmount: number
  color: string
}

function AnimatedTransactionItem({
  transaction,
  index,
  formatCurrency,
  formatTimeAgo,
  isLast = false
}: {
  transaction: RecentTransaction
  index: number
  formatCurrency: (amount: string) => string
  formatTimeAgo: (date: Date) => string
  isLast?: boolean
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!itemRef.current) return

    // Staggered entrance animation
    gsap.fromTo(
      itemRef.current,
      {
        opacity: 0,
        x: -30,
        scale: 0.95,
        rotationX: -10
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.7,
        delay: index * 0.15,
        ease: "back.out(1.7)"
      }
    )

    // Timeline dot animation
    if (timelineRef.current) {
      gsap.fromTo(
        timelineRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.15 + 0.3,
          ease: "elastic.out(1, 0.5)"
        }
      )
    }
  }, [index])

  const getTransactionValue = () => {
    const amount = parseFloat(transaction.totalAmount)
    if (amount > 50000) return "high"
    if (amount > 20000) return "medium"
    return "low"
  }

  const getValueColor = (value: string) => {
    switch (value) {
      case "high":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="relative flex items-start gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          ref={timelineRef}
          className={cn(
            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-all duration-300",
            "border-blue-300 shadow-sm",
            isHovered && "scale-110 border-blue-500 shadow-md"
          )}
        >
          <div
            className={cn(
              "h-3 w-3 rounded-full transition-all duration-300",
              getValueColor(getTransactionValue()).split(" ")[1]
            )}
          />

          {/* Ripple effect */}
          {isHovered && (
            <div className="absolute inset-0 animate-ping rounded-full border border-blue-400 opacity-30" />
          )}
        </div>

        {!isLast && <div className="bg-border h-full w-px" />}
      </div>

      {/* Transaction Card */}
      <div
        ref={itemRef}
        className="group flex-1 pb-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10",
            "transform-gpu cursor-pointer border-l-4",
            getTransactionValue() === "high" &&
              "border-l-green-500 bg-green-50/30",
            getTransactionValue() === "medium" &&
              "border-l-blue-500 bg-blue-50/30",
            getTransactionValue() === "low" && "border-l-gray-500 bg-gray-50/30"
          )}
        >
          {/* Animated background gradient */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-300",
              "bg-muted/20",
              isHovered && "opacity-100"
            )}
          />

          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                    getValueColor(getTransactionValue()),
                    isHovered && "scale-110 shadow-md"
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {transaction.userName} recorded a sale
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs transition-all duration-300",
                        getValueColor(getTransactionValue())
                          .replace("bg-", "border-")
                          .replace("text-", "text-")
                      )}
                    >
                      {getTransactionValue().toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </span>
                    <span className="text-gray-600">
                      {transaction.itemCount} item
                      {transaction.itemCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{formatTimeAgo(transaction.transactionDate)}</span>
                </div>

                {/* Transaction impact indicator */}
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs transition-all duration-300",
                    getValueColor(getTransactionValue()).split(" ")[0]
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">Impact</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TimeGroupHeader({
  group,
  index
}: {
  group: TimeGroup
  index: number
}) {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power3.out"
      }
    )
  }, [index])

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-20 mb-4 bg-white/80 py-2 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              group.color
            )}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{group.period}</h4>
            <p className="text-xs text-gray-600">
              {group.transactions.length} transaction
              {group.transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            ₦{group.totalAmount.toLocaleString()}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export const RecentActivity = React.memo<RecentActivityProps>(function RecentActivity({
  transactions
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  const groupTransactionsByTime = (
    transactions: RecentTransaction[]
  ): TimeGroup[] => {
    const now = new Date()
    const groups: { [key: string]: RecentTransaction[] } = {
      "Last Hour": [],
      "Today": [],
      "Yesterday": [],
      "Earlier": []
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate)
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      )

      let period: string
      if (diffInHours < 1) {
        period = "Last Hour"
      } else if (diffInHours < 24) {
        period = "Today"
      } else if (diffInHours < 48) {
        period = "Yesterday"
      } else {
        period = "Earlier"
      }

      groups[period].push(transaction)
    })

    const periodOrder = ["Last Hour", "Today", "Yesterday", "Earlier"]
    const colors = {
      "Last Hour": "bg-green-100 text-green-600",
      Today: "bg-blue-100 text-blue-600",
      Yesterday: "bg-amber-100 text-amber-600",
      Earlier: "bg-gray-100 text-gray-600"
    }

    return periodOrder
      .filter(period => groups[period].length > 0)
      .map(period => ({
        period,
        transactions: groups[period],
        totalAmount: groups[period].reduce(
          (sum, t) => sum + parseFloat(t.totalAmount),
          0
        ),
        color: colors[period as keyof typeof colors]
      }))
  }

  // Header animation
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [])

  // Empty state animation
  useEffect(() => {
    if (emptyStateRef.current && transactions.length === 0) {
      const elements = emptyStateRef.current.children
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3
        }
      )
    }
  }, [transactions.length])

  // Timeline container animation
  useEffect(() => {
    if (timelineRef.current && transactions.length > 0) {
      gsap.fromTo(
        timelineRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
      )
    }
  }, [transactions.length])

  const timeGroups = groupTransactionsByTime(transactions)
  const totalAmount = transactions.reduce(
    (sum, t) => sum + parseFloat(t.totalAmount),
    0
  )

  return (
    <Card className="h-[500px] flex flex-col">
      <div ref={headerRef} className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Badge variant="secondary" className="animate-pulse">
              {transactions.length} Transaction
              {transactions.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              ₦{totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {transactions.length === 0 ? (
          <div ref={emptyStateRef} className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                No Recent Activity
              </h4>
              <p className="mb-4 text-sm text-gray-600">
                Transaction activity will appear here as they happen
              </p>
              <Button variant="outline" size="sm">
                <Zap className="mr-2 h-4 w-4" />
                Start Recording Sales
              </Button>
            </div>
          </div>
        ) : (
          <div ref={timelineRef} className="relative">
            {/* Timeline Background */}
            <div className="bg-border absolute top-8 bottom-0 left-4 w-px opacity-30" />

            <div className="space-y-6">
              {timeGroups.map((group, groupIndex) => (
                <div key={group.period}>
                  <TimeGroupHeader group={group} index={groupIndex} />

                  <div className="space-y-1">
                    {group.transactions.length > 0 ? (
                      group.transactions.map((transaction, index) => {
                        const globalIndex = transactions.findIndex(
                          t => t.id === transaction.id
                        )
                        const isLast =
                          groupIndex === timeGroups.length - 1 &&
                          index === group.transactions.length - 1

                        return (
                          <AnimatedTransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            index={globalIndex}
                            formatCurrency={formatCurrency}
                            formatTimeAgo={formatTimeAgo}
                            isLast={isLast}
                          />
                        )
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No {group.period.toLowerCase()} transactions</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Always show Earlier section */}
              {!timeGroups.some(group => group.period === "Earlier") && (
                <div>
                  <TimeGroupHeader 
                    group={{
                      period: "Earlier",
                      transactions: [],
                      totalAmount: 0,
                      color: "bg-gray-100 text-gray-600"
                    }} 
                    index={timeGroups.length} 
                  />
                  <div className="space-y-1">
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No earlier transactions</p>
                      <p className="text-xs mt-1">Transactions older than 2 days will appear here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline end indicator */}
            <div className="flex justify-center pt-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-100 shadow-sm">
                <BadgeIcon className="h-3 w-3 text-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})
