import { getCurrentUserProfile } from "@/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, BarChart3, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StaffDashboard() {
  const userProfile = await getCurrentUserProfile()
  
  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user, station } = userProfile.data

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome, {user.username}
        </h1>
        <p className="text-gray-600 mt-2">
          {station.name} - Sales Staff Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Record Sale Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Record Sale
            </CardTitle>
            <CardDescription>
              Record customer transactions quickly and easily
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/staff/sales">
                Start Recording Sales
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Daily Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Summary
            </CardTitle>
            <CardDescription>
              View your sales performance for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/staff/summary">
                View Summary
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              View your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-medium">Station:</span> {station.name}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                  {user.isActive ? " Active" : " Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}