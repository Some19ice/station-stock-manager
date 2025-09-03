"use client"

import { useState, useEffect, useRef } from "react"
import {
  validateUserRole,
  getStationUsers,
  updateUserStatus
} from "@/actions/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  UserPlus,
  User,
  Shield,
  Search,
  Trash2,
  Users,
  Activity
} from "lucide-react"
import { UserForm } from "@/components/users/user-form"
import { toast } from "sonner"
import Link from "next/link"
import { gsap } from "gsap"
import { AnimatedCard } from "@/components/ui/animated-card"
import { SimpleLoading } from "@/components/ui/simple-loading"

interface UserData {
  id: string
  username: string
  role: "staff" | "manager"
  isActive: boolean
  createdAt: Date
  clerkUserId?: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const usersRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  // Animate page elements when data loads
  useEffect(() => {
    if (
      !loading &&
      headerRef.current &&
      searchRef.current &&
      usersRef.current &&
      statsRef.current
    ) {
      const tl = gsap.timeline()

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          statsRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          searchRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          usersRef.current.children,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
          "-=0.1"
        )
    }
  }, [loading])

  const loadUsers = async () => {
    try {
      const roleCheck = await validateUserRole("manager")
      if (!roleCheck.isSuccess) {
        redirect("/unauthorized")
        return
      }

      const usersResult = await getStationUsers()
      if (usersResult.isSuccess && usersResult.data) {
        setUsers(usersResult.data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const result = await updateUserStatus(userId, isActive)
      if (result.isSuccess) {
        setUsers(prev =>
          prev.map(user => (user.id === userId ? { ...user, isActive } : user))
        )
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
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    await handleStatusToggle(userId, false)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadUsers() // Refresh the users list
  }

  const handleCreateCancel = () => {
    setShowCreateModal(false)
  }

  // Calculate stats
  const activeUsers = users.filter(user => user.isActive).length
  const managerCount = users.filter(user => user.role === "manager").length
  const staffCount = users.filter(user => user.role === "staff").length
  const pendingUsers = users.filter(user =>
    user.clerkUserId?.startsWith("temp_")
  ).length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SimpleLoading message="Loading User Management" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="transition-transform hover:scale-105"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div ref={statsRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-muted-foreground text-xs">
              All registered users
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeUsers}
            </div>
            <p className="text-muted-foreground text-xs">Currently active</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {managerCount}
            </div>
            <p className="text-muted-foreground text-xs">Admin privileges</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard hoverEffect={true}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{staffCount}</div>
            <p className="text-muted-foreground text-xs">Standard access</p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 transition-all focus:scale-[1.02]"
          />
        </div>
        <Badge variant="outline" className="transition-all hover:scale-105">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
        </Badge>
        {pendingUsers > 0 && (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 transition-all hover:scale-105"
          >
            {pendingUsers} pending
          </Badge>
        )}
      </div>

      {/* Users List */}
      <div ref={usersRef} className="grid gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onStatusToggle={handleStatusToggle}
              onDeactivate={handleDeactivateUser}
            />
          ))
        ) : (
          <AnimatedCard>
            <CardHeader>
              <CardTitle>
                {searchTerm ? "No Users Found" : "No Users Found"}
              </CardTitle>
              <CardDescription>
                {searchTerm
                  ? `No users match "${searchTerm}"`
                  : "Start by creating your first staff account"}
              </CardDescription>
            </CardHeader>
            {!searchTerm && (
              <CardContent>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create First User
                </Button>
              </CardContent>
            )}
          </AnimatedCard>
        )}
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </DialogTitle>
          </DialogHeader>
          <UserForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCreateCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Animated User Card Component
const UserCard = ({
  user,
  onStatusToggle,
  onDeactivate
}: {
  user: UserData
  onStatusToggle: (userId: string, isActive: boolean) => void
  onDeactivate: (userId: string) => void
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={cardRef}>
      <Link href={`/dashboard/users/${user.id}`}>
        <AnimatedCard hoverEffect={true} className="cursor-pointer">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 transition-all hover:scale-110">
                {user.role === "manager" ? (
                  <Shield className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-muted-foreground text-sm">
                  Created {new Date(user.createdAt).toLocaleDateString()}
                  {user.clerkUserId?.startsWith("temp_") && (
                    <span className="ml-2 text-orange-600">
                      • Pending activation
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role === "manager" ? "default" : "secondary"}
                  className="transition-all hover:scale-105"
                >
                  {user.role}
                </Badge>
                {user.clerkUserId?.startsWith("temp_") ? (
                  <Badge
                    variant="outline"
                    className="border-orange-200 text-orange-600 transition-all hover:scale-105"
                  >
                    Invitation Sent
                  </Badge>
                ) : (
                  <Badge
                    variant={user.isActive ? "default" : "destructive"}
                    className="transition-all hover:scale-105"
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={user.isActive}
                  onCheckedChange={checked => onStatusToggle(user.id, checked)}
                  className="transition-all hover:scale-105"
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 transition-all hover:scale-105 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate {user.username}?
                        They will no longer be able to access the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeactivate(user.id)}>
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </Link>
    </div>
  )
}
