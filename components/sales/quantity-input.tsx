"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Plus, Minus } from "lucide-react"

interface Product {
  id: string
  name: string
  brand?: string
  type: "pms" | "lubricant"
  currentStock: string
  unitPrice: string
  unit: string
}

interface QuantityInputProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
}

export function QuantityInput({
  product,
  isOpen,
  onClose,
  onConfirm
}: QuantityInputProps) {
  const [quantity, setQuantity] = useState(1)
  const maxStock = parseFloat(product.currentStock)
  const unitPrice = parseFloat(product.unitPrice)
  const totalPrice = quantity * unitPrice

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return
    if (newQuantity > maxStock) {
      setQuantity(maxStock)
      return
    }
    setQuantity(newQuantity)
  }

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= maxStock) {
      onConfirm(quantity)
      setQuantity(1)
      onClose()
    }
  }

  const handleClose = () => {
    setQuantity(1)
    onClose()
  }

  // Quick quantity buttons for common amounts
  const quickQuantities =
    product.type === "pms" ? [5, 10, 20, 30, 50] : [1, 2, 5, 10]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            {product.brand && (
              <p className="text-muted-foreground text-sm">{product.brand}</p>
            )}
            <p className="text-muted-foreground text-sm">
              Available: {maxStock} {product.unit} • ₦{unitPrice.toFixed(2)}/
              {product.unit}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="quantity">Quantity ({product.unit})</Label>

            {/* Manual quantity input */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={e =>
                  handleQuantityChange(parseFloat(e.target.value) || 0)
                }
                className="text-center"
                min="0"
                max={maxStock}
                step={product.type === "pms" ? "0.1" : "1"}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick quantity buttons */}
            <div>
              <Label className="text-muted-foreground text-sm">
                Quick select:
              </Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {quickQuantities
                  .filter(qty => qty <= maxStock)
                  .map(qty => (
                    <Button
                      key={qty}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(qty)}
                      className={
                        quantity === qty
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      {qty}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Total price display */}
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Price:</span>
                <span className="text-lg font-semibold">
                  ₦{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {quantity} {product.unit} × ₦{unitPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={quantity <= 0 || quantity > maxStock}
          >
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
