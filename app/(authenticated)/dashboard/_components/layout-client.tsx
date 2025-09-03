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
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "./app-sidebar"

export default function DashboardClientLayout({
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
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar userData={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {isClient && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div
                      key={`${crumb.href}-${index}`}
                      className="flex items-center"
                    >
                      {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                      <BreadcrumbItem>
                        {crumb.current ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
