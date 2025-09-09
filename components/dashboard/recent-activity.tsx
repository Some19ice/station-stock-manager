import React from "react"
import {
  Clock,
  ShoppingCart,
  User,
  Calendar,
  TrendingUp,
  Zap,
  Activity,
  Badge as BadgeIcon,
  Sparkles,
  ArrowUp,
  MoreHorizontal,
  Eye
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
  const cardRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const amountRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [clickAnimation, setClickAnimation] = useState(false)

  useEffect(() => {
    if (!itemRef.current) return

    // Enhanced entrance animation with more sophisticated timing
    const tl = gsap.timeline()

    // Main item entrance with 3D perspective
    tl.fromTo(
      itemRef.current,
      {
        opacity: 0,
        y: 40,
        scale: 0.85,
        rotationX: -20,
        transformOrigin: "center bottom",
        filter: "blur(8px)"
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        filter: "blur(0px)",
        duration: 0.6,
        delay: index * 0.08,
        ease: "back.out(1.4)"
      }
    )

    // Timeline dot with enhanced spin and glow effect
    if (timelineRef.current) {
      tl.fromTo(
        timelineRef.current,
        {
          scale: 0,
          opacity: 0,
          rotation: -360,
          boxShadow: "0 0 0px rgba(59, 130, 246, 0)"
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          duration: 0.5,
          ease: "back.out(2.5)"
        },
        "-=0.4"
      )

      // Add pulsing glow effect
      gsap.to(timelineRef.current, {
        boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: index * 0.08 + 0.3
      })
    }

    // Icon entrance with bounce
    if (iconRef.current) {
      tl.fromTo(
        iconRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)"
        },
        "-=0.3"
      )
    }

    // Amount counter animation
    if (amountRef.current) {
      const amount = parseFloat(transaction.totalAmount)
      const counterObj = { value: 0 }
      gsap.to(counterObj, {
        value: amount,
        duration: 0.8,
        delay: index * 0.08 + 0.2,
        ease: "power2.out",
        onUpdate: function () {
          if (amountRef.current) {
            const formattedValue = new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(counterObj.value)
            amountRef.current.textContent = formattedValue
          }
        }
      })
    }

    return () => {
      tl.kill()
    }
  }, [index, transaction.totalAmount])

  // Enhanced hover animations with more sophisticated effects
  useEffect(() => {
    if (!cardRef.current) return

    const element = cardRef.current
    const badge = badgeRef.current
    const icon = iconRef.current
    const timeline = timelineRef.current

    if (isHovered) {
      // Main card hover with 3D tilt and lift
      gsap.to(element, {
        scale: 1.03,
        y: -12,
        rotationY: 8,
        rotationX: 2,
        transformOrigin: "center center",
        duration: 0.25,
        ease: "power2.out",
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
      })

      // Badge hover with spin and scale
      if (badge) {
        gsap.to(badge, {
          scale: 1.15,
          rotation: 8,
          duration: 0.25,
          ease: "back.out(1.7)"
        })
      }

      // Icon hover with bounce
      if (icon) {
        gsap.to(icon, {
          scale: 1.2,
          rotation: 15,
          duration: 0.25,
          ease: "elastic.out(1, 0.3)"
        })
      }

      // Timeline dot glow intensification
      if (timeline) {
        gsap.to(timeline, {
          scale: 1.3,
          boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)",
          duration: 0.2,
          ease: "power2.out"
        })
      }
    } else {
      // Return to normal state
      gsap.to(element, {
        scale: 1,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.25,
        ease: "power2.out",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
      })

      if (badge) {
        gsap.to(badge, {
          scale: 1,
          rotation: 0,
          duration: 0.25,
          ease: "power2.out"
        })
      }

      if (icon) {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.25,
          ease: "power2.out"
        })
      }

      if (timeline) {
        gsap.to(timeline, {
          scale: 1,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          duration: 0.2,
          ease: "power2.out"
        })
      }
    }
  }, [isHovered])

  // Click animation
  const handleClick = () => {
    if (!cardRef.current) return

    setClickAnimation(true)

    gsap.to(cardRef.current, {
      scale: 0.98,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(cardRef.current, {
          scale: isHovered ? 1.03 : 1,
          duration: 0.3,
          ease: "back.out(1.7)",
          onComplete: () => setClickAnimation(false)
        })
      }
    })

    // Ripple effect
    if (timelineRef.current) {
      const ripple = document.createElement("div")
      ripple.className =
        "absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"
      timelineRef.current.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    }
  }

  const getTransactionValue = () => {
    const amount = parseFloat(transaction.totalAmount)
    if (amount > 50000) return "high"
    if (amount > 20000) return "medium"
    return "low"
  }

  const getValueColor = (value: string) => {
    switch (value) {
      case "high":
        return "text-green-600 bg-green-100 border-green-200"
      case "medium":
        return "text-blue-600 bg-blue-100 border-blue-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getValueGradient = (value: string) => {
    switch (value) {
      case "high":
        return "from-green-200 to-green-300"
      case "medium":
        return "from-blue-200 to-blue-300"
      default:
        return "from-gray-200 to-gray-300"
    }
  }

  return (
    <div className="transaction-item relative flex items-start gap-4">
      {/* Enhanced Timeline */}
      <div className="flex flex-col items-center">
        <div
          ref={timelineRef}
          data-timeline-dot="true"
          className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all duration-300",
            "cursor-pointer border-blue-300 shadow-lg",
            getValueColor(getTransactionValue()).includes("green") &&
              "border-green-300",
            getValueColor(getTransactionValue()).includes("blue") &&
              "border-blue-300",
            getValueColor(getTransactionValue()).includes("gray") &&
              "border-gray-300"
          )}
          onClick={handleClick}
        >
          <div
            className={cn(
              "h-4 w-4 rounded-full transition-all duration-300",
              getValueColor(getTransactionValue()).split(" ")[1],
              isHovered && "scale-110"
            )}
          />

          {/* Enhanced ripple effect */}
          {isHovered && (
            <>
              <div className="absolute inset-0 animate-ping rounded-full border border-blue-400 opacity-30" />
              <div
                className="absolute inset-0 animate-pulse rounded-full border border-blue-300 opacity-20"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}

          {/* Value indicator */}
          {getTransactionValue() === "high" && (
            <div className="absolute -top-1 -right-1 h-3 w-3 animate-bounce rounded-full bg-green-500">
              <ArrowUp className="m-0.5 h-2 w-2 text-white" />
            </div>
          )}
        </div>

        {!isLast && (
          <div
            className={cn(
              "h-full w-px bg-gradient-to-b transition-all duration-500",
              "from-blue-300 to-gray-200",
              isHovered && "from-blue-400 to-blue-200 shadow-sm"
            )}
          />
        )}
      </div>

      {/* Enhanced Transaction Card */}
      <div
        ref={itemRef}
        className="group flex-1 pb-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          ref={cardRef}
          className={cn(
            "group relative cursor-pointer overflow-hidden border-l-4 shadow-lg backdrop-blur-sm transition-all duration-300",
            "bg-card/95 backdrop-blur-sm hover:backdrop-blur-md",
            "hover:shadow-2xl",
            getTransactionValue() === "high" &&
              "border-l-green-500 bg-green-50/40",
            getTransactionValue() === "medium" &&
              "border-l-blue-500 bg-blue-50/40",
            getTransactionValue() === "low" &&
              "border-l-gray-500 bg-gray-50/40",
            clickAnimation && "ring-4 ring-blue-400/30"
          )}
          onClick={handleClick}
        >
          {/* Enhanced background layers */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-0 transition-all duration-500",
              isHovered && "opacity-15",
              getValueGradient(getTransactionValue())
            )}
          />

          {/* Ambient glow effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100",
              getTransactionValue() === "high" && "bg-green-100/30",
              getTransactionValue() === "medium" && "bg-blue-100/30",
              getTransactionValue() === "low" && "bg-gray-100/30"
            )}
          />

          {/* Enhanced shimmer effect */}
          <div
            className={cn(
              "absolute inset-0 -translate-x-full transform transition-all duration-1000",
              "bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0",
              isHovered && "translate-x-full opacity-100"
            )}
          />

          {/* Sparkle effect for high-value transactions */}
          {getTransactionValue() === "high" && isHovered && (
            <div className="absolute top-2 right-2 z-20">
              <Sparkles className="h-4 w-4 animate-pulse text-green-500" />
            </div>
          )}

          <CardContent className="relative z-10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  ref={iconRef}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl shadow-md transition-all duration-300",
                    getValueColor(getTransactionValue()),
                    isHovered && "shadow-lg"
                  )}
                >
                  <ShoppingCart className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                      {transaction.userName} recorded a sale
                    </p>
                    <Badge
                      ref={badgeRef}
                      variant="outline"
                      className={cn(
                        "text-xs font-medium transition-all duration-300",
                        getValueColor(getTransactionValue()),
                        isHovered && "shadow-sm"
                      )}
                      data-badge="true"
                    >
                      {getTransactionValue().toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span
                      ref={amountRef}
                      className="font-bold text-gray-900 tabular-nums"
                    >
                      {formatCurrency(transaction.totalAmount)}
                    </span>
                    <span className="font-medium text-gray-600">
                      {transaction.itemCount} item
                      {transaction.itemCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <Clock className="mr-1.5 h-3 w-3" />
                  <span>{formatTimeAgo(transaction.transactionDate)}</span>
                </div>

                {/* Enhanced transaction impact indicator */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all duration-300",
                    getValueColor(getTransactionValue()),
                    isHovered && "scale-105"
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Impact</span>
                </div>
              </div>
            </div>

            {/* Progress bar for transaction value */}
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  "h-full rounded-full transition-all delay-200 duration-500",
                  getTransactionValue() === "high" && "bg-green-500",
                  getTransactionValue() === "medium" && "bg-blue-500",
                  getTransactionValue() === "low" && "bg-gray-500"
                )}
                style={{
                  width: `${Math.min((parseFloat(transaction.totalAmount) / 100000) * 100, 100)}%`
                }}
              />
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
  const iconRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!headerRef.current) return

    // Enhanced group header animation with stagger
    const tl = gsap.timeline()

    tl.fromTo(
      headerRef.current,
      {
        opacity: 0,
        y: -30,
        scale: 0.9,
        rotationX: -20
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.5,
        delay: index * 0.1,
        ease: "back.out(1.5)"
      }
    )

    // Icon animation
    if (iconRef.current) {
      tl.fromTo(
        iconRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "back.out(2)"
        },
        "-=0.3"
      )
    }

    // Badge animation
    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)"
        },
        "-=0.2"
      )
    }
  }, [index])

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-20 mb-6 bg-white/90 py-3 backdrop-blur-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-md backdrop-blur-sm transition-all duration-300",
          "hover:bg-white/90 hover:shadow-lg",
          isHovered && "scale-[1.02] shadow-xl"
        )}
      >
        <div className="flex items-center gap-4">
          <div
            ref={iconRef}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all duration-300",
              group.color,
              isHovered && "scale-110 shadow-md"
            )}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{group.period}</h4>
            <p className="text-xs font-medium text-gray-600">
              {group.transactions.length} transaction
              {group.transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            ref={badgeRef}
            variant="secondary"
            className={cn(
              "text-sm font-semibold transition-all duration-300",
              isHovered && "scale-105"
            )}
          >
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
  const [showAll, setShowAll] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

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
      Today: [],
      Yesterday: [],
      Earlier: []
    }

    // Limit total transactions to prevent excessive scrolling
    const limitedTransactions = showAll
      ? transactions
      : transactions.slice(0, 15)

    limitedTransactions.forEach(transaction => {
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
        transactions: showAll ? groups[period] : groups[period].slice(0, 5), // Limit per group
        totalAmount: groups[period].reduce(
          (sum, t) => sum + parseFloat(t.totalAmount),
          0
        ),
        color: colors[period as keyof typeof colors]
      }))
  }

  // Enhanced header animation matching Quick Actions
  useEffect(() => {
    if (!headerRef.current) return

    const tl = gsap.timeline({ onComplete: () => setAnimationComplete(true) })

    tl.fromTo(
      headerRef.current,
      {
        opacity: 0,
        y: -20,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
      }
    )

    return () => {
      tl.kill()
    }
  }, [])

  // Enhanced empty state animation
  useEffect(() => {
    if (!emptyStateRef.current || transactions.length > 0) return

    const elements = emptyStateRef.current.children
    const tl = gsap.timeline()

    tl.fromTo(
      elements,
      {
        opacity: 0,
        y: 30,
        scale: 0.8,
        rotationX: -15
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.5)",
        delay: 0.2
      }
    )

    return () => {
      tl.kill()
    }
  }, [transactions.length])

  // Enhanced timeline container animation
  useEffect(() => {
    if (!timelineRef.current || transactions.length === 0) return

    gsap.fromTo(
      timelineRef.current,
      {
        opacity: 0,
        scale: 0.95,
        y: 30,
        filter: "blur(10px)"
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
        delay: 0.1
      }
    )
  }, [transactions.length])

  const timeGroups = groupTransactionsByTime(transactions)
  const totalAmount = transactions.reduce(
    (sum, t) => sum + parseFloat(t.totalAmount),
    0
  )

   return (
     <Card className="relative flex h-full flex-col overflow-hidden">
       {/* Ambient background effects - properly contained within card */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-purple-50/10 opacity-40 z-0" />
       <div className="absolute top-4 right-1/4 h-24 w-24 animate-pulse rounded-full bg-blue-300/5 blur-lg filter z-0" />
       <div
         className="absolute bottom-4 left-1/4 h-20 w-20 animate-pulse rounded-full bg-purple-300/5 blur-lg filter z-0"
         style={{ animationDelay: "1s" }}
       />

      <div
        ref={headerRef}
        className="relative z-20 flex-shrink-0 border-b bg-white/90 p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Recent Activity
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="animate-pulse">
                  {transactions.length} Transaction
                  {transactions.length !== 1 ? "s" : ""}
                </Badge>
                {animationComplete && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700"
                  >
                    Live
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 tabular-nums">
              ₦{totalAmount.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-500">Total Value</div>
          </div>
        </div>
      </div>

       <div className="relative z-20 max-h-[800px] flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div
            ref={emptyStateRef}
            className="flex h-full items-center justify-center p-8"
          >
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
              <h4 className="mb-3 text-xl font-bold text-gray-900">
                No Recent Activity
              </h4>
              <p className="mb-6 leading-relaxed text-gray-600">
                Transaction activity will appear here as they happen. Start
                recording your first sale!
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Recording Sales
              </Button>
            </div>
          </div>
        ) : (
          <div ref={timelineRef} className="relative p-6">
            {/* Enhanced timeline background */}
            <div className="absolute top-12 bottom-0 left-9 w-0.5 bg-gradient-to-b from-blue-300 via-purple-200 to-transparent opacity-40" />

            {/* Time groups and transactions */}
            <div className="space-y-8">
              {timeGroups.map((group, groupIndex) => (
                <div key={group.period} className="relative">
                  <TimeGroupHeader group={group} index={groupIndex} />

                  <div className="space-y-4">
                    {group.transactions.map((transaction, transactionIndex) => {
                      const overallIndex =
                        timeGroups
                          .slice(0, groupIndex)
                          .reduce((acc, g) => acc + g.transactions.length, 0) +
                        transactionIndex

                      const isLastInGroup =
                        transactionIndex === group.transactions.length - 1
                      const isLastOverall =
                        groupIndex === timeGroups.length - 1 && isLastInGroup

                      return (
                        <AnimatedTransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          index={overallIndex}
                          formatCurrency={formatCurrency}
                          formatTimeAgo={formatTimeAgo}
                          isLast={isLastOverall}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

             {/* Enhanced floating action button - removed from content area */}

            {/* View All / Show Less Button */}
            {transactions.length > 15 && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className={cn(
                    "group flex items-center gap-2 rounded-full px-6 py-2 transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-300/50",
                    showAll
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  )}
                >
                  {showAll ? (
                    <>
                      <MoreHorizontal className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium">Show Less</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium">
                        View All {transactions.length} Transactions
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Performance indicator */}
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs text-gray-500 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="font-medium">Real-time updates active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced gradient overlay for scroll indication */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-white/80 to-transparent opacity-60 z-10" />

      {/* Scroll indicator - only show when content exceeds visible area */}
      {!showAll && transactions.length > 15 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 transform items-center gap-1">
          <div className="h-1 w-8 animate-pulse rounded-full bg-blue-400/60" />
          <div
            className="h-1 w-4 animate-pulse rounded-full bg-blue-400/40"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="h-1 w-2 animate-pulse rounded-full bg-blue-400/20"
            style={{ animationDelay: "1s" }}
          />
        </div>
      )}

      {/* Enhanced floating action button - positioned relative to card */}
      {animationComplete && transactions.length > 0 && (
        <div className="absolute right-4 top-20 z-30">
          <Button
            size="sm"
            className={cn(
              "group h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300",
              "hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
              "focus:ring-2 focus:ring-blue-300/50"
            )}
            onClick={() => {
              // Scroll to top within the card content area
              const scrollContainer = timelineRef.current?.closest(".overflow-y-auto")
              scrollContainer?.scrollTo({
                top: 0,
                behavior: "smooth"
              })
            }}
          >
            <ArrowUp className="h-4 w-4 text-white transition-transform duration-300 group-hover:scale-110" />
          </Button>
        </div>
      )}
    </Card>
  )
})