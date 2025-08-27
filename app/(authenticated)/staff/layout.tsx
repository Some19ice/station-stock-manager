import { validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user has staff access (staff or manager)
  const roleCheck = await validateUserRole("staff")
  
  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}