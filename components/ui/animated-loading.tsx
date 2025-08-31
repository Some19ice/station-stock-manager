"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Skeleton } from "@/components/ui/skeleton"

export function AnimatedSkeleton({ className }: { className?: string }) {
  const skeletonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!skeletonRef.current) return

    gsap.fromTo(
      skeletonRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    )
  }, [])

  return <Skeleton ref={skeletonRef} className={className} />
}

export function AnimatedLoadingGrid({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return

    const items = gridRef.current.children

    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      }
    )
  }, [])

  return <div ref={gridRef}>{children}</div>
}
