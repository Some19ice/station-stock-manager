import { getCurrentUserProfile } from "@/actions/auth"
import { getRecentTransactions } from "@/actions/dashboard"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, History, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const recentResult = await getRecentTransactions(5)
  const recentTransactions = recentResult.isSuccess ? recentResult.data : []

  const todayTotal = recentTransactions?.reduce(
    (sum, t) => sum + parseFloat(t.totalAmount),
    0
  ) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales & Transactions</h1>
        <Button asChild>
          <Link href="/staff/sales">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Record New Sale
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{todayTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {recentTransactions?.length || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link href="/staff/sales">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ShoppingCart className="h-4 w-4" />
                Record Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create a new sales transaction
              </p>
              <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link href="/dashboard/sales/history">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all past transactions
              </p>
              <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {recentTransactions && recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{tx.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.itemCount} item{tx.itemCount !== 1 ? "s" : ""} •{" "}
                      {new Date(tx.transactionDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right font-semibold">
                    ₦{parseFloat(tx.totalAmount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/dashboard/sales/history">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
