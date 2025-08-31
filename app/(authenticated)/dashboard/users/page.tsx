"use client"

import { useState, useEffect } from "react"
import { validateUserRole, getStationUsers, updateUserStatus } from "@/actions/auth"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserPlus, User, Shield, Search, Trash2 } from "lucide-react"
import { UserForm } from "@/components/users/user-form"
import { toast } from "sonner"
import Link from "next/link"

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

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

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
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ))
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
      } else {
        toast.error("Failed to update user status", {
          description: result.error || "An error occurred while updating the user"
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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
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
                      {user.clerkUserId?.startsWith('temp_') && (
                        <span className="ml-2 text-orange-600">• Pending activation</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "manager" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    {user.clerkUserId?.startsWith('temp_') ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Invitation Sent
                      </Badge>
                    ) : (
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) => handleStatusToggle(user.id, checked)}
                    />
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/users/${user.id}`}>Edit</Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate {user.username}? They will no longer be able to access the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeactivateUser(user.id)}>
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {searchTerm ? "No Users Found" : "No Users Found"}
              </CardTitle>
              <CardDescription>
                {searchTerm 
                  ? `No users match "${searchTerm}"`
                  : "Start by creating your first staff account"
                }
              </CardDescription>
            </CardHeader>
            {!searchTerm && (
              <CardContent>
                <Button onClick={() => setShowCreateModal(true)}>Create First User</Button>
              </CardContent>
            )}
          </Card>
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
