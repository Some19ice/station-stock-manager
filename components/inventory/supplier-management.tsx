"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getSuppliersWithProductCounts,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "@/actions/suppliers"
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  Building2
} from "lucide-react"
import { toast } from "sonner"

interface Supplier {
  id: string
  name: string
  contactPerson?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  productCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface SupplierFormData {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  notes: string
}

interface SupplierManagementProps {
  stationId: string
}

export function SupplierManagement({ stationId }: SupplierManagementProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchSuppliers = useCallback(async () => {
    try {
      const result = await getSuppliersWithProductCounts({ stationId })
      if (result.isSuccess && result.data) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }, [stationId])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: ""
    })
    setDialogOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || ""
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingSupplier) {
        // Update existing supplier
        const result = await updateSupplier({
          id: editingSupplier.id,
          ...formData
        })

        if (result.isSuccess) {
          toast.success("Supplier updated successfully")
          setDialogOpen(false)
          fetchSuppliers()
        } else {
          toast.error(result.error || "Failed to update supplier")
        }
      } else {
        // Create new supplier
        const result = await createSupplier({
          stationId,
          ...formData
        })

        if (result.isSuccess) {
          toast.success("Supplier created successfully")
          setDialogOpen(false)
          fetchSuppliers()
        } else {
          toast.error(result.error || "Failed to create supplier")
        }
      }
    } catch (error) {
      console.error("Error submitting supplier:", error)
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (supplier.productCount > 0) {
      toast.error("Cannot delete supplier with active products")
      return
    }

    if (!confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      return
    }

    try {
      const result = await deleteSupplier({ supplierId: supplier.id })
      if (result.isSuccess) {
        toast.success("Supplier deleted successfully")
        fetchSuppliers()
      } else {
        toast.error(result.error || "Failed to delete supplier")
      }
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast.error("An error occurred")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="bg-muted h-5 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-36 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Supplier Management
            </span>
            <Button onClick={handleAddSupplier}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No suppliers found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add your first supplier to get started
              </p>
              <Button onClick={handleAddSupplier} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {suppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{supplier.name}</h3>
                      {supplier.contactPerson && (
                        <p className="text-muted-foreground">
                          Contact: {supplier.contactPerson}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Package className="mr-1 h-3 w-3" />
                        {supplier.productCount} products
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier)}
                        disabled={supplier.productCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                    {supplier.phone && (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {supplier.notes && (
                    <div className="bg-muted mt-3 rounded p-2 text-sm">
                      <strong>Notes:</strong> {supplier.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={e =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingSupplier
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
