"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { getCurrentUserProfile } from "@/actions/auth"

export type UserRole = "staff" | "manager"

export interface StationUser {
  id: string
  stationId: string
  clerkUserId: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Station {
  id: string
  customerId: string
  name: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface UseStationAuthReturn {
  user: StationUser | null
  station: Station | null
  isLoading: boolean
  error: string | null
  isManager: boolean
  isStaff: boolean
  hasRole: (role: UserRole) => boolean
  canAccess: (requiredRole: UserRole) => boolean
  refetch: () => Promise<void>
}

/**
 * Hook for accessing station-specific user authentication and role information
 * Provides convenient utilities for role-based UI rendering
 */
export function useStationAuth(): UseStationAuthReturn {
  const { user: clerkUser, isLoaded } = useUser()
  const [stationUser, setStationUser] = useState<StationUser | null>(null)
  const [station, setStation] = useState<Station | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    if (!clerkUser?.id) {
      setStationUser(null)
      setStation(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getCurrentUserProfile()
      
      if (result.isSuccess && result.data) {
        setStationUser(result.data.user)
        setStation(result.data.station)
      } else {
        setError(result.error || "Failed to load user profile")
        setStationUser(null)
        setStation(null)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setStationUser(null)
      setStation(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      fetchUserProfile()
    }
  }, [clerkUser?.id, isLoaded])

  const isManager = stationUser?.role === "manager"
  const isStaff = stationUser?.role === "staff"

  const hasRole = (role: UserRole): boolean => {
    return stationUser?.role === role
  }

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!stationUser) return false
    
    // Manager can access all staff functions
    if (requiredRole === "staff" && stationUser.role === "manager") {
      return true
    }
    
    return stationUser.role === requiredRole
  }

  return {
    user: stationUser,
    station,
    isLoading,
    error,
    isManager,
    isStaff,
    hasRole,
    canAccess,
    refetch: fetchUserProfile
  }
}