export const dynamic = "force-dynamic"

import { getAllUsers } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DirectorUsersPage() {
  const usersResult = await getAllUsers()

  if (!usersResult.isSuccess) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <p className="text-red-500">Error: {usersResult.error}</p>
      </div>
    )
  }

  const users = usersResult.data || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users across all stations</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.station.name}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={user.role === "director" ? "default" : user.role === "manager" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
