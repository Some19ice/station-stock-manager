"use client"

import { useState, useEffect, useMemo } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>()
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
    
    return entry.data
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

  const fetchData = async (showLoading = true, attempt = 0) => {
    try {
      if (showLoading) setIsLoading(true)
      setIsValidating(true)
      setError(null)
      
      const result = await fetcher()
      dashboardCache.set(key, result, ttl)
      setData(result)
      setRetryCount(0)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        setTimeout(() => {
          setRetryCount(attempt + 1)
          fetchData(false, attempt + 1)
        }, delay)
      } else {
        setError(error)
      }
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }

  const refresh = () => {
    setRetryCount(0)
    fetchData(false)
  }

  useEffect(() => {
    if (!data) {
      fetchData()
    }

    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (dashboardCache.isStale(key)) {
          if (staleWhileRevalidate && data) {
            fetchData(false)
          } else {
            fetchData()
          }
        }
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [key, refreshInterval, staleWhileRevalidate])

  const memoizedData = useMemo(() => data, [data])

  return {
    data: memoizedData,
    isLoading,
    error,
    isValidating,
    retryCount,
    refresh,
    invalidate: () => {
      dashboardCache.invalidate(key)
      setData(null)
    }
  }
}

export { dashboardCache }
