import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { useStationAuth } from '@/hooks/use-station-auth'
import { ClerkProvider } from '@clerk/nextjs'

// Mock auth actions
const mockGetCurrentUserProfile = jest.fn()
jest.mock('@/actions/auth', () => ({
  getCurrentUserProfile: mockGetCurrentUserProfile
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  ClerkProvider: ({ children }) => <>{children}</>
}))

const { useUser } = require('@clerk/nextjs')

describe('useStationAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
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

  it('should return loading state initially', () => {
    useUser.mockReturnValue({
      user: null,
      isLoaded: false
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.station).toBe(null)
  })

  it('should fetch and return manager user data', async () => {
    useUser.mockReturnValue({
      user: { id: 'clerk-manager' },
      isLoaded: true
    })

    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: true,
      data: {
        user: mockManagerUser,
        station: mockStation
      }
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockManagerUser)
    expect(result.current.station).toEqual(mockStation)
    expect(result.current.isManager).toBe(true)
    expect(result.current.isStaff).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should fetch and return staff user data', async () => {
    useUser.mockReturnValue({
      user: { id: 'clerk-staff' },
      isLoaded: true
    })

    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: true,
      data: {
        user: mockStaffUser,
        station: mockStation
      }
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockStaffUser)
    expect(result.current.isManager).toBe(false)
    expect(result.current.isStaff).toBe(true)
  })

  it('should handle authentication errors', async () => {
    useUser.mockReturnValue({
      user: { id: 'clerk-user' },
      isLoaded: true
    })

    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: false,
      error: 'User not found'
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.station).toBe(null)
    expect(result.current.error).toBe('User not found')
  })

  it('should handle no authenticated user', async () => {
    useUser.mockReturnValue({
      user: null,
      isLoaded: true
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.station).toBe(null)
    expect(result.current.error).toBe(null)
    expect(mockGetCurrentUserProfile).not.toHaveBeenCalled()
  })

  describe('role checking utilities', () => {
    it('should correctly identify manager role', async () => {
      useUser.mockReturnValue({
        user: { id: 'clerk-manager' },
        isLoaded: true
      })

      mockGetCurrentUserProfile.mockResolvedValue({
        isSuccess: true,
        data: {
          user: mockManagerUser,
          station: mockStation
        }
      })

      const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasRole('manager')).toBe(true)
      expect(result.current.hasRole('staff')).toBe(false)
      expect(result.current.canAccess('manager')).toBe(true)
      expect(result.current.canAccess('staff')).toBe(true) // Manager can access staff functions
    })

    it('should correctly identify staff role', async () => {
      useUser.mockReturnValue({
        user: { id: 'clerk-staff' },
        isLoaded: true
      })

      mockGetCurrentUserProfile.mockResolvedValue({
        isSuccess: true,
        data: {
          user: mockStaffUser,
          station: mockStation
        }
      })

      const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasRole('staff')).toBe(true)
      expect(result.current.hasRole('manager')).toBe(false)
      expect(result.current.canAccess('staff')).toBe(true)
      expect(result.current.canAccess('manager')).toBe(false) // Staff cannot access manager functions
    })

    it('should return false for role checks when no user', () => {
      useUser.mockReturnValue({
        user: null,
        isLoaded: true
      })

      const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

      expect(result.current.hasRole('manager')).toBe(false)
      expect(result.current.hasRole('staff')).toBe(false)
      expect(result.current.canAccess('manager')).toBe(false)
      expect(result.current.canAccess('staff')).toBe(false)
    })
  })

  it('should support refetching user data', async () => {
    useUser.mockReturnValue({
      user: { id: 'clerk-manager' },
      isLoaded: true
    })

    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: true,
      data: {
        user: mockManagerUser,
        station: mockStation
      }
    })

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Clear the mock and set up new response
    mockGetCurrentUserProfile.mockClear()
    const updatedUser = { ...mockManagerUser, username: 'updated-manager' }
    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: true,
      data: {
        user: updatedUser,
        station: mockStation
      }
    })

    // Call refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.user?.username).toBe('updated-manager')
    })

    expect(mockGetCurrentUserProfile).toHaveBeenCalledTimes(1)
  })

  it('should handle network errors gracefully', async () => {
    useUser.mockReturnValue({
      user: { id: 'clerk-user' },
      isLoaded: true
    })

    mockGetCurrentUserProfile.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useStationAuth(), { wrapper: ClerkProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.station).toBe(null)
    expect(result.current.error).toBe('An unexpected error occurred')
  })
})