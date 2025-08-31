import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

export default async function MarketingPage() {
  const user = await currentUser()
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (user) {
    const userRole = user.publicMetadata?.role as string
    if (userRole === 'manager') {
      redirect('/dashboard')
    } else {
      redirect('/staff')
    }
  }
  
  // For unauthenticated users, redirect to login
  redirect('/login')
}
