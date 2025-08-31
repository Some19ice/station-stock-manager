export const dynamic = "force-dynamic"

import { validateUserRole, getStationUsers } from "@/actions/auth"
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
import { UserPlus, User, Shield } from "lucide-react"
import Link from "next/link"

export default async function UsersManagementPage() {
  // Verify user is a manager
  const roleCheck = await validateUserRole("manager")

  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  // Get station users
  const usersResult = await getStationUsers()
  const users = usersResult.isSuccess ? usersResult.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button asChild>
          <Link
            href="/dashboard/users/create"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map(user => (
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
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.role === "manager" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/users/${user.id}`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Users Found</CardTitle>
              <CardDescription>
                Start by creating your first staff account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/users/create">Create First User</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
