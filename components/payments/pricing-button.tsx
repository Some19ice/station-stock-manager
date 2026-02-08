"use client"

import { initializeTransaction } from "@/actions/paystack"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { PAYSTACK_PLANS } from "@/lib/paystack"

interface PricingButtonProps {
  planKey: keyof typeof PAYSTACK_PLANS
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary"
}

export function PricingButton({
  planKey,
  children,
  className,
  variant = "default"
}: PricingButtonProps) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!isSignedIn) {
      sessionStorage.setItem("pendingCheckout", planKey)
      toast.info("Please sign in to continue")
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const result = await initializeTransaction(planKey)

      if (!result.isSuccess || !result.data) {
        throw new Error(result.error || "Failed to initialize payment")
      }

      // Redirect to Paystack checkout page
      window.location.href = result.data.authorizationUrl
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  )
}
