"use client"

import { useState, useEffect } from "react"
import { getSalesHistory } from "@/actions/sales"
import { getCurrentUserProfile } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { History, Search, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { LoadingScreen } from "@/components/ui/loading-screen"

interface Transaction {
  id: string
  totalAmount: string
  transactionDate: Date
  syncStatus: string
  items: Array<{
    id: string
    quantity: string
    totalPrice: string
    product: {
      name: string
      type: string
      unit: string
    }
  }>
}

export default function SalesHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stationId, setStationId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileResult = await getCurrentUserProfile()
      if (!profileResult.isSuccess || !profileResult.data) return

      setStationId(profileResult.data.station.id)

      const result = await getSalesHistory({
        stationId: profileResult.data.station.id,
        limit: 100
      })

      if (result.isSuccess && result.data) {
        setTransactions(result.data)
      }
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx =>
    tx.items?.some(item =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading) {
    return <LoadingScreen title="Transaction History" subtitle="Loading transactions..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View all past sales transactions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              All Transactions
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try a different search term"
                  : "Start recording sales to see them here"}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/staff/sales">Record First Sale</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(tx.transactionDate).toLocaleDateString()}
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {tx.items?.slice(0, 2).map(item => (
                          <div key={item.id} className="text-sm">
                            {item.product.name} × {parseFloat(item.quantity)}
                          </div>
                        ))}
                        {tx.items?.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{tx.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦{parseFloat(tx.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.syncStatus === "synced" ? "default" : "secondary"
                        }
                      >
                        {tx.syncStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
