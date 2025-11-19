export const dynamic = "force-dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle } from "lucide-react"

export default function DirectorInventoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Overview</h1>
        <p className="text-muted-foreground">Read-only view of inventory across all stations</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Stock Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">Premium Gasoline</p>
                  <p className="text-sm text-muted-foreground">Station A</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">1,250 L</p>
                  <Badge variant="default">Normal</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">Diesel</p>
                  <p className="text-sm text-muted-foreground">Station A</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">450 L</p>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
