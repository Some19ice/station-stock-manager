"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Fuel, Wrench, ShoppingCart, Plus, Minus } from "lucide-react"

interface Product {
  id: string
  name: string
  type: "pms" | "lubricant"
  unitPrice: string
  currentStock: string
  unit: string
}

interface CartItem {
  product: Product
  quantity: number
  totalPrice: number
}

export function MobileSalesInterface() {
  const [selectedType, setSelectedType] = useState<"pms" | "lubricant" | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  // Mock products
  const products: Product[] = [
    {
      id: "1",
      name: "PMS Premium",
      type: "pms",
      unitPrice: "650.00",
      currentStock: "1500.00",
      unit: "liters"
    },
    {
      id: "2", 
      name: "Engine Oil 5W-30",
      type: "lubricant",
      unitPrice: "1200.00",
      currentStock: "85.00",
      unit: "bottles"
    }
  ]

  const filteredProducts = selectedType 
    ? products.filter(p => p.type === selectedType)
    : []

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id)
    const unitPrice = parseFloat(product.unitPrice)

    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      newCart[existingIndex].totalPrice = newCart[existingIndex].quantity * unitPrice
      setCart(newCart)
    } else {
      setCart([...cart, {
        product,
        quantity,
        totalPrice: quantity * unitPrice
      }])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
      return
    }

    setCart(cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * parseFloat(item.product.unitPrice)
        }
      }
      return item
    }))
  }

  if (!selectedType) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-center mb-6">Select Product Type</h2>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-2"
            onClick={() => setSelectedType("pms")}
          >
            <Fuel className="h-8 w-8 text-blue-600" />
            <span className="font-medium">PMS (Petrol)</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 flex flex-col gap-2"
            onClick={() => setSelectedType("lubricant")}
          >
            <Wrench className="h-8 w-8 text-orange-600" />
            <span className="font-medium">Lubricants</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedType(null)}>
          ← Back
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.product.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, 0)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-medium">₦{item.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold">₦{cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" size="lg">
                      Complete Sale
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {filteredProducts.map(product => {
          const price = parseFloat(product.unitPrice)
          const stock = parseFloat(product.currentStock)
          
          return (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-lg font-bold">₦{price.toFixed(2)}/{product.unit}</p>
                  </div>
                  <Badge variant={stock <= 10 ? "destructive" : "secondary"}>
                    {stock} {product.unit}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    onClick={() => addToCart(product, 1)}
                    disabled={stock <= 0}
                  >
                    +1
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
    </div>
  )
}
