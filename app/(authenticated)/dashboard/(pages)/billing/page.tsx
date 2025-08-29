import { AlertCircle, CreditCard } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <CreditCard className="text-muted-foreground h-8 w-8" />
          Billing
        </h1>
        <p className="text-muted-foreground">
          Billing and subscription management
        </p>
      </div>

      {/* Disabled Notice */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Billing features are currently disabled. This application does not
          require a subscription at this time.
        </AlertDescription>
      </Alert>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your current account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan:</span>
            <span className="text-muted-foreground text-sm">
              Free (Full Access)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Features:</span>
            <span className="text-muted-foreground text-sm">
              All features included
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Contact support if you have any questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            If you need assistance with your account or have questions about
            features, please contact your system administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
