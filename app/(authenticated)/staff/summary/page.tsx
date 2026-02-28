export const dynamic = "force-dynamic"

import { getCurrentUserProfile } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ShiftHistory } from "@/components/staff/shift-history"

export default async function StaffSummaryPage() {
  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { station } = userProfile.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-6 p-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/staff" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Shift History
          </h1>
          <p className="mt-1 text-slate-600">
            Your shift records, sales totals, and cash reconciliation
          </p>
        </div>

        <ShiftHistory stationId={station.id} />
      </div>
    </div>
  )
}
