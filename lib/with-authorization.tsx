import { getCurrentUserProfile, validateUserRole } from "@/actions/auth"
import { redirect } from "next/navigation"
import type { Role } from "@/lib/constants"
import { users, stations } from "@/db/schema"

/**
 * Higher-Order Component for route authorization
 * Wraps a page component to enforce role-based access control
 * 
 * @param Component - The page component to protect
 * @param requiredRole - Minimum role required to access the page
 * @param redirectTo - Where to redirect unauthorized users
 * @returns Authorized component
 * 
 * @example
 * ```tsx
 * // app/(authenticated)/director/page.tsx
 * import { withAuthorization } from "@/lib/with-authorization"
 * 
 * function DirectorDashboard() {
 *   return <div>Director Content</div>
 * }
 * 
 * export default withAuthorization(DirectorDashboard, "director")
 * ```
 */
export function withAuthorization<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: Role,
  redirectTo: string = "/unauthorized"
) {
  const AuthorizedComponent = async (props: P) => {
    const roleCheck = await validateUserRole(requiredRole)
    
    if (!roleCheck.isSuccess) {
      redirect(redirectTo)
    }

    return <Component {...props} />
  }

  // Preserve component name for debugging
  AuthorizedComponent.displayName = `withAuthorization(${Component.displayName || Component.name || 'Component'})`

  return AuthorizedComponent
}

export type UserProfileData = {
  user: typeof users.$inferSelect
  station: typeof stations.$inferSelect
}

/**
 * HOC that ensures user has a valid profile
 * Redirects to profile setup if profile is incomplete
 * 
 * @param Component - The page component to protect
 * @returns Component that requires valid profile
 */
export function withProfile<P extends object>(
  Component: React.ComponentType<P & { userProfile: UserProfileData }>
) {
  const ProfileRequiredComponent = async (props: P) => {
    const userProfile = await getCurrentUserProfile()
    
    if (!userProfile.isSuccess || !userProfile.data) {
      redirect("/setup-profile")
    }

    return <Component {...props} userProfile={userProfile.data} />
  }

  ProfileRequiredComponent.displayName = `withProfile(${Component.displayName || Component.name || 'Component'})`

  return ProfileRequiredComponent
}

/**
 * Combines authorization and profile requirements
 * Most common pattern for protected pages
 * 
 * @param Component - The page component to protect
 * @param requiredRole - Minimum role required
 * @returns Fully protected component
 * 
 * @example
 * ```tsx
 * export default withAuthAndProfile(ManagerDashboard, "manager")
 * ```
 */
export function withAuthAndProfile<P extends object>(
  Component: React.ComponentType<P & { userProfile: UserProfileData }>,
  requiredRole: Role,
  redirectTo: string = "/unauthorized"
) {
  const ProtectedComponent = async (props: P) => {
    // Check profile first
    const userProfile = await getCurrentUserProfile()
    
    if (!userProfile.isSuccess || !userProfile.data) {
      redirect("/setup-profile")
    }

    // Then check role
    const roleCheck = await validateUserRole(requiredRole)
    
    if (!roleCheck.isSuccess) {
      redirect(redirectTo)
    }

    return <Component {...props} userProfile={userProfile.data} />
  }

  ProtectedComponent.displayName = `withAuthAndProfile(${Component.displayName || Component.name || 'Component'})`

  return ProtectedComponent
}
