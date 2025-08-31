"use client"

import { useEffect, useRef, ReactNode, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedPageProps {
  children: ReactNode
  className?: string
  animation?:
    | "fadeIn"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "reveal"
    | "splitText"
    | "morphIn"
    | "elastic"
  delay?: number
  duration?: number
  enableScrollTriggers?: boolean
  staggerChildren?: boolean
  childrenDelay?: number
}

export function AnimatedPage({
  children,
  className,
  animation = "fadeIn",
  delay = 0,
  duration = 0.8,
  enableScrollTriggers = true,
  staggerChildren = false,
  childrenDelay = 0.1
}: AnimatedPageProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!pageRef.current) return

    const element = pageRef.current
    const tl = gsap.timeline()

    // Enhanced animation states
    const initialState = {
      fadeIn: { opacity: 0 },
      slideUp: { opacity: 0, y: 50, scale: 0.95 },
      slideLeft: { opacity: 0, x: 50, rotationY: -15 },
      slideRight: { opacity: 0, x: -50, rotationY: 15 },
      scale: { opacity: 0, scale: 0.8, rotation: 5 },
      reveal: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      splitText: { opacity: 0, y: 100, skewY: 10 },
      morphIn: { opacity: 0, scale: 0.5, borderRadius: "50%", rotation: 180 },
      elastic: { opacity: 0, scaleX: 0, transformOrigin: "left center" }
    }

    const finalState = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, y: 0, scale: 1 },
      slideLeft: { opacity: 1, x: 0, rotationY: 0 },
      slideRight: { opacity: 1, x: 0, rotationY: 0 },
      scale: { opacity: 1, scale: 1, rotation: 0 },
      reveal: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
      splitText: { opacity: 1, y: 0, skewY: 0 },
      morphIn: { opacity: 1, scale: 1, borderRadius: "0%", rotation: 0 },
      elastic: { opacity: 1, scaleX: 1 }
    }

    const eases = {
      fadeIn: "power2.out",
      slideUp: "power3.out",
      slideLeft: "back.out(1.2)",
      slideRight: "back.out(1.2)",
      scale: "elastic.out(1, 0.5)",
      reveal: "power2.inOut",
      splitText: "power3.out",
      morphIn: "elastic.out(1, 0.8)",
      elastic: "elastic.out(1.2, 0.4)"
    }

    // Set initial state
    gsap.set(element, initialState[animation])

    // Main animation
    tl.to(element, {
      ...finalState[animation],
      duration:
        animation === "elastic" || animation === "morphIn"
          ? duration * 1.5
          : duration,
      delay,
      ease: eases[animation],
      onComplete: () => setIsVisible(true)
    })

    // Stagger children if enabled
    if (staggerChildren && element.children.length > 0) {
      tl.fromTo(
        element.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: childrenDelay,
          ease: "power2.out"
        },
        "-=0.3"
      )
    }

    // Scroll-triggered animations
    if (enableScrollTriggers && typeof window !== "undefined") {
      ScrollTrigger.batch(element.querySelectorAll("[data-scroll-animate]"), {
        onEnter: elements => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out"
            }
          )
        },
        onLeave: elements => {
          gsap.to(elements, { opacity: 0.3, duration: 0.3 })
        },
        onEnterBack: elements => {
          gsap.to(elements, { opacity: 1, duration: 0.5 })
        }
      })

      // Parallax effects
      gsap.utils
        .toArray(element.querySelectorAll("[data-parallax]"))
        .forEach((elem: unknown) => {
          const element = elem as HTMLElement
          const speed = parseFloat(element.dataset.parallax || "0.5")
          gsap.to(element, {
            yPercent: -50 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          })
        })
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [
    animation,
    delay,
    duration,
    enableScrollTriggers,
    staggerChildren,
    childrenDelay
  ])

  return (
    <div
      ref={pageRef}
      className={cn("w-full", isVisible && "animate-in", className)}
      data-animation={animation}
    >
      {children}
    </div>
  )
}

