"use client"

import { Button } from "@/components/ui/button"
import { SelectCustomer } from "@/db/schema/customers"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Menu, Moon, Sun, X, Sparkles, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { motion, AnimatePresence } from "framer-motion"
import { useMagneticHover } from "@/hooks/use-gsap"

interface HeaderProps {
  userMembership: SelectCustomer["membership"] | null
}

export function Header({ userMembership }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const { theme, setTheme } = useTheme()
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)

  // Enhanced GSAP animations
  useMagneticHover(".nav-link", 0.2)
  useMagneticHover(".header-button", 0.1)

  useEffect(() => {
    setMounted(true)

    // Header entrance animation
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.2 }
      )
    }

    // Scroll behavior
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Update scrolled state
      setScrolled(currentScrollY > 10)

      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Demo", href: "#demo" },
    { name: "Contact", href: "#contact" }
  ]

  return (
    <>
      <motion.header
        ref={headerRef}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-background/80 border-border/50 supports-[backdrop-filter]:bg-background/70 border-b shadow-lg backdrop-blur-xl"
            : "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b border-transparent backdrop-blur-md"
        }`}
        animate={{
          y: headerVisible ? 0 : -100,
          opacity: headerVisible ? 1 : 0
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {/* Animated gradient overlay */}
        <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />

        <nav
          className="relative mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="header-button"
            >
              <Link href="/" className="group -m-1.5 p-1.5">
                <span className="text-primary relative text-xl font-bold transition-all duration-300">
                  Station Stock Manager
                  <motion.div
                    className="bg-primary absolute -bottom-1 left-0 h-0.5"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </span>
              </Link>
            </motion.div>
          </div>
          <div className="flex lg:hidden">
            <motion.button
              type="button"
              className="text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card -m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close menu" : "Open main menu"}
              </span>
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="nav-link group text-foreground hover:text-primary relative px-3 py-2 text-sm font-semibold transition-all duration-300"
                >
                  <span className="relative z-10">{item.name}</span>

                  {/* Hover background */}
                  <motion.div
                    className="bg-primary/10 absolute inset-0 rounded-lg"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Animated underline */}
                  <motion.div
                    className="bg-primary absolute right-3 bottom-0 left-3 h-0.5"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="header-button bg-card/50 hover:bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 180, scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: -180, scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" asChild className="header-button">
                  <Link href="/login">Log in</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="header-button group bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Sign up
                    <motion.div
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </SignedOut>
            <SignedIn>
              {userMembership === "pro" ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="header-button bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Dashboard
                      <motion.div
                        className="inline-block"
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="header-button group bg-accent hover:bg-accent/90 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <Link href="/#pricing" className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 180, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Upgrade
                    </Link>
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="header-button"
              >
                <UserButton />
              </motion.div>
            </SignedIn>
          </div>
        </nav>
      </motion.header>

      {/* Enhanced Mobile menu */}
      <AnimatePresence>
        {mounted && mobileMenuOpen && (
          <>
            {/* Animated Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-foreground/30 fixed inset-0 z-[60] backdrop-blur-md lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Enhanced Menu panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-background/95 border-border/50 fixed inset-y-0 right-0 z-[70] w-full overflow-y-auto border-l px-6 py-6 shadow-2xl backdrop-blur-xl sm:max-w-sm lg:hidden"
            >
              <motion.div
                className="flex items-center justify-between"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/"
                  className="group -m-1.5 p-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-primary text-xl font-bold">
                    Station Stock Manager
                  </span>
                </Link>
                <motion.button
                  type="button"
                  className="text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card -m-2.5 rounded-lg p-2.5 backdrop-blur-sm transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </motion.button>
              </motion.div>
              <div className="mt-8 flow-root">
                <div className="divide-border/30 -my-6 divide-y">
                  <div className="space-y-3 py-6">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="group text-foreground hover:bg-primary/10 hover:text-primary -mx-3 flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span>{item.name}</span>
                          <motion.div
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            whileHover={{ x: 3 }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    className="space-y-4 py-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      className="bg-card/50 hover:bg-card w-full justify-start backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark")
                        setMobileMenuOpen(false)
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {theme === "dark" ? (
                          <motion.div
                            key="sun-mobile"
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            exit={{ rotate: 180, scale: 0 }}
                            className="mr-2"
                          >
                            <Sun className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="moon-mobile"
                            initial={{ rotate: 180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            exit={{ rotate: -180, scale: 0 }}
                            className="mr-2"
                          >
                            <Moon className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </Button>
                    <SignedOut>
                      <Button variant="outline" className="w-full" asChild>
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link
                          href="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      {userMembership === "pro" ? (
                        <Button className="w-full" asChild>
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                        </Button>
                      ) : (
                        <Button className="w-full gap-2" asChild>
                          <Link
                            href="/#pricing"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Sparkles className="h-4 w-4" />
                            Upgrade
                          </Link>
                        </Button>
                      )}
                      <div className="flex justify-center pt-4">
                        <UserButton />
                      </div>
                    </SignedIn>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
