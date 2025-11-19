import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Route matchers for different access levels
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/staff(.*)", "/director(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // Redirect to sign-in if not authenticated and accessing protected routes
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn()
  }

  // Role-based access control is now handled at the page level
  // to avoid Edge Runtime compatibility issues with database calls
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
}
