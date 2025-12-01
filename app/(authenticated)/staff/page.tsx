export const dynamic = "force-dynamic"

import { getCurrentUserProfile } from "@/actions/auth"
import { getStaffDashboardStats } from "@/actions/staff"
import { Card, CardContent } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { StaffDashboardContent } from "@/components/dashboard/staff-dashboard-content"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getShiftProgress(): { progress: number; hoursLeft: number } {
  const now = new Date()
  const hour = now.getHours()
  const shiftStart = hour < 14 ? 6 : hour < 22 ? 14 : 22
  const hoursWorked = (hour - shiftStart + 24) % 24
  const progress = Math.min((hoursWorked / 8) * 100, 100)
  const hoursLeft = Math.max(8 - hoursWorked, 0)
  return { progress, hoursLeft }
}

export default async function StaffDashboard() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data
  const statsResult = await getStaffDashboardStats()

  if (!statsResult.isSuccess || !statsResult.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
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
  const { progress: shiftProgress, hoursLeft } = getShiftProgress()
  const dailyTarget = 500000
  const targetProgress = Math.min((todaysSales.totalAmount / dailyTarget) * 100, 100)

  return (
    <StaffDashboardContent
      user={user}
      station={station}
      todaysSales={todaysSales}
      recentTransactions={recentTransactions}
      greeting={getGreeting()}
      shiftProgress={shiftProgress}
      hoursLeft={hoursLeft}
      dailyTarget={dailyTarget}
      targetProgress={targetProgress}
    />
  )
}
