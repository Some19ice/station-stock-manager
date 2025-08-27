"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductList } from "@/components/products/product-list"
import { ProductForm } from "@/components/products/product-form"
import { StockAdjustment } from "@/components/products/stock-adjustment"
import { SelectProduct } from "@/db/schema"
import { Package, Plus, Settings } from "lucide-react"
import { useStationAuth } from "@/hooks/use-station-auth"

type DialogMode = "add" | "edit" | "adjust" | null

export default function InventoryPage() {
  const { user, station } = useStationAuth()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedProduct, setSelectedProduct] = useState<SelectProduct | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setDialogMode("add")
  }

  const handleEditProduct = (product: SelectProduct) => {
    setSelectedProduct(product)
    setDialogMode("edit")
  }

  const handleAdjustStock = (product: SelectProduct) => {
    setSelectedProduct(product)
    setDialogMode("adjust")
  }

  const handleSuccess = () => {
    setDialogMode(null)
    setSelectedProduct(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleCancel = () => {
    setDialogMode(null)
    setSelectedProduct(null)
  }

  if (!station) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Loading station information...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your station's product inventory and stock levels
          </p>
        </div>
        
        {user?.role === "manager" && (
          <div className="flex gap-2">
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      <ProductList
        key={refreshKey}
        stationId={station.id}
        onEditProduct={user?.role === "manager" ? handleEditProduct : undefined}
        onAddProduct={user?.role === "manager" ? handleAddProduct : undefined}
        onAdjustStock={user?.role === "manager" ? handleAdjustStock : undefined}
      />

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogMode === "add" || dialogMode === "edit"} onOpenChange={handleCancel}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Add New Product" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            stationId={station.id}
            product={selectedProduct || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={dialogMode === "adjust"} onOpenChange={handleCancel}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <StockAdjustment
              product={selectedProduct}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}