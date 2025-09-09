export const dynamic = "force-dynamic"

import { getCurrentUserProfile } from "@/actions/auth"
import { getStaffDashboardStats } from "@/actions/staff"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  Fuel,
  Package,
  BarChart3,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AnimatedCard } from "@/components/ui/animated-card"

export default async function StaffDashboard() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data

  // Get actual dashboard stats
  const statsResult = await getStaffDashboardStats()

  if (!statsResult.isSuccess || !statsResult.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Failed to load dashboard data</p>
            <p className="mt-2 text-sm text-slate-500">{statsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { todaysSales, recentTransactions } = statsResult.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-6 p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 font-semibold text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user.username}
              </h1>
              <div className="flex items-center space-x-2 text-slate-600">
                <span>{station.name}</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="secondary" className="text-xs">
                  Sales Staff
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Primary Action */}
        <AnimatedCard
          hoverEffect={true}
          className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="p-6">
            <Button
              asChild
              size="lg"
              className="h-16 w-full text-lg font-semibold"
            >
              <Link
                href="/staff/sales"
                className="flex items-center justify-center space-x-3"
              >
                <Plus className="h-6 w-6" />
                <span>Record New Sale</span>
              </Link>
            </Button>
          </div>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard hoverEffect={true}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Today's Sales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ₦{todaysSales.totalAmount.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-slate-500">Your sales today</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard hoverEffect={true}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Transactions
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {todaysSales.transactionCount}
              </div>
              <p className="mt-1 text-xs text-slate-500">Sales completed</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard hoverEffect={true}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                PMS Sales
              </CardTitle>
              <Fuel className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ₦{todaysSales.pmsSales.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {todaysSales.totalAmount > 0
                  ? Math.round(
                      (todaysSales.pmsSales / todaysSales.totalAmount) * 100
                    )
                  : 0}
                % of total sales
              </p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard hoverEffect={true}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Lubricant Sales
              </CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ₦{todaysSales.lubricantSales.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {todaysSales.totalAmount > 0
                  ? Math.round(
                      (todaysSales.lubricantSales / todaysSales.totalAmount) *
                        100
                    )
                  : 0}
                % of total sales
              </p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <AnimatedCard
            title="Recent Transactions"
            hoverEffect={true}
            className="lg:col-span-2"
          >
            <CardDescription className="mb-4">
              Your latest sales activity
            </CardDescription>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                <>
                  {recentTransactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-all hover:scale-[1.02] hover:bg-slate-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Fuel className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-slate-500">
                            {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ₦{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/staff/summary">View All Transactions</Link>
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p>No transactions yet today</p>
                  <p className="text-sm">Start by recording your first sale!</p>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Quick Actions */}
          <AnimatedCard title="Quick Actions" hoverEffect={true}>
            <CardDescription className="mb-4">
              Common tasks and shortcuts
            </CardDescription>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/staff/sales">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/staff/summary">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Daily Summary
                </Link>
              </Button>
              <Separator />
              <div className="pt-2">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Today's Performance
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Sales</span>
                    <span className="font-medium">
                      ₦{todaysSales.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transactions</span>
                    <span className="font-medium">
                      {todaysSales.transactionCount}
                    </span>
                  </div>
                  {todaysSales.transactionCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Avg. Sale</span>
                      <span className="font-medium">
                        ₦
                        {Math.round(
                          todaysSales.totalAmount / todaysSales.transactionCount
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
