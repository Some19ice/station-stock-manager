export const dynamic = "force-dynamic"

import { validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"
import { ReportsInterface } from "@/components/reports/reports-interface"
import { AnimatedPage } from "@/components/ui/animated-page"

export default async function ReportsPage() {
  // Verify user is a manager
  const roleCheck = await validateUserRole("manager")

  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  return (
    <AnimatedPage animation="slideUp" className="space-y-6">
      <div className="reports-header">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate comprehensive business reports and analytics
        </p>
      </div>

      <div className="reports-content">
        <ReportsInterface />
      </div>
    </AnimatedPage>
  )
}
