"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { Sparkles, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedSkeleton } from "./animated-loading"
import { EnhancedCard, EnhancedCardContent } from "./enhanced-card"
import { Badge } from "./badge"
import { AnimatedPage } from "./animated-page"

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  showMetrics?: boolean
  showAlerts?: boolean
  showActivity?: boolean
  showHeader?: boolean
  className?: string
  variant?: "dashboard" | "simple" | "minimal" | "inventory" | "users"
}

function MetricsLoading() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loadingRef.current) {
      const cards = loadingRef.current.children
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      )
    }
  }, [])

  return (
    <div
      ref={loadingRef}
      className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <EnhancedCard key={i} variant="metric" className="overflow-hidden">
          <EnhancedCardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <AnimatedSkeleton className="h-4 w-20" />
              <div className="bg-primary/20 h-8 w-8 animate-pulse rounded-full" />
            </div>
            <AnimatedSkeleton className="mb-3 h-10 w-24" />
            <div className="flex items-center justify-between">
              <AnimatedSkeleton className="h-6 w-16 rounded-full" />
              <AnimatedSkeleton className="h-5 w-12 rounded" />
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      ))}
    </div>
  )
}

function UsersLoading() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loadingRef.current) {
      const cards = loadingRef.current.children
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      )
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div
        ref={loadingRef}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedCard key={i} className="overflow-hidden">
            <EnhancedCardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <AnimatedSkeleton className="h-4 w-20" />
                <div className="bg-primary/20 h-4 w-4 animate-pulse rounded" />
              </div>
              <AnimatedSkeleton className="mb-2 h-8 w-12" />
              <AnimatedSkeleton className="h-3 w-24" />
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <AnimatedSkeleton className="h-10 w-full rounded-md" />
        </div>
        <AnimatedSkeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedCard key={i}>
            <EnhancedCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 h-12 w-12 animate-pulse rounded-full" />
                  <div className="space-y-2">
                    <AnimatedSkeleton className="h-5 w-32" />
                    <AnimatedSkeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatedSkeleton className="h-6 w-16 rounded-full" />
                  <AnimatedSkeleton className="h-9 w-20 rounded" />
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>
    </div>
  )
}

function InventoryLoading() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loadingRef.current) {
      const cards = loadingRef.current.children
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      )
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div
        ref={loadingRef}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedCard key={i} className="overflow-hidden">
            <EnhancedCardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <AnimatedSkeleton className="h-4 w-24" />
                <div className="bg-primary/20 h-4 w-4 animate-pulse rounded" />
              </div>
              <AnimatedSkeleton className="mb-2 h-8 w-16" />
              <AnimatedSkeleton className="h-3 w-32" />
            </EnhancedCardContent>
          </EnhancedCard>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-9 w-20 rounded" />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <AnimatedSkeleton key={i} className="h-9 w-24 rounded" />
          ))}
        </div>

        {/* Product List */}
        <EnhancedCard>
          <EnhancedCardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <AnimatedSkeleton className="h-4 w-32" />
                    <AnimatedSkeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <AnimatedSkeleton key={j} className="h-8 w-8 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  )
}

function ActivityLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-3">
        <AnimatedSkeleton className="h-6 w-32" />
        <div className="bg-chart-2/20 h-6 w-12 animate-pulse rounded-full" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <EnhancedCard key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-chart-1/20 h-8 w-8 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <AnimatedSkeleton className="h-4 w-48" />
              <AnimatedSkeleton className="h-3 w-24" />
            </div>
            <AnimatedSkeleton className="h-6 w-16 rounded" />
          </div>
        </EnhancedCard>
      ))}
    </div>
  )
}

function LoadingHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-primary h-8 w-8" />
        </motion.div>
        <div>
          <AnimatedSkeleton className="mb-2 h-8 w-48" />
          {subtitle && <AnimatedSkeleton className="h-4 w-32" />}
        </div>
      </div>
      <AnimatedSkeleton className="h-10 w-24 rounded" />
    </motion.div>
  )
}

export function LoadingScreen({
  title = "Loading",
  subtitle,
  showMetrics = true,
  showAlerts = true,
  showActivity = true,
  showHeader = true,
  className,
  variant = "dashboard"
}: LoadingScreenProps) {
  if (variant === "users") {
    return (
      <AnimatedPage className={className}>
        <div className="space-y-6">
          {showHeader && <LoadingHeader title={title} subtitle={subtitle} />}
          <UsersLoading />
        </div>
      </AnimatedPage>
    )
  }

  if (variant === "inventory") {
    return (
      <AnimatedPage className={className}>
        <div className="space-y-6">
          {showHeader && <LoadingHeader title={title} subtitle={subtitle} />}
          <InventoryLoading />
        </div>
      </AnimatedPage>
    )
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="text-primary h-8 w-8" />
        </motion.div>
      </div>
    )
  }

  if (variant === "simple") {
    return (
      <div className={cn("space-y-6 py-8", className)}>
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="text-primary h-6 w-6" />
          </motion.div>
          <AnimatedSkeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <EnhancedCard key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <AnimatedSkeleton className="h-4 w-3/4" />
                  <AnimatedSkeleton className="h-3 w-1/2" />
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AnimatedPage className={className}>
      <div className="space-y-8">
        {showHeader && <LoadingHeader title={title} subtitle={subtitle} />}
        
        {showMetrics && <MetricsLoading />}
        
        <div className="grid gap-6 lg:grid-cols-2">
          {showAlerts && <ActivityLoading />}
          {showActivity && <ActivityLoading />}
        </div>
      </div>
    </AnimatedPage>
  )
}
