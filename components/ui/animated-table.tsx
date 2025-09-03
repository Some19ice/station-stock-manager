"use client"

import { useEffect, useRef, ReactNode } from "react"
import { gsap } from "gsap"

interface AnimatedTableProps {
  children: ReactNode
  className?: string
}

export function AnimatedTable({ children, className }: AnimatedTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tableRef.current) return

    const rows = tableRef.current.querySelectorAll("tr")

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.2
      }
    )
  }, [children])

  return (
    <div ref={tableRef} className={className}>
      {children}
    </div>
  )
}
