"use client"

import { Button } from "@/components/ui/button"
import { SelectCustomer } from "@/db/schema/customers"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Menu, Moon, Sun, X, Sparkles, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { useMagneticHover } from "@/hooks/use-gsap"

interface HeaderProps {
  userMembership: SelectCustomer["membership"] | null
  userRole?: string
}

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" }
]

export function Header({ userMembership, userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Magnetic hover effects
  // useMagneticHover(logoRef, { strength: 0.3 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !headerRef.current) return

    // Header entrance animation
    const tl = gsap.timeline()
    
    tl.from(".header-logo", {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .from(".header-nav-item", {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.3")
    .from(".header-cta", {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "back.out(1.7)"
    }, "-=0.2")

    // Scroll-based header background
    const handleScroll = () => {
      if (!headerRef.current) return
      
      const scrolled = window.scrollY > 50
      gsap.to(headerRef.current, {
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        duration: 0.3
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [mounted])

  const dashboardUrl = userRole === "manager" ? "/dashboard" : "/staff"

  if (!mounted) {
    return (
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Station Stock Manager</span>
              <div className="flex items-center gap-2">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-foreground text-xl font-bold">
                  Station Manager
                </span>
              </div>
            </Link>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 z-40 transition-all duration-300"
      style={{ top: "var(--banner-height, 0px)" }}
    >
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Station Stock Manager</span>
            <div
              ref={logoRef}
              className="header-logo flex items-center gap-2 transition-transform duration-200"
            >
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-foreground text-xl font-bold">
                Station Manager
              </span>
            </div>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={navRef}
          className="hidden lg:flex lg:gap-x-12"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="header-nav-item text-foreground hover:text-primary text-sm font-semibold leading-6 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div
          ref={ctaRef}
          className="header-cta hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <SignedOut>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup" className="flex items-center gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Button size="sm" asChild>
              <Link href={dashboardUrl} className="flex items-center gap-2">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="mobile-menu fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Station Stock Manager</span>
                <div className="flex items-center gap-2">
                  <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-foreground text-xl font-bold">
                    Station Manager
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <SignedOut>
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Get started
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href={dashboardUrl}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
