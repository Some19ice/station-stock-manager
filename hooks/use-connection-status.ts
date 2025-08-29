"use client"

import { useState, useEffect } from 'react'

export interface ConnectionStatus {
  status: 'online' | 'offline'
  lastSync?: Date
  pendingTransactions?: number
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<'online' | 'offline'>('online')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial status based on navigator.onLine
    setStatus(navigator.onLine ? 'online' : 'offline')

    const handleOnline = () => {
      setStatus('online')
      setLastSync(new Date())
    }
    
    const handleOffline = () => {
      setStatus('offline')
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial sync time if online
    if (navigator.onLine) {
      setLastSync(new Date())
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { 
    status, 
    lastSync,
    isOnline: status === 'online',
    isOffline: status === 'offline'
  }
}