"use client"

import type { FC } from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useConnectionStatus } from "@/hooks/use-connection-status"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export const Header: FC<HeaderProps> = ({ className }) => {
  const { user, isLoaded } = useUser()
  const { status, isOnline } = useConnectionStatus()

  // Get user initials for avatar fallback
  const getUserInitials = (
    firstName?: string | null,
    lastName?: string | null
  ) => {
    if (!firstName && !lastName) return "U"
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  // Get user role from metadata or default to 'staff'
  const userRole = (user?.publicMetadata?.role as string) || "staff"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Station Stock Manager
          </h1>
        </div>

        {/* Right side - Connection Status and User Profile */}
        <div className="flex items-center space-x-4">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isOnline ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="hidden text-sm text-gray-600 sm:inline">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* User Profile */}
          {isLoaded && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user.fullName || user.firstName || "User"}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                    <Badge variant="secondary" className="mt-1 w-fit text-xs">
                      {userRole === "manager" ? "Manager" : "Staff"}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <SignOutButton>
                    <div className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Loading state
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          )}
        </div>
      </div>
    </header>
  )
}
