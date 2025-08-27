import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { RoleGuard, ManagerOnly, StaffAccess } from '@/components/auth/role-guard'
import { useStationAuth } from '@/hooks/use-station-auth'
import { ClerkProvider } from '@clerk/nextjs'

// Mock the useStationAuth hook
const mockUseStationAuth = jest.fn()
jest.mock('@/hooks/use-station-auth', () => ({
  useStationAuth: mockUseStationAuth
}))


describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultAuthState = {
    user: null,
    station: null,
    isLoading: false,
    error: null,
    isManager: false,
    isStaff: false,
    hasRole: jest.fn(),
    canAccess: jest.fn(),
    refetch: jest.fn()
  }

  it('should render children when user has required role', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(true)
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager">
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Manager Content')).toBeInTheDocument())
  })

  it('should render default access denied message when user lacks required role', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager">
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Access Restricted')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('You need manager permissions to access this content.')).toBeInTheDocument())
    expect(screen.queryByText('Manager Content')).not.toBeInTheDocument()
  })

  it('should render custom fallback when user lacks required role', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <RoleGuard 
          requiredRole="manager"
          fallback={<div>Custom Fallback</div>}
        >
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Custom Fallback')).toBeInTheDocument())
    expect(screen.queryByText('Manager Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument()
  })

  it('should render loading state when loading', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      isLoading: true
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager">
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Loading...')).toBeInTheDocument())
    expect(screen.queryByText('Manager Content')).not.toBeInTheDocument()
  })

  it('should not render loading state when showLoading is false', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      isLoading: true,
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager" showLoading={false}>
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Access Restricted')).toBeInTheDocument())
  })

  it('should render error state when there is an error', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      error: 'Authentication failed'
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager">
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Authentication Error')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Authentication failed')).toBeInTheDocument())
    expect(screen.queryByText('Manager Content')).not.toBeInTheDocument()
  })

  it('should not render error state when showError is false', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      error: 'Authentication failed',
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="manager" showError={false}>
          <div>Manager Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    expect(screen.queryByText('Authentication Error')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Access Restricted')).toBeInTheDocument())
  })

  it('should call canAccess with correct role', () => {
    const mockCanAccess = jest.fn().mockReturnValue(true)
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: mockCanAccess
    })

    render(
      <ClerkProvider>
        <RoleGuard requiredRole="staff">
          <div>Staff Content</div>
        </RoleGuard>
      </ClerkProvider>
    )

    expect(mockCanAccess).toHaveBeenCalledWith('staff')
  })
})

describe('ManagerOnly', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultAuthState = {
    user: null,
    station: null,
    isLoading: false,
    error: null,
    isManager: false,
    isStaff: false,
    hasRole: jest.fn(),
    canAccess: jest.fn(),
    refetch: jest.fn()
  }

  it('should render children for manager role', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(true)
    })

    render(
      <ClerkProvider>
        <ManagerOnly>
          <div>Manager Only Content</div>
        </ManagerOnly>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Manager Only Content')).toBeInTheDocument())
  })

  it('should not render children for non-manager', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <ManagerOnly>
          <div>Manager Only Content</div>
        </ManagerOnly>
      </ClerkProvider>
    )

    expect(screen.queryByText('Manager Only Content')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('You need manager permissions to access this content.')).toBeInTheDocument())
  })
})

describe('StaffAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultAuthState = {
    user: null,
    station: null,
    isLoading: false,
    error: null,
    isManager: false,
    isStaff: false,
    hasRole: jest.fn(),
    canAccess: jest.fn(),
    refetch: jest.fn()
  }

  it('should render children for staff role', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(true)
    })

    render(
      <ClerkProvider>
        <StaffAccess>
          <div>Staff Content</div>
        </StaffAccess>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Staff Content')).toBeInTheDocument())
  })

  it('should render children for manager role (manager can access staff functions)', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(true) // Manager can access staff functions
    })

    render(
      <ClerkProvider>
        <StaffAccess>
          <div>Staff Content</div>
        </StaffAccess>
      </ClerkProvider>
    )

    await waitFor(() => expect(screen.getByText('Staff Content')).toBeInTheDocument())
  })

  it('should not render children when user has no access', async () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      canAccess: jest.fn().mockReturnValue(false)
    })

    render(
      <ClerkProvider>
        <StaffAccess>
          <div>Staff Content</div>
        </StaffAccess>
      </ClerkProvider>
    )

    expect(screen.queryByText('Staff Content')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('You need staff permissions to access this content.')).toBeInTheDocument())
  })
})