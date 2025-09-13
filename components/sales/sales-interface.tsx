"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, ShoppingCart, Plus, Minus, Fuel, Wrench } from "lucide-react"
import { toast } from "sonner"
import { recordSale } from "@/actions/sales"
import { getProducts } from "@/actions/products"
import { gsap } from "gsap"
import Link from "next/link"

interface Product {
  id: string
  name: string
  brand?: string
  type: "lubricant" // Only lubricants - PMS handled via meter readings
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

export function SalesInterface({
  stationId,
  onSaleComplete
}: SalesInterfaceProps) {
  // Only allow lubricant transactions - PMS uses meter readings
  const [selectedType, setSelectedType] = useState<"lubricant" | null>(null)

  // Refs for animations
  const productsGridRef = useRef<HTMLDivElement>(null)
  const cartItemsRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processingSale, setProcessingSale] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      const result = await getProducts(stationId, selectedType)
      if (result.isSuccess && result.data) {
        // Transform null values to undefined to match Product interface
        const transformedProducts = result.data.map(product => ({
          ...product,
          brand: product.brand || undefined,
          viscosity: product.viscosity || undefined,
          containerSize: product.containerSize || undefined
        }))
        setProducts(transformedProducts)
      } else {
        toast.error(result.error || "Failed to load products")
      }
    } catch (error) {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [selectedType, stationId])

  // Load products when type is selected
  useEffect(() => {
    if (selectedType) {
      loadProducts()
    }
  }, [selectedType, loadProducts])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          (product.brand && product.brand.toLowerCase().includes(query)) ||
          (product.viscosity && product.viscosity.toLowerCase().includes(query))
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(
      item => item.product.id === product.id
    )
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

    toast.success(
      `Added ${quantity} ${product.unit} of ${product.name} to cart`
    )
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

  // Animate product cards when they load
  useEffect(() => {
    if (!loading && filteredProducts.length > 0 && productsGridRef.current) {
      const productCards = productsGridRef.current.children

      gsap.set(productCards, { opacity: 0, y: 20, scale: 0.95 })

      gsap.to(productCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: {
          amount: 0.8,
          ease: "power2.out"
        },
        ease: "power3.out"
      })

      // Add hover animations for each product card
      Array.from(productCards).forEach(card => {
        const element = card as HTMLElement
        const buttons = element.querySelectorAll("button")
        const badges = element.querySelectorAll("[data-badge]")

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            scale: 1.02,
            y: -3,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            duration: 0.3,
            ease: "power2.out"
          })

          // Animate badges on hover
          gsap.to(badges, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
            stagger: 0.05
          })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            scale: 1,
            y: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            duration: 0.3,
            ease: "power2.out"
          })

          gsap.to(badges, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
        })

        // Add individual button micro-interactions
        buttons.forEach((button, index) => {
          const buttonElement = button as HTMLElement

          buttonElement.addEventListener("mouseenter", () => {
            gsap.to(buttonElement, {
              scale: 1.1,
              rotate: index % 2 === 0 ? 5 : -5,
              duration: 0.2,
              ease: "back.out(1.7)"
            })
          })

          buttonElement.addEventListener("mouseleave", () => {
            gsap.to(buttonElement, {
              scale: 1,
              rotate: 0,
              duration: 0.2,
              ease: "power2.out"
            })
          })
        })
      })
    }
  }, [loading, filteredProducts])

  // Animate cart items when they change
  useEffect(() => {
    if (cart.length > 0 && cartItemsRef.current) {
      const cartItemElements = cartItemsRef.current.children

      gsap.set(cartItemElements, { opacity: 0, x: 20, scale: 0.95 })

      gsap.to(cartItemElements, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      })

      // Add hover animations for cart items
      Array.from(cartItemElements).forEach(item => {
        const element = item as HTMLElement

        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            scale: 1.02,
            y: -2,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            duration: 0.2,
            ease: "power2.out"
          })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            scale: 1,
            y: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            duration: 0.2,
            ease: "power2.out"
          })
        })
      })
    }
  }, [cart])

  // Animate loading skeleton shimmer effects
  useEffect(() => {
    if (loading && typeof window !== "undefined") {
      // Create shimmer effect for skeleton elements
      const shimmerElements = document.querySelectorAll(".skeleton-shimmer")

      Array.from(shimmerElements).forEach((element: Element) => {
        const el = element as HTMLElement
        gsap.set(el, { backgroundPosition: "-200% 0" })

        gsap.to(el, {
          backgroundPosition: "200% 0",
          duration: 1.5,
          ease: "none",
          repeat: -1
        })
      })
    }
  }, [loading])

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
          <h2 className="mb-2 text-2xl font-bold">Transaction Sales</h2>
          <p className="text-muted-foreground mb-6">
            Record individual product sales (lubricants only)
          </p>
        </div>

        {/* PMS Sales Information */}
        <Card className="mx-auto max-w-2xl border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Fuel className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">
                  PMS Sales Recording
                </CardTitle>
                <CardDescription className="text-blue-700">
                  PMS sales are recorded via daily meter readings, not
                  individual transactions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 text-sm text-blue-800">
              To record PMS sales, use the <strong>PMS Meter Readings</strong>{" "}
              page to enter your daily closing readings for each pump.
            </p>
            <Link href="/staff/meter-readings">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Fuel className="mr-2 h-4 w-4" />
                Go to Meter Readings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lubricant Sales */}
        <div className="mx-auto max-w-md">
          <Card
            className="hover:border-primary cursor-pointer border-2 transition-shadow hover:shadow-lg"
            onClick={() => setSelectedType("lubricant")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-fit rounded-full bg-orange-100 p-3">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">
                Lubricants & Accessories
              </CardTitle>
              <CardDescription>Engine oils and other products</CardDescription>
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
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Wrench className="h-6 w-6 text-orange-600" />
              Lubricant Sales
            </h2>
            <p className="text-muted-foreground">
              Select products and quantities to record sale
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <ShoppingCart className="mr-1 h-4 w-4" />
              {cartItemCount} items
            </Badge>
            <Badge variant="default" className="text-sm">
              ₦{cartTotal.toFixed(2)}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Product Selection */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search lubricants..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div
                      className="skeleton-shimmer h-4 w-3/4 rounded"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                        backgroundSize: "200% 100%"
                      }}
                    />
                    <div
                      className="skeleton-shimmer mt-2 h-3 w-1/2 rounded"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                        backgroundSize: "200% 100%"
                      }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className="skeleton-shimmer mb-2 h-6 w-16 rounded"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                        backgroundSize: "200% 100%"
                      }}
                    />
                    <div
                      className="skeleton-shimmer h-8 rounded"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)",
                        backgroundSize: "200% 100%"
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div
              ref={productsGridRef}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {filteredProducts.map(product => {
                const stock = parseFloat(product.currentStock)
                const price = parseFloat(product.unitPrice)
                const isLowStock = stock <= 10 // Simple low stock indicator

                return (
                  <Card
                    key={product.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {product.name}
                          </CardTitle>
                          {product.brand && (
                            <CardDescription>{product.brand}</CardDescription>
                          )}
                          {product.viscosity && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs"
                              data-badge="true"
                            >
                              {product.viscosity}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant={isLowStock ? "destructive" : "secondary"}
                          className="text-xs"
                          data-badge="true"
                        >
                          {stock} {product.unit}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          ₦{price.toFixed(2)}/{product.unit}
                        </span>
                        {product.containerSize && (
                          <span className="text-muted-foreground text-sm">
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
                          <Plus className="mr-1 h-4 w-4" />
                          Add 1
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No products found matching your search"
                    : "No products available"}
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
                <p className="text-muted-foreground py-4 text-center">
                  Cart is empty
                </p>
              ) : (
                <>
                  <div
                    ref={cartItemsRef}
                    className="max-h-96 space-y-3 overflow-y-auto"
                  >
                    {cart.map(item => (
                      <div
                        key={item.product.id}
                        className="rounded-lg border p-3"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              {item.product.name}
                            </h4>
                            {item.product.brand && (
                              <p className="text-muted-foreground text-xs">
                                {item.product.brand}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={e => {
                                const value = parseFloat(e.target.value) || 0
                                updateCartItemQuantity(item.product.id, value)
                              }}
                              className="h-6 w-16 text-center text-xs"
                              min="0"
                              step="0.1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
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
                    <div className="flex items-center justify-between text-lg font-semibold">
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
