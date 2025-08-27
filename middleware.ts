import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

// Route matchers for different access levels
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/staff(.*)"])
const isManagerOnlyRoute = createRouteMatcher([
  "/dashboard/inventory(.*)",
  "/dashboard/reports(.*)",
  "/dashboard/users(.*)",
  "/dashboard/settings(.*)"
])
const isStaffRoute = createRouteMatcher(["/staff(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // Redirect to sign-in if not authenticated and accessing protected routes
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn()
  }

  // If user is authenticated and accessing protected routes, check role-based access
  if (userId && isProtectedRoute(req)) {
    try {
      // Get user role from database
      const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, userId),
        columns: { role: true, isActive: true }
      })

      // If user doesn't have a station profile, redirect to setup
      if (!user) {
        const url = new URL("/setup-profile", req.url)
        return NextResponse.redirect(url)
      }

      // If user account is inactive, redirect to unauthorized
      if (!user.isActive) {
        const url = new URL("/unauthorized", req.url)
        return NextResponse.redirect(url)
      }

      // Check manager-only routes
      if (isManagerOnlyRoute(req) && user.role !== "manager") {
        const url = new URL("/dashboard", req.url)
        return NextResponse.redirect(url)
      }

      // Redirect managers away from staff-only routes to dashboard
      if (isStaffRoute(req) && user.role === "manager") {
        const url = new URL("/dashboard", req.url)
        return NextResponse.redirect(url)
      }

      // Redirect staff away from main dashboard to staff interface
      if (req.nextUrl.pathname === "/dashboard" && user.role === "staff") {
        const url = new URL("/staff", req.url)
        return NextResponse.redirect(url)
      }

    } catch (error) {
      console.error("Error checking user role in middleware:", error)
      // On database error, allow access but log the error
      // This prevents the app from breaking if the database is temporarily unavailable
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
}
