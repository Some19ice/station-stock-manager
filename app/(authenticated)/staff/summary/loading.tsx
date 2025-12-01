import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function StaffSummaryLoading() {
  return (
    <div className="flex h-screen flex-col gap-4 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-l-4 border-l-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {/* Transactions */}
        <Card className="lg:col-span-2 overflow-hidden rounded-2xl">
          <div className="bg-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40 bg-slate-300" />
              <Skeleton className="h-5 w-16 rounded-full bg-slate-300" />
            </div>
          </div>
          <CardContent className="space-y-2 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
