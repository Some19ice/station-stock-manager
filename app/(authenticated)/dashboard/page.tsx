import {
  getDashboardMetrics,
  getLowStockAlerts,
  getRecentTransactions,
  type DashboardMetrics,
  type LowStockAlert
} from "@/actions/dashboard"
import { getCurrentUserProfile } from "@/actions/auth"
import DashboardClient from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [userProfileResult, metricsResult, alertsResult, activitiesResult] =
    await Promise.all([
      getCurrentUserProfile(),
      getDashboardMetrics(),
      getLowStockAlerts(),
      getRecentTransactions(50)
    ])

  const userProfile =
    userProfileResult.isSuccess && userProfileResult.data
      ? userProfileResult.data
      : null

  const metrics =
    metricsResult.isSuccess && metricsResult.data
      ? (metricsResult.data as DashboardMetrics)
      : null

  const alerts =
    alertsResult.isSuccess && alertsResult.data
      ? (alertsResult.data as LowStockAlert[])
      : null

  const activities =
    activitiesResult.isSuccess && activitiesResult.data
      ? activitiesResult.data
      : null

  return (
    <DashboardClient
      initialMetrics={metrics}
      initialAlerts={alerts}
      initialActivities={activities}
      initialUserProfile={userProfile}
    />
  )
}
