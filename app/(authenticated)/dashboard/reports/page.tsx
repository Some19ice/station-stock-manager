import { validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ReportsPage() {
  // Verify user is a manager
  const roleCheck = await validateUserRole("manager")
  
  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          This feature will be implemented in task 6
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Reports</CardTitle>
          <CardDescription>
            Comprehensive reporting system coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Available reports will include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Daily sales reports</li>
            <li>Staff performance reports</li>
            <li>Inventory reports</li>
            <li>Weekly and monthly summaries</li>
            <li>Low stock alerts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}