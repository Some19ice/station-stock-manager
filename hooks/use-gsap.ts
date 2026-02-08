"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { gsap } from "gsap"

// Register GSAP plugins
if (typeof window !== "undefined") {
  import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger)
  })
}

export function useGSAP() {
  const [mounted, setMounted] = useState(false)
  const ctx = useRef<gsap.Context | null>(null)

  useEffect(() => {
    setMounted(true)
    ctx.current = gsap.context(() => {})
    return () => ctx.current?.revert()
  }, [])

  return mounted ? ctx.current : null
}

export function useFadeInUp(selector: string, delay = 0) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

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
  }, [mounted, ctx, selector, delay])
}

export function useStaggerAnimation(selector: string, childSelector: string) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

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
  }, [mounted, ctx, selector, childSelector])
}

// Enhanced parallax scrolling hook
export function useParallax(selector: string, speed = 0.5) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        gsap.to(selector, {
          yPercent: -50 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: selector,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        })
      })
    }

    loadScrollTrigger()
  }, [mounted, ctx, selector, speed])
}

// Magnetic hover effect hook
export function useMagneticHover(selector: string, strength = 0.3) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    ctx.add(() => {
      const elements = gsap.utils.toArray(selector)

      elements.forEach(element => {
        const el = element as HTMLElement
        const xTo = gsap.quickTo(el, "x", {
          duration: 1,
          ease: "elastic.out(1, 0.3)"
        })
        const yTo = gsap.quickTo(el, "y", {
          duration: 1,
          ease: "elastic.out(1, 0.3)"
        })

        el.addEventListener("mouseenter", () => {
          gsap.to(el, { scale: 1.1, duration: 0.4, ease: "power2.out" })
        })

        el.addEventListener("mouseleave", () => {
          gsap.to(el, { scale: 1, duration: 0.4, ease: "power2.out" })
          xTo(0)
          yTo(0)
        })

        el.addEventListener("mousemove", (e: MouseEvent) => {
          const { clientX, clientY } = e
          const { height, width, left, top } = el.getBoundingClientRect()
          const x = clientX - (left + width / 2)
          const y = clientY - (top + height / 2)

          xTo(x * strength)
          yTo(y * strength)
        })
      })
    })
  }, [mounted, ctx, selector, strength])
}

// Text reveal animation hook
export function useTextReveal(
  selector: string,
  options?: {
    split?: boolean
    stagger?: number
    delay?: number
  }
) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        const elements = gsap.utils.toArray(selector)

        elements.forEach(element => {
          const el = element as HTMLElement
          if (options?.split) {
            // Split text into spans
            const text = el.textContent
            if (!text) return
            const chars = text
              .split("")
              .map((char: string) =>
                char === " "
                  ? "&nbsp;"
                  : `<span class="inline-block">${char}</span>`
              )
              .join("")
            el.innerHTML = chars

            gsap.fromTo(
              `${selector} span`,
              { opacity: 0, y: 50, rotationX: -90 },
              {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.8,
                stagger: options?.stagger || 0.02,
                delay: options?.delay || 0,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: el,
                  start: "top 80%",
                  toggleActions: "play none none reverse"
                }
              }
            )
          } else {
            gsap.fromTo(
              el,
              { opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" },
              {
                opacity: 1,
                y: 0,
                clipPath: "inset(0 0 0% 0)",
                duration: 1.2,
                delay: options?.delay || 0,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 80%",
                  toggleActions: "play none none reverse"
                }
              }
            )
          }
        })
      })
    }

    loadScrollTrigger()
  }, [mounted, ctx, selector, options])
}

// Advanced stagger with multiple animation phases
export function useAdvancedStagger(
  selector: string,
  childSelector: string,
  options?: {
    phase1?: gsap.TweenVars
    phase2?: gsap.TweenVars
    stagger?: number
  }
) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: selector,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })

        tl.fromTo(
          `${selector} ${childSelector}`,
          {
            opacity: 0,
            y: 50,
            scale: 0.8,
            rotationY: -45,
            ...options?.phase1
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            stagger: options?.stagger || 0.1,
            ease: "back.out(1.7)",
            ...options?.phase2
          }
        ).to(
          `${selector} ${childSelector}`,
          {
            y: -10,
            duration: 0.3,
            stagger: options?.stagger || 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          },
          "-=0.3"
        )
      })
    }

    loadScrollTrigger()
  }, [mounted, ctx, selector, childSelector, options])
}

// Smooth scroll progress indicator
export function useScrollProgress(selector: string) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    const loadScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx.add(() => {
        gsap.to(selector, {
          scaleX: 1,
          transformOrigin: "left center",
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            invalidateOnRefresh: true
          }
        })
      })
    }

    loadScrollTrigger()
  }, [mounted, ctx, selector])
}

// Interactive cursor follower
export function useCursorFollower(
  selector: string,
  options?: {
    speed?: number
    scale?: number
    blend?: string
  }
) {
  const [mounted, setMounted] = useState(false)
  const ctx = useGSAP()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ctx || typeof window === "undefined") return

    ctx.add(() => {
      const cursor = document.querySelector(selector) as HTMLElement
      if (!cursor) return

      const xTo = gsap.quickTo(cursor, "x", {
        duration: options?.speed || 0.6,
        ease: "power3"
      })
      const yTo = gsap.quickTo(cursor, "y", {
        duration: options?.speed || 0.6,
        ease: "power3"
      })

      window.addEventListener("mousemove", e => {
        xTo(e.clientX)
        yTo(e.clientY)
      })

      // Interactive elements hover effect
      document.querySelectorAll("button, a, [data-cursor]").forEach(el => {
        el.addEventListener("mouseenter", () => {
          gsap.to(cursor, {
            scale: options?.scale || 2,
            mixBlendMode: options?.blend || "difference",
            duration: 0.3,
            ease: "power2.out"
          })
        })

        el.addEventListener("mouseleave", () => {
          gsap.to(cursor, {
            scale: 1,
            mixBlendMode: "normal",
            duration: 0.3,
            ease: "power2.out"
          })
        })
      })
    })
  }, [mounted, ctx, selector, options])
}

// Page transition animations
export function usePageTransition() {
  const animateIn = useCallback(() => {
    const tl = gsap.timeline()

    tl.set("body", { overflow: "hidden" })
      .from(".page-transition-overlay", {
        yPercent: -100,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .from(
        "main > *",
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.2"
      )
      .set("body", { overflow: "auto" })

    return tl
  }, [])

  const animateOut = useCallback(() => {
    const tl = gsap.timeline()

    tl.to("main > *", {
      opacity: 0,
      y: -30,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.in"
    }).to(
      ".page-transition-overlay",
      {
        yPercent: 100,
        duration: 0.6,
        ease: "power2.inOut"
      },
      "-=0.3"
    )

    return tl
  }, [])

  return { animateIn, animateOut }
}
