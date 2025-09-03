"use client"

import { useEffect, useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar"

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      onClick?: () => void
    }[]
  }[]
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isClient, setIsClient] = useState(false)

  // Default state - all items closed to prevent hydration mismatch
  const defaultOpenState = items.reduce(
    (acc, item) => ({
      ...acc,
      [item.title]: false
    }),
    {} as Record<string, boolean>
  )

  const [openItems, setOpenItems] = useState(defaultOpenState)

  useEffect(() => {
    setIsClient(true)
    // Load saved state from localStorage after client mount
    const saved = localStorage.getItem("sidebar-open-items")
    if (saved) {
      try {
        setOpenItems(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse sidebar state:", error)
      }
    }
  }, [])

  // Handle open/close state changes
  const handleOpenChange = (itemTitle: string, isOpen: boolean) => {
    const newState = { ...openItems, [itemTitle]: isOpen }
    setOpenItems(newState)
    if (isClient) {
      localStorage.setItem("sidebar-open-items", JSON.stringify(newState))
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            {isCollapsed && item.items && item.items.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="data-[state=open]:bg-accent"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-64 p-2"
                  sideOffset={12}
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  {item.items.map(subItem => (
                    <DropdownMenuItem key={subItem.title} asChild>
                      <Link
                        href={subItem.url}
                        className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-sm"
                      >
                        <div className="bg-muted-foreground/50 h-1.5 w-1.5 rounded-full" />
                        {subItem.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Collapsible
                asChild
                open={openItems[item.title] ?? false}
                onOpenChange={isOpen => handleOpenChange(item.title, isOpen)}
                className="group/collapsible"
              >
                <div>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {subItem.onClick ? (
                              <button
                                onClick={subItem.onClick}
                                className="w-full text-left"
                              >
                                <span>{subItem.title}</span>
                              </button>
                            ) : (
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
