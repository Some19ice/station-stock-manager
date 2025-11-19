"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Settings,
  Plus,
  Edit,
  Trash2,
  Power,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Gauge
} from "lucide-react"
import { toast } from "sonner"
import { getProducts } from "@/actions/products"
import type { SelectProduct } from "@/db/schema"

interface PumpConfiguration {
  id: string
  stationId: string
  pmsProductId: string
  pumpNumber: string
  meterCapacity: string
  installDate: string
  lastCalibrationDate?: string
  status: "active" | "maintenance" | "calibration" | "repair"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Using SelectProduct from schema instead of local interface

interface PumpStatusManagementProps {
  stationId: string
  onUpdate?: () => void
  className?: string
}

export function PumpStatusManagement({
  stationId,
  onUpdate,
  className
}: PumpStatusManagementProps): React.ReactElement {
  const [pumps, setPumps] = useState<PumpConfiguration[]>([])
  const [products, setProducts] = useState<SelectProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingPump, setEditingPump] = useState<PumpConfiguration | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState<{
    pump: PumpConfiguration | null
    show: boolean
  }>({ pump: null, show: false })

  // Form state for creating/editing pumps
  const [formData, setFormData] = useState({
    pmsProductId: "",
    pumpNumber: "",
    meterCapacity: "",
    installDate: "",
    lastCalibrationDate: ""
  })

  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: "" as "active" | "maintenance" | "calibration" | "repair",
    notes: ""
  })

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)

      // Load pumps and products in parallel
      const [pumpsResponse, productsResult] = await Promise.all([
        fetch(`/api/pump-configurations?stationId=${stationId}`),
        getProducts(stationId, "pms")
      ])

      if (!pumpsResponse.ok) {
        throw new Error("Failed to load pump configurations")
      }

      const pumpsResult = await pumpsResponse.json()

      if (pumpsResult.isSuccess) {
        setPumps(pumpsResult.data || [])
      } else {
        throw new Error(pumpsResult.error)
      }

      if (productsResult.isSuccess) {
        setProducts(productsResult.data || [])
      } else {
        console.warn("Failed to load products:", productsResult.error)
        setProducts([]) // Continue without products if they fail to load
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load pump configurations")
    } finally {
      setLoading(false)
    }
  }, [stationId])

  useEffect(() => {
    if (stationId) {
      loadData()
    }
  }, [loadData, stationId])

  const resetForm = (): void => {
    setFormData({
      pmsProductId: "",
      pumpNumber: "",
      meterCapacity: "",
      installDate: "",
      lastCalibrationDate: ""
    })
    setEditingPump(null)
  }

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (products.length === 0) {
      toast.error(
        "Cannot create pump: No PMS products available. Please add PMS products to inventory first."
      )
      return
    }

    if (
      !formData.pmsProductId ||
      !formData.pumpNumber ||
      !formData.meterCapacity ||
      !formData.installDate
    ) {
      toast.error("Please fill all required fields")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/pump-configurations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stationId,
          pmsProductId: formData.pmsProductId,
          pumpNumber: formData.pumpNumber,
          meterCapacity: parseFloat(formData.meterCapacity),
          installDate: formData.installDate
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create pump configuration")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success("Pump configuration created successfully")
        setShowCreateDialog(false)
        resetForm()
        await loadData()
        onUpdate?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error creating pump:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create pump"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!editingPump) return

    setSubmitting(true)

    try {
      const updateData: Partial<PumpConfiguration> = {}

      if (formData.pumpNumber !== editingPump.pumpNumber) {
        updateData.pumpNumber = formData.pumpNumber
      }
      if (
        parseFloat(formData.meterCapacity) !==
        parseFloat(editingPump.meterCapacity)
      ) {
        updateData.meterCapacity = parseFloat(formData.meterCapacity).toString()
      }
      if (
        formData.lastCalibrationDate &&
        formData.lastCalibrationDate !== editingPump.lastCalibrationDate
      ) {
        updateData.lastCalibrationDate = formData.lastCalibrationDate
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save")
        setEditingPump(null)
        resetForm()
        return
      }

      const response = await fetch(
        `/api/pump-configurations/${editingPump.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update pump configuration")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success("Pump configuration updated successfully")
        setEditingPump(null)
        resetForm()
        await loadData()
        onUpdate?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating pump:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update pump"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (): Promise<void> => {
    if (!showStatusDialog.pump || !statusForm.status) {
      toast.error("Please select a status")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/pump-configurations/${showStatusDialog.pump.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: statusForm.status,
            notes: statusForm.notes
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update pump status")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success("Pump status updated successfully")
        setShowStatusDialog({ pump: null, show: false })
        setStatusForm({ status: "active", notes: "" })
        await loadData()
        onUpdate?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (pumpId: string): Promise<void> => {
    if (
      !window.confirm(
        "Are you sure you want to delete this pump configuration? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/pump-configurations/${pumpId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete pump configuration")
      }

      const result = await response.json()
      if (result.isSuccess) {
        toast.success("Pump configuration deleted successfully")
        await loadData()
        onUpdate?.()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting pump:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete pump"
      )
    }
  }

  const startEdit = (pump: PumpConfiguration): void => {
    setEditingPump(pump)
    setFormData({
      pmsProductId: pump.pmsProductId,
      pumpNumber: pump.pumpNumber,
      meterCapacity: pump.meterCapacity,
      installDate: pump.installDate,
      lastCalibrationDate: pump.lastCalibrationDate || ""
    })
  }

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-600" />
      case "calibration":
        return <Gauge className="h-4 w-4 text-blue-600" />
      case "repair":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Power className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string): React.ReactElement => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
        )
      case "calibration":
        return <Badge className="bg-blue-100 text-blue-700">Calibration</Badge>
      case "repair":
        return <Badge variant="destructive">Repair</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading pump configurations...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pump Configuration Management
              </CardTitle>
              <CardDescription>
                Manage pump configurations, statuses, and maintenance schedules
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pump
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Add New Pump Configuration</DialogTitle>
                    <DialogDescription>
                      Configure a new pump for this station
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product" className="text-right">
                        Product <span className="text-red-500">*</span>
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={formData.pmsProductId}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              pmsProductId: value
                            }))
                          }
                          disabled={loading || products.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loading
                                  ? "Loading products..."
                                  : products.length === 0
                                    ? "No PMS products available"
                                    : "Select PMS product"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {products.length === 0 ? (
                              <div className="text-muted-foreground p-4 text-center">
                                <p className="text-sm">No PMS products found</p>
                                <p className="mt-1 text-xs">
                                  Please add a PMS product to the inventory
                                  first
                                </p>
                              </div>
                            ) : (
                              products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                      {product.brand && ` (${product.brand})`}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      ₦
                                      {parseFloat(product.unitPrice).toFixed(2)}
                                      /{product.unit}
                                      {product.currentStock &&
                                        ` • ${product.currentStock}L available`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {products.length === 0 && !loading && (
                          <p className="mt-1 text-xs text-amber-600">
                            ⚠️ Add PMS products to inventory before creating
                            pumps
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pumpNumber" className="text-right">
                        Pump # <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pumpNumber"
                        value={formData.pumpNumber}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            pumpNumber: e.target.value
                          }))
                        }
                        className="col-span-3"
                        placeholder="e.g., P001"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="text-right">
                        Capacity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.meterCapacity}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            meterCapacity: e.target.value
                          }))
                        }
                        className="col-span-3"
                        placeholder="Liters"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="installDate" className="text-right">
                        Install Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="installDate"
                        type="date"
                        value={formData.installDate}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            installDate: e.target.value
                          }))
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Pump"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Pump List */}
      <div className="grid gap-4">
        {pumps.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No pump configurations found. Add your first pump to get
                  started.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          pumps.map(pump => {
            const product = products.find(p => p.id === pump.pmsProductId)
            const isEditing = editingPump?.id === pump.id

            return (
              <Card key={pump.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{pump.pumpNumber}</h3>
                      {getStatusBadge(pump.status)}
                      {!pump.isActive && (
                        <Badge variant="outline" className="text-red-600">
                          Deleted
                        </Badge>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <Label htmlFor={`edit-pump-${pump.id}`}>
                              Pump Number
                            </Label>
                            <Input
                              id={`edit-pump-${pump.id}`}
                              value={formData.pumpNumber}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  pumpNumber: e.target.value
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-capacity-${pump.id}`}>
                              Capacity (L)
                            </Label>
                            <Input
                              id={`edit-capacity-${pump.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              value={formData.meterCapacity}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  meterCapacity: e.target.value
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-calibration-${pump.id}`}>
                              Last Calibration
                            </Label>
                            <Input
                              id={`edit-calibration-${pump.id}`}
                              type="date"
                              value={formData.lastCalibrationDate}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  lastCalibrationDate: e.target.value
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPump(null)
                              resetForm()
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">
                            Product:
                          </span>
                          <div className="font-medium">
                            {product?.name || "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Capacity:
                          </span>
                          <div className="font-medium">
                            {parseFloat(pump.meterCapacity).toFixed(1)}L
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Installed:
                          </span>
                          <div className="font-medium">
                            {new Date(pump.installDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Last Calibration:
                          </span>
                          <div className="font-medium">
                            {pump.lastCalibrationDate
                              ? new Date(
                                  pump.lastCalibrationDate
                                ).toLocaleDateString()
                              : "Never"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && pump.isActive && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowStatusDialog({
                            pump,
                            show: true
                          })
                        }
                      >
                        {getStatusIcon(pump.status)}
                        Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(pump)}
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pump.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog
        open={showStatusDialog.show}
        onOpenChange={open =>
          setShowStatusDialog(prev => ({ ...prev, show: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pump Status</DialogTitle>
            <DialogDescription>
              Change status for {showStatusDialog.pump?.pumpNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusForm.status}
                onValueChange={(value: "active" | "maintenance" | "calibration" | "repair") =>
                  setStatusForm(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-yellow-600" />
                      Maintenance
                    </div>
                  </SelectItem>
                  <SelectItem value="calibration">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-600" />
                      Calibration
                    </div>
                  </SelectItem>
                  <SelectItem value="repair">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Repair
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about the status change..."
                value={statusForm.notes}
                onChange={e =>
                  setStatusForm(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog({ pump: null, show: false })
                setStatusForm({ status: "active", notes: "" })
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!statusForm.status || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
