"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollIndicatorProps {
  showProgress?: boolean
  showBackToTop?: boolean
  className?: string
}

export function ScrollIndicator({
  showProgress = true,
  showBackToTop = true,
  className
}: ScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTopButton, setShowBackToTopButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setScrollProgress(scrollPercent)
      setShowBackToTopButton(scrollTop > 300)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <>
      {/* Progress bar */}
      {showProgress && (
        <div
          className={cn(
            "from-primary via-secondary to-accent fixed top-0 right-0 left-0 z-50 h-1 bg-gradient-to-r transition-transform duration-100",
            className
          )}
          style={{
            transform: `scaleX(${scrollProgress / 100})`,
            transformOrigin: "0%"
          }}
        />
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <div
          className={cn(
            "fixed right-6 bottom-6 z-40 transition-all duration-300",
            showBackToTopButton
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-80 translate-y-5 pointer-events-none"
          )}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-background/80 border-border/50 border hover:bg-accent/80 hover:scale-110 transition-all duration-300"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  )
}
