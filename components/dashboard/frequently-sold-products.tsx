"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, AlertTriangle } from "lucide-react"

interface FrequentProduct {
  productId: string
  product: {
    id: string
    name: string
    type: "pms" | "lubricant"
    unit: string
    unitPrice: string
    currentStock: string
    minThreshold: string
    isActive: boolean
  }
  totalQuantity: number
  totalTransactions: number
  totalAmount: number
}

interface FrequentlySoldProductsProps {
  className?: string
  limit?: number
}

export const FrequentlySoldProducts: React.FC<FrequentlySoldProductsProps> = ({
  className = "",
  limit = 6
}) => {
  const [products, setProducts] = useState<FrequentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFrequentProducts = async () => {
      try {
        // TODO: Replace with actual API call to getFrequentlysoldProducts
        // For now, using mock data
        const mockProducts: FrequentProduct[] = [
          {
            productId: "1",
            product: {
              id: "1",
              name: "PMS Premium",
              type: "pms",
              unit: "liters",
              unitPrice: "650.00",
              currentStock: "1500.00",
              minThreshold: "500.00",
              isActive: true
            },
            totalQuantity: 450,
            totalTransactions: 25,
            totalAmount: 292500
          },
          {
            productId: "2",
            product: {
              id: "2",
              name: "Engine Oil 5W-30",
              type: "lubricant",
              unit: "bottles",
              unitPrice: "1200.00",
              currentStock: "85.00",
              minThreshold: "20.00",
              isActive: true
            },
            totalQuantity: 180,
            totalTransactions: 18,
            totalAmount: 216000
          },
          {
            productId: "3",
            product: {
              id: "3",
              name: "Diesel",
              type: "pms",
              unit: "liters",
              unitPrice: "580.00",
              currentStock: "3200.00",
              minThreshold: "1000.00",
              isActive: true
            },
            totalQuantity: 320,
            totalTransactions: 15,
            totalAmount: 185600
          },
          {
            productId: "4",
            product: {
              id: "4",
              name: "Brake Fluid",
              type: "lubricant",
              unit: "bottles",
              unitPrice: "800.00",
              currentStock: "12.00",
              minThreshold: "15.00",
              isActive: true
            },
            totalQuantity: 95,
            totalTransactions: 12,
            totalAmount: 76000
          }
        ]

        setProducts(mockProducts.slice(0, limit))
        setLoading(false)
      } catch (err) {
        setError("Failed to load frequently sold products")
        setLoading(false)
      }
    }

    fetchFrequentProducts()
  }, [limit])

  const getStockLevel = (product: FrequentProduct["product"]) => {
    const currentStock = parseFloat(product.currentStock)
    const minThreshold = parseFloat(product.minThreshold)

    if (currentStock <= minThreshold && currentStock > 0) {
      return "low"
    } else if (currentStock === 0) {
      return "out"
    } else {
      return "normal"
    }
  }

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case "low":
        return "text-yellow-600"
      case "out":
        return "text-red-600"
      default:
        return "text-green-600"
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  const handleSellProduct = (product: FrequentProduct["product"]) => {
    // TODO: Implement quick sell functionality
    console.log("Sell product:", product.name)
  }

  if (loading) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Frequently Sold
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="mb-3 h-8 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || products.length === 0) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Frequently Sold
        </h3>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground">
                {error || "No frequently sold products found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Frequently Sold
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.map(item => {
          const stockLevel = getStockLevel(item.product)
          const stockColor = getStockColor(stockLevel)

          return (
            <Card
              key={item.productId}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {item.product.type === "pms" ? "PMS" : "Lubricant"}
                  </Badge>
                  {stockLevel !== "normal" && (
                    <AlertTriangle className={`h-4 w-4 ${stockColor}`} />
                  )}
                </div>

                <h4 className="mb-1 truncate text-sm font-medium text-gray-900">
                  {item.product.name}
                </h4>

                <p className="mb-2 text-lg font-bold text-gray-900">
                  {formatCurrency(item.product.unitPrice)}
                </p>

                <div className="mb-3 text-xs text-gray-600">
                  <span className={stockColor}>
                    {parseFloat(item.product.currentStock).toLocaleString()}{" "}
                    {item.product.unit}
                  </span>
                  <span className="text-gray-400"> • </span>
                  <span>{item.totalTransactions} sales</span>
                </div>

                <Button
                  onClick={() => handleSellProduct(item.product)}
                  className="w-full py-2 text-sm"
                  size="sm"
                  disabled={stockLevel === "out"}
                >
                  Sell This
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
