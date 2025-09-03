"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  AlertTriangle,
  Edit,
  Package,
  Search,
  Trash2,
  Settings
} from "lucide-react"
import { getProducts, deleteProduct } from "@/actions/products"
import { SelectProduct } from "@/db/schema"
import { InventoryItem } from "@/lib/types/station-stock"
import { toast } from "sonner"

// Helper function to transform SelectProduct to InventoryItem
function transformToInventoryItem(product: SelectProduct): InventoryItem {
  const currentStock = parseFloat(product.currentStock)
  const minThreshold = parseFloat(product.minThreshold)
  const unitPrice = parseFloat(product.unitPrice)
  const value = currentStock * unitPrice

  const isLowStock = currentStock <= minThreshold
  const isOutOfStock = currentStock === 0

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    type: product.type,
    currentStock,
    minThreshold,
    unitPrice,
    value,
    unit: product.unit,
    isLowStock,
    isOutOfStock,
    supplier: null, // ProductList doesn't load supplier data
    stockStatus: isOutOfStock
      ? "out_of_stock"
      : isLowStock
        ? "low_stock"
        : "normal"
  }
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

interface ProductListProps {
  stationId: string
  onEditProduct?: (product: SelectProduct) => void
  onAddProduct?: () => void
  onAdjustStock?: (product: InventoryItem) => void
}

export function ProductList({
  stationId,
  onEditProduct,
  onAddProduct,
  onAdjustStock
}: ProductListProps) {
  const [products, setProducts] = useState<SelectProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<SelectProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "pms" | "lubricant">(
    "all"
  )
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all")

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const result = await getProducts(stationId)

    if (result.isSuccess && result.data) {
      setProducts(result.data)
      setFilteredProducts(result.data)
    } else {
      toast.error(result.error || "Failed to load products")
    }
    setLoading(false)
  }, [stationId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(product => product.type === typeFilter)
    }

    // Filter by stock level
    if (stockFilter === "low") {
      filtered = filtered.filter(product => {
        const currentStock = parseFloat(product.currentStock)
        const minThreshold = parseFloat(product.minThreshold)
        return currentStock <= minThreshold && currentStock > 0
      })
    } else if (stockFilter === "out") {
      filtered = filtered.filter(
        product => parseFloat(product.currentStock) === 0
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, typeFilter, stockFilter])

  const handleDeleteProduct = async (productId: string) => {
    const result = await deleteProduct(productId)

    if (result.isSuccess) {
      toast.success("Product deleted successfully")
      loadProducts()
    } else {
      toast.error(result.error)
    }
  }

  const getStockStatus = (product: SelectProduct) => {
    const currentStock = parseFloat(product.currentStock)
    const minThreshold = parseFloat(product.minThreshold)

    if (currentStock === 0) {
      return {
        status: "out",
        label: "Out of Stock",
        variant: "destructive" as const
      }
    } else if (currentStock <= minThreshold) {
      return {
        status: "low",
        label: "Low Stock",
        variant: "secondary" as const
      }
    } else {
      return {
        status: "normal",
        label: "In Stock",
        variant: "default" as const
      }
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          {onAddProduct && (
            <Button onClick={onAddProduct}>
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={value =>
              setTypeFilter(value as "all" | "pms" | "lubricant")
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pms">PMS</SelectItem>
              <SelectItem value="lubricant">Lubricants</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={stockFilter}
            onValueChange={value =>
              setStockFilter(value as "all" | "low" | "out")
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0
                ? "Get started by adding your first product."
                : "Try adjusting your search or filters."}
            </p>
            {onAddProduct && products.length === 0 && (
              <Button onClick={onAddProduct}>
                <Package className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.brand && (
                            <div className="text-muted-foreground text-sm">
                              {product.brand}
                            </div>
                          )}
                          {product.viscosity && (
                            <div className="text-muted-foreground text-sm">
                              {product.viscosity}{" "}
                              {product.containerSize &&
                                `• ${product.containerSize}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.type === "pms" ? "PMS" : "Lubricant"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {stockStatus.status === "low" && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          {stockStatus.status === "out" && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {parseFloat(product.currentStock).toLocaleString()}{" "}
                            {product.unit}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Min:{" "}
                          {parseFloat(product.minThreshold).toLocaleString()}{" "}
                          {product.unit}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onAdjustStock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onAdjustStock(transformToInventoryItem(product))
                              }
                              title="Adjust Stock"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}

                          {onEditProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduct(product)}
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
