import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { UserInfo, UserInfoCompact, UserInfoCard } from '@/components/auth/user-info'
import { useStationAuth } from '@/hooks/use-station-auth'
import { ClerkProvider } from '@clerk/nextjs'

// Mock the useStationAuth hook
const mockUseStationAuth = jest.fn()
jest.mock('@/hooks/use-station-auth', () => ({
  useStationAuth: mockUseStationAuth
}))

describe('UserInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockManagerUser = {
    id: 'user-1',
    stationId: 'station-1',
    clerkUserId: 'clerk-manager',
    username: 'manager1',
    role: 'manager' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockStaffUser = {
    id: 'user-2',
    stationId: 'station-1',
    clerkUserId: 'clerk-staff',
    username: 'staff1',
    role: 'staff' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockStation = {
    id: 'station-1',
    customerId: 'customer-1',
    name: 'Test Station',
    address: '123 Test St',
    createdAt: new Date(),
    updatedAt: new Date()
  }

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

  it('should render user information for manager', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: mockStation,
      isManager: true
    })

    render(<ClerkProvider><UserInfo /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.getByText('manager')).toBeInTheDocument()
    expect(screen.getByText('Test Station')).toBeInTheDocument()
    
    // Check avatar fallback
    expect(screen.getByText('M')).toBeInTheDocument() // First letter of username
  })

  it('should render user information for staff', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockStaffUser,
      station: mockStation,
      isStaff: true
    })

    render(<ClerkProvider><UserInfo /></ClerkProvider>)

    expect(screen.getByText('staff1')).toBeInTheDocument()
    expect(screen.getByText('staff')).toBeInTheDocument()
    expect(screen.getByText('Test Station')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument() // First letter of username
  })

  it('should hide station when showStation is false', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: mockStation,
      isManager: true
    })

    render(<ClerkProvider><UserInfo showStation={false} /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.getByText('manager')).toBeInTheDocument()
    expect(screen.queryByText('Test Station')).not.toBeInTheDocument()
  })

  it('should hide role when showRole is false', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: mockStation,
      isManager: true
    })

    render(<ClerkProvider><UserInfo showRole={false} /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.queryByText('manager')).not.toBeInTheDocument()
    expect(screen.getByText('Test Station')).toBeInTheDocument()
  })

  it('should render loading skeleton when loading', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      isLoading: true
    })

    render(<ClerkProvider><UserInfo /></ClerkProvider>)

    // Should render skeleton elements (we can't easily test Skeleton component content)
    expect(screen.queryByText('manager1')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Station')).not.toBeInTheDocument()
  })

  it('should render not authenticated message when no user', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      error: 'Not authenticated'
    })

    render(<ClerkProvider><UserInfo /></ClerkProvider>)

    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    expect(screen.queryByText('manager1')).not.toBeInTheDocument()
  })

  it('should render not authenticated message when user is null', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: null
    })

    render(<ClerkProvider><UserInfo /></ClerkProvider>)

    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })
})

describe('UserInfoCompact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockManagerUser = {
    id: 'user-1',
    stationId: 'station-1',
    clerkUserId: 'clerk-manager',
    username: 'manager1',
    role: 'manager' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockStation = {
    id: 'station-1',
    customerId: 'customer-1',
    name: 'Test Station',
    address: '123 Test St',
    createdAt: new Date(),
    updatedAt: new Date()
  }

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

  it('should render compact user info without station', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: mockStation,
      isManager: true
    })

    render(<ClerkProvider><UserInfoCompact /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.getByText('manager')).toBeInTheDocument()
    expect(screen.queryByText('Test Station')).not.toBeInTheDocument() // Should be hidden in compact mode
  })
})

describe('UserInfoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockManagerUser = {
    id: 'user-1',
    stationId: 'station-1',
    clerkUserId: 'clerk-manager',
    username: 'manager1',
    role: 'manager' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockStation = {
    id: 'station-1',
    customerId: 'customer-1',
    name: 'Test Station',
    address: '123 Test St',
    createdAt: new Date(),
    updatedAt: new Date()
  }

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

  it('should render user info card with address', () => {
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: mockStation,
      isManager: true
    })

    render(<ClerkProvider><UserInfoCard /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.getByText('manager')).toBeInTheDocument()
    expect(screen.getByText('Test Station')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
  })

  it('should render user info card without address when not provided', () => {
    const stationWithoutAddress = { ...mockStation, address: undefined }
    
    mockUseStationAuth.mockReturnValue({
      ...defaultAuthState,
      user: mockManagerUser,
      station: stationWithoutAddress,
      isManager: true
    })

    render(<ClerkProvider><UserInfoCard /></ClerkProvider>)

    expect(screen.getByText('manager1')).toBeInTheDocument()
    expect(screen.getByText('Test Station')).toBeInTheDocument()
    expect(screen.queryByText('123 Test St')).not.toBeInTheDocument()
  })
})
