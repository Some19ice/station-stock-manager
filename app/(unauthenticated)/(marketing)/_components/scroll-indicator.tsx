"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, MousePointer, ArrowUp } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { useScrollProgress } from "@/hooks/use-gsap"

interface ScrollIndicatorProps {
  enabledPaths?: string[]
  showFade?: boolean
  showButton?: boolean
  showProgress?: boolean
  showBackToTop?: boolean
}

export function ScrollIndicator({
  enabledPaths = ["/", "/about", "/features", "/pricing"],
  showFade = true,
  showButton = true,
  showProgress = true,
  showBackToTop = true
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()
  const progressBarRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const backToTopRef = useRef<HTMLDivElement>(null)

  // Use GSAP for progress bar
  useScrollProgress(".scroll-progress-bar")

  // Check if current path is enabled
  const isEnabled = enabledPaths.includes(pathname)

  useEffect(() => {
    if (!isEnabled) {
      setShowIndicator(false)
      setShowBackToTopBtn(false)
      return
    }

    const checkScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate scroll progress
      const maxScroll = documentHeight - windowHeight
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      setScrollProgress(progress)

      // Show indicator if there's more content below and we're not at the bottom
      const hasMoreContent = documentHeight > windowHeight
      const notAtBottom = scrollTop + windowHeight < documentHeight - 500
      setShowIndicator(hasMoreContent && notAtBottom)

      // Show back to top button after scrolling past first viewport
      setShowBackToTopBtn(scrollTop > windowHeight * 0.5)
    }

    // Check on mount
    checkScroll()

    // Check on scroll and resize
    window.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)

    // GSAP animations for button
    if (buttonRef.current) {
      gsap.set(buttonRef.current, { opacity: 0, y: 20 })
    }

    return () => {
      window.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [isEnabled])

  useEffect(() => {
    // Animate button entrance/exit with GSAP
    if (buttonRef.current) {
      if (showIndicator) {
        gsap.to(buttonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)"
        })
      } else {
        gsap.to(buttonRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: "power2.in"
        })
      }
    }
  }, [showIndicator])

  useEffect(() => {
    // Animate back to top button
    if (backToTopRef.current) {
      if (showBackToTopBtn) {
        gsap.to(backToTopRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)"
        })
      } else {
        gsap.to(backToTopRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          ease: "power2.in"
        })
      }
    }
  }, [showBackToTopBtn])

  const handleScroll = () => {
    const scrollAmount = window.innerHeight * 0.8
    window.scrollBy({
      top: scrollAmount,
      behavior: "smooth"
    })
  }

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isEnabled) return null

  return (
    <>
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed top-0 right-0 left-0 z-50 h-1">
          <div className="bg-border/20 h-full w-full">
            <motion.div
              ref={progressBarRef}
              className="scroll-progress-bar from-primary to-secondary h-full transform-gpu bg-gradient-to-r"
              style={{
                width: `${scrollProgress}%`,
                transformOrigin: "left center",
                scaleX: 0
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: scrollProgress / 100 }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          {/* Animated sparkle on progress bar */}
          <motion.div
            className="bg-primary absolute top-0 h-1 w-4 opacity-60 blur-sm"
            style={{
              left: `${Math.max(0, scrollProgress - 2)}%`,
              background:
                "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)"
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}

      {/* Fade indicator */}
      {showFade && (
        <AnimatePresence>
          {showIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 hidden h-40 sm:block"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 30%, var(--background) 100%)"
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Enhanced scroll down button */}
      {showButton && (
        <motion.div
          ref={buttonRef}
          className="fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 sm:block"
          style={{ opacity: 0, y: 20 }}
        >
          <motion.button
            animate={{
              y: [0, 12, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onClick={handleScroll}
            className="group flex cursor-pointer flex-col items-center gap-3"
            aria-label="Scroll down for more content"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-card/90 hover:bg-card border-border/50 group-hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-full border-2 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
              {/* Animated background gradient */}
              <div className="from-primary/10 to-secondary/10 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <ChevronDown className="text-muted-foreground group-hover:text-primary relative z-10 h-6 w-6 transition-colors duration-300" />

              {/* Ripple effect */}
              <motion.div
                className="border-primary/30 absolute inset-0 rounded-full border-2 opacity-0"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <MousePointer className="text-primary/60 h-3 w-3" />
              <span className="text-muted-foreground group-hover:text-foreground text-xs font-medium transition-colors duration-300">
                Continue exploring
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <motion.div
          ref={backToTopRef}
          onClick={handleBackToTop}
          className="hover:bg-card/90 border-border/50 hover:border-primary/30 hover:shadow-primary/10 bg-card/80 fixed right-8 bottom-8 z-50 hidden cursor-pointer rounded-full border-2 p-3 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl sm:block"
          style={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <ArrowUp className="text-muted-foreground hover:text-primary h-5 w-5 transition-colors duration-300" />

          {/* Circular progress indicator */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="stroke-border/30"
              strokeWidth="2"
              fill="none"
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
              style={{
                strokeDasharray: `${scrollProgress}, 100`
              }}
            />
          </svg>
        </motion.div>
      )}
    </>
  )
}