export function AnimatedGrid({
  children,
  className,
  stagger = 0.1,
  animation = "slideUp",
  enableScrollTrigger = false,
  threshold = "20%"
}: {
  children: ReactNode
  className?: string
  stagger?: number
  animation?: "slideUp" | "slideLeft" | "scale" | "fade" | "flip" | "bounce"
  enableScrollTrigger?: boolean
  threshold?: string
}) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return

    const items = Array.from(gridRef.current.children)

    const animations = {
      slideUp: {
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 }
      },
      slideLeft: {
        from: { opacity: 0, x: 30, rotationY: 15 },
        to: { opacity: 1, x: 0, rotationY: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8, rotation: 5 },
        to: { opacity: 1, scale: 1, rotation: 0 }
      },
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      flip: {
        from: { opacity: 0, rotationX: -90, transformOrigin: "center bottom" },
        to: { opacity: 1, rotationX: 0 }
      },
      bounce: {
        from: { opacity: 0, y: -50, scale: 0.8 },
        to: { opacity: 1, y: 0, scale: 1 }
      }
    }

    const animConfig = animations[animation]

    if (enableScrollTrigger && typeof window !== "undefined") {
      // Scroll-triggered animation
      items.forEach((item, index) => {
        gsap.set(item, animConfig.from)

        ScrollTrigger.create({
          trigger: item,
          start: `top ${threshold}`,
          onEnter: () => {
            gsap.to(item, {
              ...animConfig.to,
              duration: 0.8,
              delay: index * stagger,
              ease:
                animation === "bounce"
                  ? "bounce.out"
                  : animation === "flip"
                    ? "power2.out"
                    : "power3.out"
            })
          }
        })
      })
    } else {
      // Immediate animation
      gsap.fromTo(items, animConfig.from, {
        ...animConfig.to,
        duration: 0.7,
        stagger,
        ease:
          animation === "bounce"
            ? "bounce.out"
            : animation === "flip"
              ? "power2.out"
              : "power3.out",
        delay: 0.2
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [stagger, animation, enableScrollTrigger, threshold])

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  )
}

// New component for scroll-triggered text animations
export function AnimatedText({
  children,
  className,
  animation = "slideUp",
  splitBy = "words",
  stagger = 0.1,
  delay = 0
}: {
  children: ReactNode
  className?: string
  animation?: "slideUp" | "fadeIn" | "typewriter" | "reveal"
  splitBy?: "words" | "chars" | "lines"
  stagger?: number
  delay?: number
}) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current || typeof children !== "string") return

    const element = textRef.current
    const text = children as string

    // Split text based on splitBy parameter
    const splitText = splitBy === "words" ? text.split(" ") : text.split("")

    element.innerHTML = splitText
      .map(
        part =>
          `<span style="display: inline-block;">${part}${splitBy === "words" ? "&nbsp;" : ""}</span>`
      )
      .join("")

    const spans = element.querySelectorAll("span")

    const animations = {
      slideUp: {
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 }
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      typewriter: {
        from: { opacity: 0, scaleX: 0 },
        to: { opacity: 1, scaleX: 1 }
      },
      reveal: {
        from: { opacity: 0, rotationX: -90 },
        to: { opacity: 1, rotationX: 0 }
      }
    }

    const animConfig = animations[animation]

    gsap.fromTo(spans, animConfig.from, {
      ...animConfig.to,
      duration: animation === "typewriter" ? 0.3 : 0.6,
      stagger,
      delay,
      ease: "power2.out"
    })
  }, [children, animation, splitBy, stagger, delay])

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  )
}

// Enhanced loading animation component
export function AnimatedLoader({
  type = "dots",
  size = "md",
  color = "blue"
}: {
  type?: "dots" | "bars" | "pulse" | "spin" | "wave"
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "red" | "gray"
}) {
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaderRef.current) return

    const element = loaderRef.current
    const items = element.children

    const animations = {
      dots: () => {
        gsap.to(items, {
          scale: 1.5,
          duration: 0.6,
          stagger: 0.1,
          yoyo: true,
          repeat: -1,
          ease: "power2.inOut"
        })
      },
      bars: () => {
        gsap.to(items, {
          scaleY: 2,
          duration: 0.8,
          stagger: 0.15,
          yoyo: true,
          repeat: -1,
          ease: "power2.inOut"
        })
      },
      pulse: () => {
        gsap.to(element, {
          scale: 1.2,
          opacity: 0.7,
          duration: 1,
          yoyo: true,
          repeat: -1,
          ease: "power2.inOut"
        })
      },
      spin: () => {
        gsap.to(element, {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: "none"
        })
      },
      wave: () => {
        gsap.to(items, {
          y: -10,
          duration: 0.5,
          stagger: 0.1,
          yoyo: true,
          repeat: -1,
          ease: "power2.inOut"
        })
      }
    }

    animations[type]()
  }, [type])

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    gray: "bg-gray-500"
  }

  const itemCount =
    type === "dots" ? 3 : type === "bars" ? 4 : type === "wave" ? 5 : 1

  return (
    <div ref={loaderRef} className="flex items-center justify-center gap-1">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full",
            sizes[size],
            colors[color],
            type === "bars" && "w-2 rounded-sm"
          )}
        />
      ))}
    </div>
  )
}
