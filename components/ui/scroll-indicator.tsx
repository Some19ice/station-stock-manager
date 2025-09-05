"use client"

import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
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
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setScrollProgress(scrollPercent)
      
      const shouldShow = scrollTop > 300
      if (shouldShow !== showBackToTopButton) {
        setShowBackToTopButton(shouldShow)
        
        if (buttonRef.current) {
          if (shouldShow) {
            gsap.fromTo(
              buttonRef.current,
              { opacity: 0, scale: 0.8, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
            )
          } else {
            gsap.to(buttonRef.current, {
              opacity: 0,
              scale: 0.8,
              y: 20,
              duration: 0.3,
              ease: "power2.in"
            })
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [showBackToTopButton])

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: scrollProgress / 100,
        duration: 0.1,
        ease: "none",
        transformOrigin: "0%"
      })
    }
  }, [scrollProgress])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const handleButtonHover = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.1,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }

  const handleButtonLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }

  return (
    <>
      {/* Progress bar */}
      {showProgress && (
        <div
          ref={progressRef}
          className={cn(
            "from-primary via-secondary to-accent fixed top-0 right-0 left-0 z-50 h-1 bg-gradient-to-r",
            className
          )}
          style={{
            transform: "scaleX(0)",
            transformOrigin: "0%"
          }}
        />
      )}

      {/* Back to top button */}
      {showBackToTop && showBackToTopButton && (
        <div
          ref={buttonRef}
          className="fixed right-6 bottom-6 z-40"
          style={{ opacity: 0 }}
        >
          <Button
            onClick={scrollToTop}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
              "bg-background/80 border-border/50 border",
              "hover:bg-accent/80",
              "transition-colors duration-300",
              showButton ? "block" : "hidden"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Fade overlay */}
      {showFade && (
        <div className="from-background/80 pointer-events-none fixed inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t to-transparent" />
      )}
    </>
  )
}
