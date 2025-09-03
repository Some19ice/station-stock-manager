"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { updateStock } from "@/actions/products"
import { SelectProduct } from "@/db/schema"
import { toast } from "sonner"
import { Package, Plus, Minus, RotateCcw } from "lucide-react"

const stockAdjustmentSchema = z.object({
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  movementType: z.enum(["adjustment", "delivery"]),
  reference: z.string().optional()
})

type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>

interface StockAdjustmentProps {
  product: SelectProduct
  onSuccess?: () => void
  onCancel?: () => void
}

export function StockAdjustment({
  product,
  onSuccess,
  onCancel
}: StockAdjustmentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase"
  )

  const form = useForm<StockAdjustmentData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 0,
      movementType: "adjustment",
      reference: ""
    }
  })

  const currentStock = parseFloat(product.currentStock)
  const quantity = form.watch("quantity") || 0
  const finalQuantity = adjustmentType === "increase" ? quantity : -quantity
  const newStock = currentStock + finalQuantity

  const onSubmit = async (data: StockAdjustmentData) => {
    setIsSubmitting(true)

    try {
      const result = await updateStock({
        productId: product.id,
        quantity:
          adjustmentType === "increase" ? data.quantity : -data.quantity,
        movementType: data.movementType,
        reference: data.reference
      })

      if (result.isSuccess) {
        toast.success("Stock updated successfully")
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(parseFloat(amount))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Adjustment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Product Info */}
        <div className="bg-muted mb-6 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              {product.brand && (
                <p className="text-muted-foreground text-sm">{product.brand}</p>
              )}
              {product.viscosity && (
                <p className="text-muted-foreground text-sm">
                  {product.viscosity}{" "}
                  {product.containerSize && `• ${product.containerSize}`}
                </p>
              )}
            </div>
            <Badge variant="outline">
              {product.type === "pms" ? "PMS" : "Lubricant"}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Stock:</span>
              <p className="font-medium">
                {currentStock.toLocaleString()} {product.unit}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Unit Price:</span>
              <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustmentType === "increase" ? "default" : "outline"}
                onClick={() => setAdjustmentType("increase")}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Increase Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "decrease" ? "default" : "outline"}
                onClick={() => setAdjustmentType("decrease")}
                className="flex-1"
              >
                <Minus className="mr-2 h-4 w-4" />
                Decrease Stock
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({product.unit}) *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              {...form.register("quantity", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-red-500">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          {/* Movement Type */}
          <div className="space-y-2">
            <Label htmlFor="movementType">Reason *</Label>
            <Select
              value={form.watch("movementType")}
              onValueChange={value =>
                form.setValue(
                  "movementType",
                  value as "adjustment" | "delivery"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                <SelectItem value="delivery">New Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference/Notes</Label>
            <Textarea
              id="reference"
              {...form.register("reference")}
              placeholder="Optional reference or notes for this adjustment"
              rows={3}
            />
          </div>

          {/* Stock Preview */}
          {quantity > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-medium">Stock Preview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current:</span>
                  <p className="font-medium">
                    {currentStock.toLocaleString()} {product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {adjustmentType === "increase" ? "Adding:" : "Removing:"}
                  </span>
                  <p
                    className={`font-medium ${adjustmentType === "increase" ? "text-green-600" : "text-red-600"}`}
                  >
                    {adjustmentType === "increase" ? "+" : "-"}
                    {quantity.toLocaleString()} {product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">New Total:</span>
                  <p
                    className={`font-medium ${newStock < 0 ? "text-red-600" : ""}`}
                  >
                    {newStock.toLocaleString()} {product.unit}
                  </p>
                </div>
              </div>

              {newStock < 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Warning: This adjustment would result in negative stock.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || newStock < 0 || quantity <= 0}
            >
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
