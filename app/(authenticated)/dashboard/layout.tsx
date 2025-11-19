import { getCurrentUserProfile, validateUserRole } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import EnhancedDashboardLayout from "./_components/enhanced-layout"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  const userProfile = await getCurrentUserProfile()

  if (!userProfile.isSuccess || !userProfile.data) {
    redirect("/setup-profile")
  }

  const { user: profileUser } = userProfile.data

  // Verify user is a manager or director (handled by hierarchy check)
  const roleCheck = await validateUserRole("manager")

  if (!roleCheck.isSuccess) {
    redirect("/staff")
  }

  const userData = {
    name: user.fullName || user.firstName || user.username || profileUser.role,
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    membership: profileUser.role
  }

  return (
    <EnhancedDashboardLayout userData={userData} userRole={profileUser.role}>
      {children}
    </EnhancedDashboardLayout>
  )
}
