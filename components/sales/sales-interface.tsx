"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, ShoppingCart, Plus, Minus, Fuel, Wrench } from "lucide-react"
import { toast } from "sonner"
import { recordSale } from "@/actions/sales"
import { getProducts } from "@/actions/products"

interface Product {
  id: string
  name: string
  brand?: string
  type: "pms" | "lubricant"
  currentStock: string
  unitPrice: string
  unit: string
  viscosity?: string
  containerSize?: string
}

interface CartItem {
  product: Product
  quantity: number
  totalPrice: number
}

interface SalesInterfaceProps {
  stationId: string
  onSaleComplete?: () => void
}

export function SalesInterface({ stationId, onSaleComplete }: SalesInterfaceProps) {
  const [selectedType, setSelectedType] = useState<"pms" | "lubricant" | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processingSale, setProcessingSale] = useState(false)

  // Load products when type is selected
  useEffect(() => {
    if (selectedType) {
      loadProducts()
    }
  }, [selectedType])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.viscosity && product.viscosity.toLowerCase().includes(query))
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  const loadProducts = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      const result = await getProducts(stationId, selectedType)
      if (result.isSuccess && result.data) {
        setProducts(result.data)
      } else {
        toast.error(result.error || "Failed to load products")
      }
    } catch (error) {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id)
    const unitPrice = parseFloat(product.unitPrice)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const newCart = [...cart]
      const newQuantity = newCart[existingItemIndex].quantity + quantity
      const availableStock = parseFloat(product.currentStock)
      
      if (newQuantity > availableStock) {
        toast.error(`Only ${availableStock} ${product.unit} available`)
        return
      }
      
      newCart[existingItemIndex].quantity = newQuantity
      newCart[existingItemIndex].totalPrice = newQuantity * unitPrice
      setCart(newCart)
    } else {
      // Add new item
      const availableStock = parseFloat(product.currentStock)
      
      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} ${product.unit} available`)
        return
      }
      
      const cartItem: CartItem = {
        product,
        quantity,
        totalPrice: quantity * unitPrice
      }
      setCart([...cart, cartItem])
    }
    
    toast.success(`Added ${quantity} ${product.unit} of ${product.name} to cart`)
  }

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const availableStock = parseFloat(item.product.currentStock)
        
        if (newQuantity > availableStock) {
          toast.error(`Only ${availableStock} ${item.product.unit} available`)
          return item
        }
        
        const unitPrice = parseFloat(item.product.unitPrice)
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * unitPrice
        }
      }
      return item
    })
    setCart(newCart)
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }, [cart])

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    setProcessingSale(true)
    try {
      const saleData = {
        stationId,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.product.unitPrice)
        })),
        totalAmount: cartTotal
      }

      const result = await recordSale(saleData)
      
      if (result.isSuccess) {
        toast.success("Sale recorded successfully!")
        clearCart()
        setSelectedType(null)
        setSearchQuery("")
        onSaleComplete?.()
      } else {
        toast.error(result.error || "Failed to record sale")
      }
    } catch (error) {
      toast.error("Failed to record sale")
    } finally {
      setProcessingSale(false)
    }
  }

  const resetInterface = () => {
    setSelectedType(null)
    setProducts([])
    setFilteredProducts([])
    setSearchQuery("")
    clearCart()
  }

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Select Product Type</h2>
          <p className="text-muted-foreground mb-6">
            Choose the type of product you want to sell
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => setSelectedType("pms")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Fuel className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">PMS (Petrol)</CardTitle>
              <CardDescription>
                Premium Motor Spirit sales
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => setSelectedType("lubricant")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Lubricants</CardTitle>
              <CardDescription>
                Engine oils and lubricants
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and cart summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={resetInterface}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {selectedType === "pms" ? (
                <>
                  <Fuel className="h-6 w-6 text-blue-600" />
                  PMS Sales
                </>
              ) : (
                <>
                  <Wrench className="h-6 w-6 text-orange-600" />
                  Lubricant Sales
                </>
              )}
            </h2>
            <p className="text-muted-foreground">
              Select products and quantities to record sale
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {cartItemCount} items
            </Badge>
            <Badge variant="default" className="text-sm">
              ₦{cartTotal.toFixed(2)}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${selectedType === "pms" ? "PMS products" : "lubricants"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const stock = parseFloat(product.currentStock)
                const price = parseFloat(product.unitPrice)
                const isLowStock = stock <= 10 // Simple low stock indicator
                
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.brand && (
                            <CardDescription>{product.brand}</CardDescription>
                          )}
                          {product.viscosity && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {product.viscosity}
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={isLowStock ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {stock} {product.unit}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold">
                          ₦{price.toFixed(2)}/{product.unit}
                        </span>
                        {product.containerSize && (
                          <span className="text-sm text-muted-foreground">
                            {product.containerSize}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addToCart(product, 1)}
                          disabled={stock <= 0}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add 1
                        </Button>
                        {selectedType === "pms" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(product, 10)}
                              disabled={stock < 10}
                            >
                              +10L
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(product, 20)}
                              disabled={stock < 20}
                            >
                              +20L
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? "No products found matching your search" : "No products available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cartItemCount} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{item.product.name}</h4>
                            {item.product.brand && (
                              <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                updateCartItemQuantity(item.product.id, value)
                              }}
                              className="w-16 h-6 text-center text-xs"
                              min="0"
                              step="0.1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium">
                            ₦{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>₦{cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={processSale}
                        disabled={processingSale || cart.length === 0}
                        className="w-full"
                        size="lg"
                      >
                        {processingSale ? "Processing..." : "Complete Sale"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="w-full"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}