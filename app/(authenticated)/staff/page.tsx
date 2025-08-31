export const dynamic = "force-dynamic"

import { getCurrentUserProfile } from "@/actions/auth"
import { PrimaryActionButton } from "@/components/dashboard/primary-action-button"
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar"
import { FrequentlySoldProducts } from "@/components/dashboard/frequently-sold-products"
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"

export default async function StaffDashboard() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.username}
          </h1>
          <p className="mt-1 text-gray-600">{station.name} • Sales Staff</p>
        </div>

        {/* Primary Action Button */}
        <PrimaryActionButton />

        {/* Quick Stats Bar */}
        <QuickStatsBar />

        {/* Frequently Sold Products */}
        <FrequentlySoldProducts />

        {/* Recent Activity Feed */}
        <RecentActivityFeed />
      </main>
    </div>
  )
}
