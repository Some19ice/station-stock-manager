"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  isStale(key: string, maxAge = 30000): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > maxAge
  }
}

const dashboardCache = new DashboardCache()

export const useDashboardCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    refreshInterval?: number
    staleWhileRevalidate?: boolean
    maxRetries?: number
  } = {}
) => {
  const { 
    ttl, 
    refreshInterval = 30000, 
    staleWhileRevalidate = true,
    maxRetries = 3
  } = options
  
  const [data, setData] = useState<T | null>(() => dashboardCache.get<T>(key))
  const [isLoading, setIsLoading] = useState(!data)
  const [error, setError] = useState<Error | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // Use refs to avoid stale closures
  const fetcherRef = useRef(fetcher)
  const optionsRef = useRef(options)
  const mountedRef = useRef(true)
  
  // Update refs when props change
  fetcherRef.current = fetcher
  optionsRef.current = options

  const fetchData = useCallback(async (showLoading = true, attempt = 0) => {
    if (!mountedRef.current) return
    
    try {
      if (showLoading) setIsLoading(true)
      setIsValidating(true)
      setError(null)
      
      const result = await fetcherRef.current()
      
      if (!mountedRef.current) return
      
      dashboardCache.set(key, result, ttl)
      setData(result)
      setRetryCount(0)
    } catch (err) {
      if (!mountedRef.current) return
      
      const error = err instanceof Error ? err : new Error('Unknown error')
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        setTimeout(() => {
          if (mountedRef.current) {
            setRetryCount(attempt + 1)
            fetchData(false, attempt + 1)
          }
        }, delay)
      } else {
        setError(error)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsValidating(false)
      }
    }
  }, [key, ttl, maxRetries])

  const refresh = useCallback(() => {
    setRetryCount(0)
    fetchData(false)
  }, [fetchData])

  const invalidate = useCallback(() => {
    dashboardCache.invalidate(key)
    setData(null)
  }, [key])

  // Initial data fetch
  useEffect(() => {
    if (!data) {
      fetchData()
    }
  }, [data, fetchData])

  // Interval-based refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(() => {
      if (!mountedRef.current) return
      
      if (dashboardCache.isStale(key)) {
        if (staleWhileRevalidate && data) {
          fetchData(false)
        } else {
          fetchData()
        }
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [key, refreshInterval, staleWhileRevalidate, data, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const memoizedData = useMemo(() => data, [data])

  return {
    data: memoizedData,
    isLoading,
    error,
    isValidating,
    retryCount,
    refresh,
    invalidate
  }
}

export { dashboardCache }
