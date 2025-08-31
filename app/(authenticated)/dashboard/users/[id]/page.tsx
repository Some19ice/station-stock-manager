"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { updateUserStatus, validateUserRole, getStationUsers } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  AlertCircle
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

interface UserEditPageProps {
  params: Promise<{ id: string }>
}

export default function UserEditPage({ params }: UserEditPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const resolvedParams = use(params)
  const headerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  // Animate page elements when data loads
  useEffect(() => {
    if (!loading && user && headerRef.current && profileRef.current && actionsRef.current && activityRef.current) {
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
        setUser(prev => prev ? { ...prev, isActive } : null)
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
      } else {
        toast.error("Failed to update user status", {
          description: result.error || "An error occurred while updating the user"
        })
      }
    } catch (error) {
      toast.error("An error occurred while updating the user")
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
          const foundUser = usersResult.data.find(u => u.id === resolvedParams.id)
          if (foundUser) {
            setUser(foundUser)
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
      <div className="flex items-center justify-center min-h-[60vh]">
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
            <p className="text-muted-foreground">The requested user could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  const daysSinceCreated = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="hover:scale-105 transition-transform">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage user settings and permissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Information */}
        <div ref={profileRef} className="lg:col-span-2">
          <AnimatedCard 
            title="Profile Information"
            hoverEffect={true}
          >
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 transition-all hover:scale-110">
                  {user.role === "manager" ? (
                    <Shield className="h-8 w-8 text-blue-600" />
                  ) : (
                    <User className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.username}</h2>
                  <p className="text-muted-foreground">User ID: {user.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={user.role === "manager" ? "default" : "secondary"}
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
                    {user.clerkUserId?.startsWith('temp_') && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {user.createdAt.toLocaleDateString()} ({daysSinceCreated} days ago)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {user.clerkUserId?.startsWith('temp_') ? "Invitation Sent" : "Verified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
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
          <AnimatedCard 
            title="Quick Actions"
            hoverEffect={true}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
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
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Permissions
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start transition-all hover:scale-[1.02]"
                  disabled
                >
                  <Mail className="h-4 w-4 mr-2" />
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
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
                    <p className="text-sm text-muted-foreground">Full system access</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Inactive User</p>
                    <p className="text-sm text-muted-foreground">No system access</p>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Activity Section */}
      <div ref={activityRef}>
        <AnimatedCard 
          title="Recent Activity"
          hoverEffect={true}
        >
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No recent activity to display</p>
            <p className="text-sm mt-1">User activity will appear here once available</p>
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
