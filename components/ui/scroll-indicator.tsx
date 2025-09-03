"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ScrollIndicatorProps {
  showProgress?: boolean
  showBackToTop?: boolean
  showButton?: boolean
  showFade?: boolean
  className?: string
}

export function ScrollIndicator({
  showProgress = true,
  showBackToTop = true,
  showButton = true,
  showFade = true,
  className
}: ScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTopButton, setShowBackToTopButton] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

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
        <motion.div
          ref={progressRef}
          className={cn(
            "from-primary via-secondary to-accent fixed top-0 right-0 left-0 z-50 h-1 bg-gradient-to-r",
            className
          )}
          style={{
            scaleX: scrollProgress / 100,
            transformOrigin: "0%"
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: scrollProgress / 100 }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <AnimatePresence>
          {showBackToTopButton && (
            <motion.div
              className="fixed right-6 bottom-6 z-40"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={scrollToTop}
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
                  "bg-background/80 border-border/50 border",
                  "hover:bg-accent/80 hover:scale-110",
                  "transition-all duration-300",
                  showButton ? "block" : "hidden"
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Fade overlay */}
      {showFade && (
        <div className="from-background/80 pointer-events-none fixed inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t to-transparent" />
      )}
    </>
  )
}
