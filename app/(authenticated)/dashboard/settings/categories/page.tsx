"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Layers, Search, Package } from "lucide-react"
import { toast } from "sonner"
import { getCategories, getCategoryStats } from "@/actions/categories"

interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  productsCount: number
}

interface CategoryStats {
  totalProducts: number
  activeProducts: number
  totalValue: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesResult, statsResult] = await Promise.all([
        getCategories(),
        getCategoryStats()
      ])

      if (categoriesResult.isSuccess && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        toast.error(categoriesResult.error || "Failed to load categories")
      }

      if (statsResult.isSuccess && statsResult.data) {
        setStats(statsResult.data)
      }
    } catch (error) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">
            View your product categories and their usage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Categories</span>
            </div>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Active Categories</span>
            </div>
            <p className="text-2xl font-bold">
              {categories.filter(c => c.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Total Products</span>
            </div>
            <p className="text-2xl font-bold">
              {stats?.totalProducts || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <p className="text-2xl font-bold">
              ₦{stats ? (stats.totalValue / 1000000).toFixed(1) : 0}M
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              All Categories ({filteredCategories.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "Categories are based on your product types"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-medium">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.productsCount} products
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
