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
import { ScrollIndicator } from "@/components/ui/scroll-indicator"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
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
          <header
            ref={headerRef}
            className={cn(
              "sticky top-0 z-40 w-full transition-all duration-500",
              scrolled
                ? "bg-background/80 border-border/50 supports-[backdrop-filter]:bg-background/70 border-b shadow-lg backdrop-blur-xl"
                : "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b border-transparent backdrop-blur-md"
            )}
          >
            {/* Subtle overlay */}
            <div className="bg-accent/5 absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100" />

            <div className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <div className="transition-transform hover:scale-105 active:scale-95">
                  <SidebarTrigger className="hover:bg-accent/50 -ml-1 transition-colors" />
                </div>

                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />

                {isClient && breadcrumbs.length > 0 && (
                  <div className="opacity-100 transition-opacity duration-300">
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                          <div
                            key={`${crumb.href}-${index}`}
                            className="flex items-center"
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
                          </div>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Enhanced content area */}
          <div
            ref={contentRef}
            className="dashboard-content relative flex flex-1 flex-col gap-4 p-4"
          >
            <div className="dashboard-children">{children}</div>
          </div>

          {/* Enhanced scroll indicator */}
          <ScrollIndicator
            showProgress={true}
            showBackToTop={true}
            showButton={false}
            showFade={false}
          />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
