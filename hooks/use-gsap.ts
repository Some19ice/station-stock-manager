"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger)
  })
}

export function useGSAP() {
  const ctx = useRef<gsap.Context | null>(null)

  useEffect(() => {
    ctx.current = gsap.context(() => {})
    return () => ctx.current?.revert()
  }, [])

  return ctx.current
}

export function useFadeInUp(selector: string, delay = 0) {
  const ctx = useGSAP()

  useEffect(() => {
    if (!ctx) return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        gsap.fromTo(
          selector,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: selector,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })
    }

    loadScrollTrigger()
  }, [ctx, selector, delay])
}

export function useStaggerAnimation(selector: string, childSelector: string) {
  const ctx = useGSAP()

  useEffect(() => {
    if (!ctx) return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        gsap.fromTo(
          `${selector} ${childSelector}`,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: selector,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })
    }

    loadScrollTrigger()
  }, [ctx, selector, childSelector])
}
