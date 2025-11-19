"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  updateUserStatus,
  validateUserRole,
  getStationUsers
} from "@/actions/auth"
import { getUserActivities } from "@/actions/user-activities"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Shield,
  Calendar,
  Mail,
  Activity,
  Clock,
  Settings,
  UserCheck,
  AlertCircle,
  Save,
  Edit,
  Truck,
  Minus,
  ArrowRight,
  Package,
  Filter,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"
import { SimpleLoading } from "@/components/ui/simple-loading"
import { toast } from "sonner"

interface UserData {
  id: string
  username: string
  role: "staff" | "manager" | "director"
  isActive: boolean
  createdAt: Date
  clerkUserId?: string
}

interface ActivityItem {
  id: string
  action: string
  details: string
  timestamp: Date
  type: "sale" | "inventory"
  category: string
  icon: string
}

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

export default function UserEditPage({ params }: UserEditPageProps) {
  const router = useRouter()
  const { id: userId } = use(params)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([])
  const [filteredActivity, setFilteredActivity] = useState<ActivityItem[]>([])
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    role: "staff" as "staff" | "manager" | "director"
  })
  const headerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  // Filter activities based on selected filter
  useEffect(() => {
    if (activityFilter === "all") {
      setFilteredActivity(userActivity)
    } else {
      setFilteredActivity(
        userActivity.filter(activity => activity.type === activityFilter)
      )
    }
  }, [userActivity, activityFilter])

  // Animate page elements when data loads
  useEffect(() => {
    if (
      !loading &&
      user &&
      headerRef.current &&
      profileRef.current &&
      actionsRef.current &&
      activityRef.current
    ) {
      const tl = gsap.timeline()

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      ).fromTo(
        [profileRef.current, actionsRef.current, activityRef.current],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.3"
      )
    }
  }, [loading, user])

  const handleStatusToggle = async (isActive: boolean) => {
    if (!userId) return

    setUpdating(true)
    try {
      const result = await updateUserStatus(userId, isActive)
      if (result.isSuccess) {
        setUser(prev => (prev ? { ...prev, isActive } : null))
        toast.success(
          `User ${isActive ? "activated" : "deactivated"} successfully`
        )
      } else {
        toast.error("Failed to update user status", {
          description:
            result.error || "An error occurred while updating the user"
        })
      }
    } catch (error) {
      toast.error("An error occurred while updating the user")
    } finally {
      setUpdating(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Reset form to original values
      setEditForm({
        username: user.username,
        role: user.role
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveChanges = async () => {
    if (!user) return

    setUpdating(true)
    try {
      // Here you would call an updateUser API function
      // For now, we'll just update the local state
      const updatedUser = {
        ...user,
        username: editForm.username,
        role: editForm.role
      }
      setUser(updatedUser)
      setIsEditing(false)
      toast.success("User updated successfully")
    } catch (error) {
      toast.error("Failed to update user")
    } finally {
      setUpdating(false)
    }
  }

  // Fetch real user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Parallel execution of role check and user data fetch
        const [roleCheck, usersResult] = await Promise.all([
          validateUserRole("manager"),
          getStationUsers()
        ])

        if (!roleCheck.isSuccess) {
          router.push("/unauthorized")
          return
        }

        if (usersResult.isSuccess && usersResult.data) {
          const foundUser = usersResult.data.find(u => u.id === userId)

          if (foundUser) {
            setUser(foundUser)
            setEditForm({
              username: foundUser.username,
              role: foundUser.role
            })

            // Fetch activities in background without blocking UI
            getUserActivities(foundUser.id)
              .then(activitiesResult => {
                if (activitiesResult.isSuccess && activitiesResult.data) {
                  setUserActivity(activitiesResult.data)
                }
              })
              .catch(error => {
                console.error("Failed to load activities:", error)
              })
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [userId, router])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Enhanced Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-blue-200" />
            <div>
              <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gradient-to-r from-blue-200 to-indigo-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          {/* Profile skeleton - 2 columns */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Header with gradient */}
              <div className="h-16 animate-pulse bg-gradient-to-r from-blue-100 to-indigo-100" />

              <div className="space-y-6 p-6">
                {/* User header skeleton */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-20 w-20 animate-pulse rounded-2xl bg-gradient-to-br from-blue-200 to-indigo-300" />
                      <div className="absolute -right-1 -bottom-1 h-6 w-6 animate-pulse rounded-full bg-green-300" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-blue-200" />
                        <div className="h-6 w-16 animate-pulse rounded-full bg-green-200" />
                        <div className="h-6 w-20 animate-pulse rounded-full bg-orange-200" />
                      </div>
                    </div>
                  </div>
                  <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="h-px bg-gray-200" />

                {/* Details grid skeleton */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
                    >
                      <div
                        className={`h-10 w-10 animate-pulse rounded-full ${
                          i === 0
                            ? "bg-blue-200"
                            : i === 1
                              ? "bg-green-200"
                              : i === 2
                                ? "bg-purple-200"
                                : "bg-orange-200"
                        }`}
                      />
                      <div className="space-y-2">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
                        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions skeleton */}
          <div>
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Header with gradient */}
              <div className="h-16 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />

              <div className="space-y-4 p-6">
                {/* Status indicator skeleton */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <div className="mx-auto mb-2 h-12 w-12 animate-pulse rounded-full bg-green-200" />
                  <div className="mx-auto mb-1 h-4 w-24 animate-pulse rounded bg-green-300" />
                  <div className="mx-auto h-3 w-32 animate-pulse rounded bg-gray-200" />
                </div>

                {/* Toggle skeleton */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-pulse rounded bg-blue-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                  </div>
                  <div className="h-6 w-12 animate-pulse rounded-full bg-blue-200" />
                </div>

                {/* Buttons skeleton */}
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-10 w-full animate-pulse rounded ${
                        i === 2 ? "bg-gray-200" : "bg-gray-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity skeleton */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="h-16 animate-pulse bg-gradient-to-r from-slate-100 to-slate-200" />
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-8 w-16 animate-pulse rounded bg-blue-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-green-200" />
                <div className="h-8 w-24 animate-pulse rounded bg-purple-200" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div
                    className={`mt-1 h-8 w-8 animate-pulse rounded-full ${
                      i === 0
                        ? "bg-green-200"
                        : i === 1
                          ? "bg-blue-200"
                          : "bg-purple-200"
                    }`}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-300" />
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded bg-orange-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground">
              The requested user could not be found
            </p>
          </div>
        </div>
      </div>
    )
  }

  const daysSinceCreated = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  const getActivityIcon = (activity: ActivityItem) => {
    if (activity.type === "sale") {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }

    switch (activity.icon) {
      case "truck":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "settings":
        return <Settings className="h-4 w-4 text-orange-600" />
      case "minus":
        return <Minus className="h-4 w-4 text-red-600" />
      case "arrow-right":
        return <ArrowRight className="h-4 w-4 text-purple-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBgColor = (activity: ActivityItem) => {
    if (activity.type === "sale") return "bg-green-100"

    switch (activity.icon) {
      case "truck":
        return "bg-blue-100"
      case "settings":
        return "bg-orange-100"
      case "minus":
        return "bg-red-100"
      case "arrow-right":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-10 w-10 rounded-full transition-all hover:scale-110"
          >
            <Link href="/dashboard/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage user settings and permissions
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          ID: {userId?.slice(-8)}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        {/* Profile Information - Takes 2 columns */}
        <div ref={profileRef} className="lg:col-span-2">
          <AnimatedCard className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>
            <div className="space-y-6 p-6">
              {/* User Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-300 shadow-lg transition-all hover:scale-105">
                      {user.role === "manager" ? (
                        <Shield className="h-10 w-10 text-blue-700" />
                      ) : (
                        <User className="h-10 w-10 text-gray-700" />
                      )}
                    </div>
                    <div
                      className={`absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2 border-white ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                    />
                  </div>
                  <div className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.username}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              username: e.target.value
                            }))
                          }
                          className="h-12 text-2xl font-bold"
                        />
                        <Select
                          value={editForm.role}
                          onValueChange={(value: "staff" | "manager" | "director") =>
                            setEditForm(prev => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user.username}
                        </h2>
                        <p className="text-lg text-gray-600">
                          {user.role === "manager"
                            ? "Manager Account"
                            : "Staff Account"}
                        </p>
                      </>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          user.role === "manager" ? "default" : "secondary"
                        }
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {user.clerkUserId?.startsWith("temp_") && (
                        <Badge
                          variant="outline"
                          className="border-orange-300 bg-orange-50 px-3 py-1 text-orange-700"
                        >
                          Pending Activation
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  className="h-10 px-4 transition-all hover:scale-105"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {isEditing && (
                <div className="flex gap-3 rounded-lg bg-gray-50 p-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updating}
                    className="transition-all hover:scale-105"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleEditToggle}>
                    Cancel
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              {/* User Details Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {user.createdAt.toLocaleDateString()} ({daysSinceCreated}{" "}
                      days ago)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">
                      {user.clerkUserId?.startsWith("temp_")
                        ? "Invitation Sent"
                        : "Verified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Role</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600">
                      {user.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Sidebar - Actions */}
        <div ref={actionsRef}>
          <AnimatedCard>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-4 p-6">
              {/* Status Indicator */}
              <div
                className={`rounded-lg p-4 text-center ${user.isActive ? "border border-green-200 bg-green-50" : "border border-red-200 bg-red-50"}`}
              >
                <div
                  className={`mx-auto mb-2 flex h-5 w-12 items-center justify-center rounded-full ${user.isActive ? "bg-green-100" : "bg-red-100"}`}
                >
                  {user.isActive ? (
                    <UserCheck className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <p
                  className={`font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {user.isActive ? "Active User" : "Inactive User"}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {user.isActive ? "Full system access" : "No system access"}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-5 text-blue-600" />
                  <Label htmlFor="status" className="font-medium">
                    Active Status
                  </Label>
                </div>
                <Switch
                  id="status"
                  checked={user.isActive}
                  onCheckedChange={handleStatusToggle}
                  disabled={updating}
                />
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="h-10 w-full justify-start transition-all hover:scale-[1.02]"
                  disabled
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Edit Permissions
                </Button>

                <Button
                  variant="outline"
                  className="h-10 w-full justify-start transition-all hover:scale-[1.02]"
                  disabled
                >
                  <Mail className="mr-3 h-4 w-4" />
                  Send Notification
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="h-10 w-full transition-all hover:scale-[1.02]"
                >
                  <Link href="/dashboard/users">
                    <ArrowLeft className="mr-3 h-4 w-4" />
                    Back to Users
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Activity Section */}
      <div ref={activityRef}>
        <AnimatedCard title="Recent Activity" hoverEffect={true}>
          {userActivity.length > 0 ? (
            <div className="space-y-4">
              {/* Activity Filter */}
              <div className="flex items-center gap-2 border-b pb-4">
                <Filter className="text-muted-foreground h-4 w-4" />
                <div className="flex gap-2">
                  <Button
                    variant={activityFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivityFilter("all")}
                    className="transition-all hover:scale-105"
                  >
                    All ({userActivity.length})
                  </Button>
                  <Button
                    variant={activityFilter === "sale" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivityFilter("sale")}
                    className="transition-all hover:scale-105"
                  >
                    Sales ({userActivity.filter(a => a.type === "sale").length})
                  </Button>
                  <Button
                    variant={
                      activityFilter === "inventory" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActivityFilter("inventory")}
                    className="transition-all hover:scale-105"
                  >
                    Inventory (
                    {userActivity.filter(a => a.type === "inventory").length})
                  </Button>
                </div>
              </div>

              {/* Activity List */}
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {filteredActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3 transition-all hover:scale-[1.01] hover:bg-slate-100"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityBgColor(activity)} mt-1 flex-shrink-0`}
                    >
                      {getActivityIcon(activity)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {activity.action}
                          </p>
                          {activity.details && (
                            <p className="mt-1 text-sm text-slate-600">
                              {activity.details}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-2 ${activity.type === "sale" ? "border-green-200 text-green-700" : "border-blue-200 text-blue-700"}`}
                        >
                          {activity.category}
                        </Badge>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredActivity.length === 0 && (
                <div className="text-muted-foreground py-8 text-center">
                  <Activity className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p>
                    No {activityFilter !== "all" ? activityFilter : ""}{" "}
                    activities found
                  </p>
                  <p className="mt-1 text-sm">
                    Try selecting a different filter
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Activity className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
              <p>No recent activity to display</p>
              <p className="mt-1 text-sm">
                User activity will appear here once available
              </p>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
  )
}
