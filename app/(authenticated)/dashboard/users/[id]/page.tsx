"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { updateUserStatus } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Shield } from "lucide-react"
import Link from "next/link"

interface UserData {
  id: string
  username: string
  role: "staff" | "manager"
  isActive: boolean
  createdAt: Date
  clerkUserId?: string
}

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

export default function UserEditPage({ params }: UserEditPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const resolvedParams = use(params)

  const handleStatusToggle = async (isActive: boolean) => {
    setLoading(true)
    try {
      const result = await updateUserStatus(resolvedParams.id, isActive)
      if (result.isSuccess) {
        setUser(prev => prev ? { ...prev, isActive } : null)
      } else {
        alert(result.error || "Failed to update user status")
      }
    } catch (error) {
      alert("An error occurred while updating the user")
    } finally {
      setLoading(false)
    }
  }

  // Mock user data - in real app, fetch from API
  useEffect(() => {
    setUser({
      id: resolvedParams.id,
      username: "john.doe",
      role: "staff",
      isActive: true,
      createdAt: new Date()
    })
  }, [resolvedParams.id])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Manage user settings and permissions</p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {user.role === "manager" ? (
              <Shield className="h-5 w-5 text-blue-600" />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
            {user.username}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Role</Label>
            <Badge variant={user.role === "manager" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>Created</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="status">Active Status</Label>
            <Switch
              id="status"
              checked={user.isActive}
              onCheckedChange={handleStatusToggle}
              disabled={loading}
            />
          </div>

          <div className="pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/users">Back to Users</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
