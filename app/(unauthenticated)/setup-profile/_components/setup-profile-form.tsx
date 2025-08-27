"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { setupUserProfile } from "../_actions/setup-profile"

export function SetupProfileForm() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    stationName: "",
    stationAddress: "",
    username: "",
    role: "" as "staff" | "manager" | ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("Authentication error. Please try again.")
      return
    }

    if (!formData.stationName || !formData.username || !formData.role) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const result = await setupUserProfile({
        clerkUserId: user.id,
        stationName: formData.stationName,
        stationAddress: formData.stationAddress,
        username: formData.username,
        role: formData.role
      })

      if (result.isSuccess) {
        toast.success("Profile setup complete!")
        // Redirect based on role
        if (formData.role === "manager") {
          router.push("/dashboard")
        } else {
          router.push("/staff")
        }
      } else {
        toast.error(result.error || "Failed to setup profile")
      }
    } catch (error) {
      console.error("Setup profile error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Station Profile Setup</CardTitle>
        <CardDescription>
          Create your station profile and user account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stationName">Station Name *</Label>
            <Input
              id="stationName"
              type="text"
              placeholder="Enter your filling station name"
              value={formData.stationName}
              onChange={(e) => setFormData(prev => ({ ...prev, stationName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stationAddress">Station Address</Label>
            <Input
              id="stationAddress"
              type="text"
              placeholder="Enter station address (optional)"
              value={formData.stationAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, stationAddress: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: "staff" | "manager") => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Sales Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}