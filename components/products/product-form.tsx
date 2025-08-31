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
import { Switch } from "@/components/ui/switch"
import { createProduct, updateProduct } from "@/actions/products"
import { SelectProduct } from "@/db/schema"
import { toast } from "sonner"

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().optional(),
  type: z.enum(["pms", "lubricant"]),
  viscosity: z.string().optional(),
  containerSize: z.string().optional(),
  currentStock: z.number().min(0, "Stock cannot be negative"),
  unitPrice: z.number().min(0, "Price must be positive"),
  minThreshold: z.number().min(0, "Threshold must be positive"),
  unit: z.enum(["litres", "units"]),
  isActive: z.boolean()
})

type ProductFormData = z.infer<typeof productFormSchema>

interface ProductFormProps {
  stationId: string
  product?: SelectProduct
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({
  stationId,
  product,
  onSuccess,
  onCancel
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!product

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      brand: product?.brand || "",
      type: product?.type || "pms",
      viscosity: product?.viscosity || "",
      containerSize: product?.containerSize || "",
      currentStock: product ? parseFloat(product.currentStock) : 0,
      unitPrice: product ? parseFloat(product.unitPrice) : 0,
      minThreshold: product ? parseFloat(product.minThreshold) : 0,
      unit: (product?.unit as "litres" | "units") || "litres",
      isActive: product?.isActive ?? true
    }
  })

  const productType = form.watch("type")

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditing && product) {
        result = await updateProduct({
          id: product.id,
          name: data.name,
          brand: data.brand,
          viscosity: data.viscosity,
          containerSize: data.containerSize,
          unitPrice: data.unitPrice,
          minThreshold: data.minThreshold,
          isActive: data.isActive
        })
      } else {
        result = await createProduct({
          stationId,
          ...data
        })
      }

      if (result.isSuccess) {
        toast.success(
          isEditing
            ? "Product updated successfully"
            : "Product created successfully"
        )
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="e.g., Premium Motor Spirit"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...form.register("brand")}
                placeholder="e.g., Shell, Mobil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Product Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={value =>
                  form.setValue("type", value as "pms" | "lubricant")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pms">
                    PMS (Premium Motor Spirit)
                  </SelectItem>
                  <SelectItem value="lubricant">Lubricant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={form.watch("unit")}
                onValueChange={value =>
                  form.setValue("unit", value as "litres" | "units")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="litres">Litres</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {productType === "lubricant" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="viscosity">Viscosity</Label>
                  <Input
                    id="viscosity"
                    {...form.register("viscosity")}
                    placeholder="e.g., 10W-40, 20W-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="containerSize">Container Size</Label>
                  <Input
                    id="containerSize"
                    {...form.register("containerSize")}
                    placeholder="e.g., 1L, 4L, 20L"
                  />
                </div>
              </>
            )}

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="currentStock">Initial Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  step="0.01"
                  {...form.register("currentStock", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.currentStock && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.currentStock.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₦) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                {...form.register("unitPrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.unitPrice && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.unitPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minThreshold">Minimum Threshold *</Label>
              <Input
                id="minThreshold"
                type="number"
                step="0.01"
                {...form.register("minThreshold", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.minThreshold && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.minThreshold.message}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={checked =>
                    form.setValue("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active Product</Label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
