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

  return <>{children}</>
}