import { validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const roleCheck = await validateUserRole("director")
  
  if (!roleCheck.isSuccess) {
    redirect("/unauthorized")
  }

  return <>{children}</>
}
