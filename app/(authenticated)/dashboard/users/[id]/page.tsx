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
import { RiveLoading } from "@/components/ui/rive-loading"
import { toast } from "sonner"

interface UserData {
  id: string
  username: string
  role: "staff" | "manager"
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
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([])
  const [filteredActivity, setFilteredActivity] = useState<ActivityItem[]>([])
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    role: "staff" as "staff" | "manager"
  })
  const resolvedParams = use(params)
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
    setUpdating(true)
    try {
      const result = await updateUserStatus(resolvedParams.id, isActive)
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
        const roleCheck = await validateUserRole("manager")
        if (!roleCheck.isSuccess) {
          router.push("/unauthorized")
          return
        }

        const usersResult = await getStationUsers()
        if (usersResult.isSuccess && usersResult.data) {
          const foundUser = usersResult.data.find(
            u => u.id === resolvedParams.id
          )
          if (foundUser) {
            setUser(foundUser)
            setEditForm({
              username: foundUser.username,
              role: foundUser.role
            })

            // Fetch real user activities
            const activitiesResult = await getUserActivities(foundUser.id)
            if (activitiesResult.isSuccess && activitiesResult.data) {
              setUserActivity(activitiesResult.data)
            }
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

    fetchUser()
  }, [resolvedParams.id, router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RiveLoading message="Loading User Profile" />
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
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="transition-transform hover:scale-105"
        >
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">
            Manage user settings and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Information */}
        <div ref={profileRef} className="lg:col-span-2">
          <AnimatedCard title="Profile Information" hoverEffect={true}>
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 transition-all hover:scale-110">
                    {user.role === "manager" ? (
                      <Shield className="h-8 w-8 text-blue-600" />
                    ) : (
                      <User className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm.username}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              username: e.target.value
                            }))
                          }
                          className="text-xl font-semibold"
                        />
                        <Select
                          value={editForm.role}
                          onValueChange={(value: "staff" | "manager") =>
                            setEditForm(prev => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold">
                          {user.username}
                        </h2>
                        <p className="text-muted-foreground">
                          {user.role === "manager"
                            ? "Manager Account"
                            : "Staff Account"}
                        </p>
                      </>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          user.role === "manager" ? "default" : "secondary"
                        }
                        className="transition-all hover:scale-105"
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className="transition-all hover:scale-105"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {user.clerkUserId?.startsWith("temp_") && (
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-600"
                        >
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="transition-all hover:scale-105"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updating}
                    className="transition-all hover:scale-105"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditToggle}
                    className="transition-all hover:scale-105"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <Separator />

              {/* User Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-muted-foreground text-sm">
                      {user.createdAt.toLocaleDateString()} ({daysSinceCreated}{" "}
                      days ago)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-muted-foreground text-sm">
                      {user.clerkUserId?.startsWith("temp_")
                        ? "Invitation Sent"
                        : "Verified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-muted-foreground text-sm capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-muted-foreground text-sm">
                      {user.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Actions Panel */}
        <div ref={actionsRef} className="space-y-6">
          <AnimatedCard title="Quick Actions" hoverEffect={true}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <Label htmlFor="status">Active Status</Label>
                </div>
                <Switch
                  id="status"
                  checked={user.isActive}
                  onCheckedChange={handleStatusToggle}
                  disabled={updating}
                  className="transition-all hover:scale-105"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start transition-all hover:scale-[1.02]"
                  disabled
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Permissions
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start transition-all hover:scale-[1.02]"
                  disabled
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </div>

              <Separator />

              <Button
                variant="outline"
                asChild
                className="w-full transition-all hover:scale-[1.02]"
              >
                <Link href="/dashboard/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Users
                </Link>
              </Button>
            </div>
          </AnimatedCard>

          {/* Status Card */}
          <AnimatedCard hoverEffect={true}>
            <div className="text-center">
              {user.isActive ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Active User</p>
                    <p className="text-muted-foreground text-sm">
                      Full system access
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Inactive User</p>
                    <p className="text-muted-foreground text-sm">
                      No system access
                    </p>
                  </div>
                </div>
              )}
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
