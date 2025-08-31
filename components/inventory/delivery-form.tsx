"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recordDelivery } from "@/actions/inventory"
import { getSuppliers } from "@/actions/suppliers"
import { Truck, Package } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  brand?: string | null
  type: "pms" | "lubricant"
  currentStock: number
  unitPrice: number
  unit: string
}

interface Supplier {
  id: string
  name: string
  contactPerson?: string | null
  phone?: string | null
}

interface DeliveryFormProps {
  product: Product
  stationId: string
  onSuccess: () => void
  onCancel: () => void
}

export function DeliveryForm({
  product,
  stationId,
  onSuccess,
  onCancel
}: DeliveryFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    quantity: "",
    supplierId: "",
    deliveryNote: "",
    unitCost: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const result = await getSuppliers({ stationId })
        if (result.isSuccess && result.data) {
          setSuppliers(result.data)
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      } finally {
        setLoadingSuppliers(false)
      }
    }

    fetchSuppliers()
  }, [stationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    setSubmitting(true)

    try {
      const deliveryData = {
        productId: product.id,
        quantity: parseFloat(formData.quantity),
        deliveryNote: formData.deliveryNote || undefined,
        supplierId: formData.supplierId || undefined,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined
      }

      const result = await recordDelivery(deliveryData)

      if (result.isSuccess) {
        toast.success("Delivery recorded successfully")
        onSuccess()
      } else {
        toast.error(result.error || "Failed to record delivery")
      }
    } catch (error) {
      console.error("Error recording delivery:", error)
      toast.error("An error occurred while recording delivery")
    } finally {
      setSubmitting(false)
    }
  }

  const quantity = parseFloat(formData.quantity) || 0
  const unitCost = parseFloat(formData.unitCost) || product.unitPrice
  const totalCost = quantity * unitCost
  const newStock = product.currentStock + quantity

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Product:</span>
            <span>
              {product.name} {product.brand && `(${product.brand})`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Stock:</span>
            <span>
              {product.currentStock} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Unit Price:</span>
            <span>{formatCurrency(product.unitPrice)}</span>
          </div>
          {quantity > 0 && (
            <div className="flex justify-between font-medium text-green-600">
              <span>New Stock Level:</span>
              <span>
                {newStock} {product.unit}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Delivery Quantity *</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.quantity}
              onChange={e =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="Enter quantity"
              required
            />
            <div className="bg-muted flex items-center rounded-md border px-3">
              <span className="text-muted-foreground text-sm">
                {product.unit}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          {loadingSuppliers ? (
            <div className="bg-muted h-10 animate-pulse rounded" />
          ) : (
            <Select
              value={formData.supplierId}
              onValueChange={value =>
                setFormData({ ...formData, supplierId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-supplier">No supplier selected</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                    {supplier.contactPerson && ` (${supplier.contactPerson})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="unitCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitCost}
              onChange={e =>
                setFormData({ ...formData, unitCost: e.target.value })
              }
              placeholder={`Current: ${formatCurrency(product.unitPrice)}`}
            />
            <div className="bg-muted flex items-center rounded-md border px-3">
              <span className="text-muted-foreground text-sm">₦</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Leave empty to keep current price. Enter new cost to update product
            price.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryNote">Delivery Note</Label>
          <Textarea
            id="deliveryNote"
            value={formData.deliveryNote}
            onChange={e =>
              setFormData({ ...formData, deliveryNote: e.target.value })
            }
            placeholder="Optional delivery notes, invoice number, etc."
            rows={3}
          />
        </div>
      </div>

      {/* Cost Summary */}
      {quantity > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>
                {quantity} {product.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Unit Cost:</span>
              <span>{formatCurrency(unitCost)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-medium">
              <span>Total Cost:</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            {formData.unitCost &&
              parseFloat(formData.unitCost) !== product.unitPrice && (
                <div className="rounded bg-blue-50 p-2 text-sm text-blue-600">
                  <strong>Note:</strong> Product price will be updated from{" "}
                  {formatCurrency(product.unitPrice)} to{" "}
                  {formatCurrency(unitCost)}
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !formData.quantity}>
          {submitting ? "Recording..." : "Record Delivery"}
        </Button>
      </div>
    </form>
  )
}
