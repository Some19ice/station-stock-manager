export const dynamic = "force-dynamic"

import { getCurrentUserProfile } from "@/actions/auth"
import { getTodaysSalesSummary } from "@/actions/sales"
import { redirect } from "next/navigation"
import { StaffSummaryContent } from "@/components/dashboard/staff-summary-content"

export default async function StaffSummaryPage() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data

  const summaryResult = await getTodaysSalesSummary(station.id, user.id)

  const summary = summaryResult.isSuccess && summaryResult.data
    ? summaryResult.data
    : {
        date: new Date().toISOString().split("T")[0],
        totalTransactions: 0,
        totalAmount: 0,
        productTypeSummary: {},
        topProducts: [],
        transactions: []
      }

  return (
    <StaffSummaryContent
      user={user}
      station={station}
      summary={summary}
    />
  )
}
