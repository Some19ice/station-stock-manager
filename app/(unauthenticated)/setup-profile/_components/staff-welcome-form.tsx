"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { toast } from "sonner"
import { setupStaffProfile } from "../_actions/setup-staff-profile"

export function StaffWelcomeForm() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pendingUsername, setPendingUsername] = useState("")

  useEffect(() => {
    // Get the pending username from the invitation
    const fetchPendingUser = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          const response = await fetch("/api/pending-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.primaryEmailAddress.emailAddress
            })
          })
          const data = await response.json()
          if (data.username) {
            setPendingUsername(data.username)
          }
        } catch (error) {
          console.error("Failed to fetch pending user:", error)
        }
      }
    }
    fetchPendingUser()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error("Authentication error. Please try again.")
      return
    }

    setIsLoading(true)

    try {
      const result = await setupStaffProfile({
        clerkUserId: user.id
      })

      if (result.isSuccess) {
        toast.success("Welcome! Your account is ready.")
        router.push("/staff")
      } else {
        toast.error(result.error || "Failed to setup profile")
      }
    } catch (error) {
      console.error("Setup staff profile error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to the Team!</CardTitle>
        <CardDescription>
          Your account is ready to be activated. Click below to complete the
          setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={pendingUsername}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value="Sales Staff" disabled className="bg-gray-50" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
