"use client"

import { useState, useEffect, useCallback } from 'react'

interface DashboardData {
  metrics?: unknown
  alerts?: unknown[]
  transactions?: unknown[]
  lastUpdated: Date
}

export const useDashboardUpdates = (initialData: DashboardData) => {
  const [data, setData] = useState<DashboardData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Simulate API calls - replace with actual server actions
      const [metricsRes, alertsRes, transactionsRes] = await Promise.all([
        fetch('/api/dashboard/metrics').catch(() => null),
        fetch('/api/dashboard/alerts').catch(() => null),
        fetch('/api/dashboard/transactions').catch(() => null)
      ])

      const updates: Partial<DashboardData> = { lastUpdated: new Date() }

      if (metricsRes?.ok) {
        updates.metrics = await metricsRes.json()
      }
      if (alertsRes?.ok) {
        updates.alerts = await alertsRes.json()
      }
      if (transactionsRes?.ok) {
        updates.transactions = await transactionsRes.json()
      }

      setData(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  return { data, isRefreshing, refreshData }
}
