"use client"

import { useStationAuth } from "@/hooks/use-station-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, User } from "lucide-react"

interface UserInfoProps {
  /** Whether to show the station name */
  showStation?: boolean
  /** Whether to show the role badge */
  showRole?: boolean
  /** Size variant for the component */
  size?: "sm" | "md" | "lg"
  /** Layout orientation */
  orientation?: "horizontal" | "vertical"
}

/**
 * Component that displays current user information including role and station
 */
export function UserInfo({
  showStation = true,
  showRole = true,
  size = "md",
  orientation = "horizontal"
}: UserInfoProps) {
  const { user, station, isLoading, error } = useStationAuth()

  if (isLoading) {
    return <UserInfoSkeleton size={size} orientation={orientation} />
  }

  if (error || !user) {
    return (
      <div className="text-muted-foreground flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span className="text-sm">Not authenticated</span>
      </div>
    )
  }

  const avatarSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }[size]

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size]

  const badgeSize = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1"
  }[size]

  const isVertical = orientation === "vertical"

  return (
    <div
      className={`flex ${isVertical ? "flex-col items-center space-y-2" : "items-center space-x-3"}`}
    >
      <Avatar className={avatarSize}>
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex ${isVertical ? "flex-col items-center space-y-1" : "flex-col"}`}
      >
        <div
          className={`flex items-center ${isVertical ? "flex-col space-y-1" : "space-x-2"}`}
        >
          <span className={`font-medium ${textSize}`}>{user.username}</span>
          {showRole && (
            <Badge
              variant={user.role === "manager" ? "default" : "secondary"}
              className={badgeSize}
            >
              {user.role}
            </Badge>
          )}
        </div>

        {showStation && station && (
          <div
            className={`text-muted-foreground flex items-center space-x-1 ${textSize}`}
          >
            <Building2 className="h-3 w-3" />
            <span className="max-w-32 truncate">{station.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for use in navigation bars
 */
export function UserInfoCompact() {
  return (
    <UserInfo
      size="sm"
      showStation={false}
      showRole={true}
      orientation="horizontal"
    />
  )
}

/**
 * Card version for use in dashboards or profile sections
 */
export function UserInfoCard() {
  const { user, station, isLoading } = useStationAuth()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <UserInfoSkeleton size="lg" orientation="vertical" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <UserInfo
          size="lg"
          showStation={true}
          showRole={true}
          orientation="vertical"
        />
        {station?.address && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            {station.address}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for user info
 */
function UserInfoSkeleton({
  size,
  orientation
}: {
  size: "sm" | "md" | "lg"
  orientation: "horizontal" | "vertical"
}) {
  const avatarSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }[size]

  const isVertical = orientation === "vertical"

  return (
    <div
      className={`flex ${isVertical ? "flex-col items-center space-y-2" : "items-center space-x-3"}`}
    >
      <Skeleton className={`rounded-full ${avatarSize}`} />
      <div
        className={`flex ${isVertical ? "flex-col items-center space-y-1" : "flex-col space-y-1"}`}
      >
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}
