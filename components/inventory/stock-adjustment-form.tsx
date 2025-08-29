"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recordStockAdjustment } from "@/actions/inventory"
import { Settings, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  brand?: string
  type: "pms" | "lubricant"
  currentStock: number
  unitPrice: number
  unit: string
  minThreshold: number
}

interface StockAdjustmentFormProps {
  product: Product
  onSuccess: () => void
  onCancel: () => void
}

const adjustmentReasons = [
  { value: "damage", label: "Damaged goods" },
  { value: "theft", label: "Theft/Loss" },
  { value: "spillage", label: "Spillage" },
  { value: "evaporation", label: "Evaporation" },
  { value: "counting_error", label: "Counting error" },
  { value: "system_correction", label: "System correction" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "expired", label: "Expired product" },
  { value: "other", label: "Other" }
]

export function StockAdjustmentForm({ product, onSuccess, onCancel }: StockAdjustmentFormProps) {
  const [formData, setFormData] = useState({
    adjustmentType: "decrease" as "increase" | "decrease",
    quantity: "",
    reason: "",
    customReason: "",
    reference: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    if (!formData.reason) {
      toast.error("Please select a reason for the adjustment")
      return
    }

    if (formData.reason === "other" && !formData.customReason.trim()) {
      toast.error("Please provide a custom reason")
      return
    }

    const adjustmentQuantity = parseFloat(formData.quantity)
    const finalQuantity = formData.adjustmentType === "decrease" ? -adjustmentQuantity : adjustmentQuantity
    const newStock = product.currentStock + finalQuantity

    if (newStock < 0) {
      toast.error("Adjustment would result in negative stock")
      return
    }

    setSubmitting(true)

    try {
      const reason = formData.reason === "other" ? formData.customReason : 
                    adjustmentReasons.find(r => r.value === formData.reason)?.label || formData.reason

      const result = await recordStockAdjustment({
        productId: product.id,
        quantity: finalQuantity,
        reason,
        reference: formData.reference || undefined
      })

      if (result.isSuccess) {
        toast.success("Stock adjustment recorded successfully")
        onSuccess()
      } else {
        toast.error(result.error || "Failed to record adjustment")
      }
    } catch (error) {
      console.error("Error recording stock adjustment:", error)
      toast.error("An error occurred while recording adjustment")
    } finally {
      setSubmitting(false)
    }
  }

  const quantity = parseFloat(formData.quantity) || 0
  const finalQuantity = formData.adjustmentType === "decrease" ? -quantity : quantity
  const newStock = product.currentStock + finalQuantity
  const valueImpact = Math.abs(finalQuantity) * product.unitPrice

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
            <span>{product.name} {product.brand && `(${product.brand})`}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Stock:</span>
            <span>{product.currentStock} {product.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Minimum Threshold:</span>
            <span>{product.minThreshold} {product.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Unit Price:</span>
            <span>{formatCurrency(product.unitPrice)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Adjustment Type</Label>
          <Select 
            value={formData.adjustmentType} 
            onValueChange={(value: "increase" | "decrease") => setFormData({ ...formData, adjustmentType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="increase">Increase Stock</SelectItem>
              <SelectItem value="decrease">Decrease Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
            />
            <div className="flex items-center px-3 border rounded-md bg-muted">
              <span className="text-sm text-muted-foreground">{product.unit}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reason for adjustment" />
            </SelectTrigger>
            <SelectContent>
              {adjustmentReasons.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.reason === "other" && (
          <div className="space-y-2">
            <Label htmlFor="customReason">Custom Reason *</Label>
            <Input
              id="customReason"
              value={formData.customReason}
              onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
              placeholder="Describe the reason for adjustment"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reference">Reference (optional)</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Reference number, document ID, etc."
          />
        </div>
      </div>

      {/* Adjustment Preview */}
      {quantity > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Adjustment Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Current Stock:</span>
              <span>{product.currentStock} {product.unit}</span>
            </div>
            <div className="flex justify-between">
              <span>Adjustment:</span>
              <span className={finalQuantity >= 0 ? "text-green-600" : "text-red-600"}>
                {finalQuantity >= 0 ? "+" : ""}{finalQuantity} {product.unit}
              </span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>New Stock Level:</span>
              <span className={newStock < product.minThreshold ? "text-yellow-600" : ""}>
                {newStock} {product.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Value Impact:</span>
              <span className={finalQuantity >= 0 ? "text-green-600" : "text-red-600"}>
                {finalQuantity >= 0 ? "+" : "-"}{formatCurrency(valueImpact)}
              </span>
            </div>
            
            {newStock < product.minThreshold && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded mt-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Warning: New stock level will be below minimum threshold ({product.minThreshold} {product.unit})
                </span>
              </div>
            )}

            {newStock === 0 && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded mt-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Warning: This adjustment will result in zero stock
                </span>
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
        <Button 
          type="submit" 
          disabled={submitting || !formData.quantity || !formData.reason}
          variant={newStock < 0 ? "destructive" : "default"}
        >
          {submitting ? "Recording..." : "Record Adjustment"}
        </Button>
      </div>
    </form>
  )
}