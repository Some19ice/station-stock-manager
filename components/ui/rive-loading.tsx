"use client"

import { useRive } from "@rive-app/react-canvas"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface RiveLoadingProps {
  message?: string
  className?: string
  onAnimationComplete?: () => void
}

export function RiveLoading({
  message = "Generating report...",
  className = "",
  onAnimationComplete
}: RiveLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const riveRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const { RiveComponent } = useRive({
    src: "/dynamic_loading_animation_collection.riv",
    autoplay: true
  })

  useEffect(() => {
    if (!containerRef.current || !riveRef.current || !textRef.current) return

    const tl = gsap.timeline({
      onComplete: onAnimationComplete
    })

    // Animate in sequence
    tl.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    )
      .fromTo(
        riveRef.current,
        { opacity: 0, rotationY: 180 },
        { opacity: 1, rotationY: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        textRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      )

    return () => {
      tl.kill()
    }
  }, [onAnimationComplete])

  const animateOut = () => {
    if (!containerRef.current) return Promise.resolve()

    return gsap
      .to(containerRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.4,
        ease: "power2.in"
      })
      .then()
  }

  // Expose animateOut method
  useEffect(() => {
    if (containerRef.current) {
      ;(
        containerRef.current as HTMLDivElement & { animateOut?: () => void }
      ).animateOut = animateOut
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <div ref={riveRef} className="mb-6 h-48 w-48">
        <RiveComponent />
      </div>
      <div ref={textRef}>
        <p className="mb-2 text-lg font-medium text-slate-700">{message}</p>
        <p className="text-sm text-slate-500">
          Please wait while we process your request
        </p>
      </div>
    </div>
  )
}
