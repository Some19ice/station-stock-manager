import { getCurrentUserProfile } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import EnhancedDashboardLayout from "./_components/enhanced-layout"

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

  // Verify user is a manager
  if (profileUser.role !== "manager") {
    redirect("/staff")
  }

  const userData = {
    name: user.fullName || user.firstName || user.username || "Manager",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    membership: "manager"
  }

  return (
    <EnhancedDashboardLayout userData={userData}>
      {children}
    </EnhancedDashboardLayout>
  )
}
