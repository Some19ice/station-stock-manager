import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StaffSummaryPage() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/staff" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Daily Summary</h1>
        <p className="text-gray-600 mt-2">
          Personal sales summary will be implemented in task 6
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Sales Summary</CardTitle>
          <CardDescription>
            This feature will be implemented in the reporting phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your daily summary will include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Total sales value for today</li>
            <li>Number of transactions completed</li>
            <li>Top products sold</li>
            <li>Performance compared to previous days</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}