"use client"

import { useState, useEffect } from "react"
import { useInventoryModalListener } from "@/hooks/use-inventory-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/products/product-form"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { StockMovementHistory } from "@/components/inventory/stock-movement-history"
import { SupplierManagement } from "@/components/inventory/supplier-management"
import { DeliveryForm } from "@/components/inventory/delivery-form"
import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form"
import { ReorderRecommendations } from "@/components/inventory/reorder-recommendations"
import { useStationAuth } from "@/hooks/use-station-auth"
import { deleteProduct } from "@/actions/products"
import {
  Package,
  History,
  Building2,
  ShoppingCart,
  TrendingUp,
  Settings,
  Plus,
  List
} from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  brand?: string | null
  type: "pms" | "lubricant"
  currentStock: number
  minThreshold: number
  unitPrice: number
  value: number
  unit: string
  isLowStock: boolean
  isOutOfStock: boolean
  supplier?: { id: string; name: string } | null
  stockStatus: "out_of_stock" | "low_stock" | "normal"
}

type DialogMode =
  | "add-product"
  | "edit-product"
  | "adjust-stock"
  | "record-delivery"
  | "view-product"
  | "delete-product"
  | null

export default function InventoryPage() {
  const { user, station } = useStationAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  )
  const [refreshKey, setRefreshKey] = useState(0)

  // Listen for add product modal events from sidebar
  useInventoryModalListener(() => {
    setDialogMode("add-product")
  })

  const handleViewProduct = (product: InventoryItem) => {
    setSelectedProduct(product)
    setDialogMode("view-product")
  }

  const handleAdjustStock = (product: InventoryItem) => {
    setSelectedProduct(product)
    setDialogMode("adjust-stock")
  }

  const handleRecordDelivery = (product: InventoryItem) => {
    setSelectedProduct(product)
    setDialogMode("record-delivery")
  }

  const handleRecordDeliveryById = (productId: string) => {
    // This would need to fetch the product details by ID
    // For now, we'll just close any open dialogs and switch to dashboard
    setDialogMode(null)
    setActiveTab("dashboard")
    setRefreshKey(prev => prev + 1)
  }

  const handleSuccess = () => {
    setDialogMode(null)
    setSelectedProduct(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteProduct = (product: InventoryItem) => {
    setSelectedProduct(product)
    setDialogMode("delete-product")
  }

  const handleCancel = () => {
    setDialogMode(null)
    setSelectedProduct(null)
  }

  if (!station) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Loading station information...
          </p>
        </div>
      </div>
    )
  }

  if (user?.role !== "manager") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Access restricted to managers only
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive inventory management for your station
          </p>
        </div>
        <Button onClick={() => setDialogMode("add-product")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="all-products" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Products
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Reorder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <InventoryDashboard
            key={refreshKey}
            stationId={station.id}
            onViewProduct={handleViewProduct}
            onAdjustStock={handleAdjustStock}
            onRecordDelivery={handleRecordDelivery}
            onDeleteProduct={handleDeleteProduct}
          />
        </TabsContent>

        <TabsContent value="all-products" className="space-y-6">
          <InventoryDashboard
            key={refreshKey}
            stationId={station.id}
            onViewProduct={handleViewProduct}
            onAdjustStock={handleAdjustStock}
            onRecordDelivery={handleRecordDelivery}
            onDeleteProduct={handleDeleteProduct}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <StockMovementHistory stationId={station.id} />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierManagement stationId={station.id} />
        </TabsContent>

        <TabsContent value="reorder" className="space-y-6">
          <ReorderRecommendations
            stationId={station.id}
            onRecordDelivery={handleRecordDeliveryById}
          />
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={dialogMode === "add-product"} onOpenChange={handleCancel}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            stationId={station.id}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={dialogMode === "adjust-stock"} onOpenChange={handleCancel}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Stock Adjustment
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <StockAdjustmentForm
              product={selectedProduct}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Record Delivery Dialog */}
      <Dialog
        open={dialogMode === "record-delivery"}
        onOpenChange={handleCancel}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Record Delivery
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <DeliveryForm
              product={selectedProduct}
              stationId={station.id}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={dialogMode === "delete-product"} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (selectedProduct) {
                  try {
                    const result = await deleteProduct(selectedProduct.id)
                    if (result.isSuccess) {
                      handleSuccess()
                    } else {
                      console.error("Failed to delete product:", result.error)
                    }
                  } catch (error) {
                    console.error("Error deleting product:", error)
                  }
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
