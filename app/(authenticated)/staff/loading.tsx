import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function StaffLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="hidden h-10 w-28 rounded-lg sm:block" />
      </div>

      {/* Main Grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
        {/* Left Column */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Actions */}
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-28" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Target */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-green-200" />
                <Skeleton className="h-4 w-20 bg-green-200" />
              </div>
              <Skeleton className="h-7 w-32 bg-green-200" />
              <Skeleton className="h-3 w-24 bg-green-200" />
              <Skeleton className="h-2 w-full rounded-full bg-green-200" />
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {i < 4 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
