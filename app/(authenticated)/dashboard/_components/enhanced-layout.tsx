"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { CursorWrapper } from "@/components/ui/cursor-wrapper"
import { ScrollIndicator } from "@/components/ui/scroll-indicator"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "./app-sidebar"
import { cn } from "@/lib/utils"

export default function EnhancedDashboardLayout({
  children,
  userData
}: {
  children: React.ReactNode
  userData: {
    name: string
    email: string
    avatar: string
    membership: string
  }
}) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [defaultOpen, setDefaultOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)

    // Read sidebar state from cookie after client mount
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const savedState = getCookieValue("sidebar_state")
    setDefaultOpen(savedState === null ? true : savedState === "true")

    // Create timeline for proper cleanup
    const tl = gsap.timeline()

    // Header entrance animation
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 }
      )
    }

    // Content entrance animation
    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 },
        "-=0.6"
      )
    }

    // Scroll behavior
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      tl.kill() // Cleanup GSAP timeline
    }
  }, [])

  const getBreadcrumbs = () => {
    if (!isClient) return []

    const paths = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    if (paths[0] === "dashboard") {
      breadcrumbs.push({ name: "Dashboard", href: "/dashboard" })

      if (paths[1]) {
        const pageName = paths[1].charAt(0).toUpperCase() + paths[1].slice(1)
        breadcrumbs.push({ name: pageName, href: pathname, current: true })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <>
      {/* Enhanced cursor for desktop */}
      <CursorWrapper size={20} className="hidden lg:block" disabled={false} />

      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar userData={userData} />
        <SidebarInset className="relative">
          {/* Animated background */}
          <AnimatedBackground
            variant="subtle"
            particleCount={30}
            className="pointer-events-none fixed inset-0"
          />

          {/* Enhanced header with glassmorphism */}
          <motion.header
            ref={headerRef}
            className={cn(
              "sticky top-0 z-40 w-full transition-all duration-500",
              scrolled
                ? "bg-background/80 border-border/50 supports-[backdrop-filter]:bg-background/70 border-b shadow-lg backdrop-blur-xl"
                : "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b border-transparent backdrop-blur-md"
            )}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Subtle overlay */}
            <div className="bg-accent/5 absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100" />

            <div className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SidebarTrigger className="hover:bg-accent/50 -ml-1 transition-colors" />
                </motion.div>

                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />

                {isClient && breadcrumbs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                          <motion.div
                            key={`${crumb.href}-${index}`}
                            className="flex items-center"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            {index > 0 && (
                              <BreadcrumbSeparator className="mx-2" />
                            )}
                            <BreadcrumbItem>
                              {crumb.current ? (
                                <BreadcrumbPage className="text-foreground font-medium">
                                  {crumb.name}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  href={crumb.href}
                                  className="hover:text-primary transition-colors"
                                >
                                  {crumb.name}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                          </motion.div>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.header>

          {/* Enhanced content area */}
          <motion.div
            ref={contentRef}
            className="relative flex flex-1 flex-col gap-4 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Enhanced scroll indicator */}
          <ScrollIndicator
            showProgress={true}
            showBackToTop={true}
            showButton={false}
            showFade={true}
          />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
