"use client"

import { useEffect, useCallback, useState } from 'react'
import { dashboardCache } from './use-dashboard-cache'

interface RealtimeConfig {
  enabled?: boolean
  events?: string[]
  onUpdate?: (event: string, data: any) => void
}

export function useRealtimeUpdates(config: RealtimeConfig = {}) {
  const { enabled = false, events = [], onUpdate } = config
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleVisibilityChange = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      dashboardCache.clear()
      onUpdate?.('visibility_change', { visible: true })
    }
  }, [onUpdate])

  const handleOnline = useCallback(() => {
    dashboardCache.clear()
    onUpdate?.('connection_restored', { online: true })
  }, [onUpdate])

  useEffect(() => {
    if (!enabled || !isClient) return

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        onUpdate?.('data_update', { timestamp: Date.now() })
      }
    }, 10000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [enabled, isClient, handleVisibilityChange, handleOnline, onUpdate])

  return {
    isOnline: isClient ? navigator.onLine : true,
    isVisible: isClient ? document.visibilityState === 'visible' : true
  }
}
