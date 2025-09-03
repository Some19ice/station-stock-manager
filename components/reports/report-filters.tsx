"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, X } from "lucide-react"

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFilters) => void
  availableStaff: Array<{ id: string; name: string }>
  availableProducts: Array<{ id: string; name: string; type: string }>
}

export interface ReportFilters {
  dateRange: { start: string; end: string }
  staffIds: string[]
  productTypes: string[]
  productIds: string[]
  minAmount?: number
  maxAmount?: number
}

export function ReportFilters({
  onFiltersChange,
  availableStaff,
  availableProducts
}: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0]
    },
    staffIds: [],
    productTypes: [],
    productIds: []
  })

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const removeStaff = (staffId: string) => {
    updateFilters({ staffIds: filters.staffIds.filter(id => id !== staffId) })
  }

  const removeProductType = (type: string) => {
    updateFilters({
      productTypes: filters.productTypes.filter(t => t !== type)
    })
  }

  const clearAllFilters = () => {
    const cleared = {
      dateRange: filters.dateRange,
      staffIds: [],
      productTypes: [],
      productIds: [],
      minAmount: undefined,
      maxAmount: undefined
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={e =>
                updateFilters({
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={e =>
                updateFilters({
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Staff Members</Label>
            <Select
              onValueChange={value => {
                if (!filters.staffIds.includes(value)) {
                  updateFilters({ staffIds: [...filters.staffIds, value] })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff..." />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product Types</Label>
            <Select
              onValueChange={value => {
                if (!filters.productTypes.includes(value)) {
                  updateFilters({
                    productTypes: [...filters.productTypes, value]
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="lubricant">Lubricant</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="min-amount">Min Amount ($)</Label>
            <Input
              id="min-amount"
              type="number"
              placeholder="0.00"
              value={filters.minAmount || ""}
              onChange={e =>
                updateFilters({
                  minAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="max-amount">Max Amount ($)</Label>
            <Input
              id="max-amount"
              type="number"
              placeholder="1000.00"
              value={filters.maxAmount || ""}
              onChange={e =>
                updateFilters({
                  maxAmount: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined
                })
              }
            />
          </div>
        </div>

        {(filters.staffIds.length > 0 || filters.productTypes.length > 0) && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.staffIds.map(staffId => {
                const staff = availableStaff.find(s => s.id === staffId)
                return (
                  <Badge
                    key={staffId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {staff?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeStaff(staffId)}
                    />
                  </Badge>
                )
              })}
              {filters.productTypes.map(type => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeProductType(type)}
                  />
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
