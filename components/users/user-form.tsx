"use client"

import { useState, useEffect } from "react"
import { createStationUser, getCurrentUserProfile } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface UserFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [stationId, setStationId] = useState<string>("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "staff" as "staff" | "manager"
  })

  useEffect(() => {
    const getStationId = async () => {
      try {
        const profile = await getCurrentUserProfile()
        if (profile.isSuccess && profile.data?.station) {
          setStationId(profile.data.station.id)
        }
      } catch (error) {
        console.error("Failed to get station ID:", error)
      }
    }
    getStationId()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = {
        ...formData,
        stationId,
        sendInvitation: true
      }

      const result = await createStationUser(userData)
      if (result.isSuccess) {
        toast.success("User created successfully!", {
          description: `Invitation sent to ${formData.email}. They will receive an email with login instructions.`
        })
        onSuccess()
      } else {
        toast.error("Failed to create user", {
          description: result.error || "An error occurred while creating the user"
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("An error occurred while creating the user")
    } finally {
      setLoading(false)
    }
  }

  if (!stationId) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Enter username"
          required
          minLength={3}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="user@example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          User will receive an invitation email with login instructions
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: "staff" | "manager") => 
            setFormData(prev => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading || !formData.username || !formData.email} className="flex-1">
          {loading ? "Creating..." : "Create User & Send Invitation"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
