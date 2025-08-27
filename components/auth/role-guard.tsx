"use client"

import { ReactNode } from "react"
import { useStationAuth, UserRole } from "@/hooks/use-station-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2 } from "lucide-react"

interface RoleGuardProps {
  /** Required role to access the content */
  requiredRole: UserRole
  /** Content to render when user has required role */
  children: ReactNode
  /** Optional fallback content when user doesn't have required role */
  fallback?: ReactNode
  /** Whether to show loading state */
  showLoading?: boolean
  /** Whether to show error state */
  showError?: boolean
}

/**
 * Component that conditionally renders content based on user role
 * Provides loading and error states for better UX
 */
export function RoleGuard({
  requiredRole,
  children,
  fallback,
  showLoading = true,
  showError = true
}: RoleGuardProps) {
  const { canAccess, isLoading, error } = useStationAuth()

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && showError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Check role access
  if (!canAccess(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-muted-foreground">Access Restricted</CardTitle>
          </div>
          <CardDescription>
            You need {requiredRole} permissions to access this content.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <>{children}</>
}

/**
 * Convenience component for manager-only content
 */
export function ManagerOnly({ children, fallback, showLoading, showError }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard
      requiredRole="manager"
      fallback={fallback}
      showLoading={showLoading}
      showError={showError}
    >
      {children}
    </RoleGuard>
  )
}

/**
 * Convenience component for staff-accessible content (includes managers)
 */
export function StaffAccess({ children, fallback, showLoading, showError }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard
      requiredRole="staff"
      fallback={fallback}
      showLoading={showLoading}
      showError={showError}
    >
      {children}
    </RoleGuard>
  )
}