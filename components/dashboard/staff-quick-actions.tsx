"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Fuel,
  AlertTriangle,
  Clock,
  Calculator,
  FileText,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  badge?: string
  variant?: "default" | "secondary" | "destructive"
}

export function StaffQuickActions() {
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: "fuel-check",
      title: "Fuel Level Check",
      description: "Record tank measurements",
      icon: <Fuel className="h-4 w-4" />,
      action: () => router.push("/staff/fuel-check"),
      variant: "default"
    },
    {
      id: "price-calculator",
      title: "Price Calculator",
      description: "Quick fuel calculations",
      icon: <Calculator className="h-4 w-4" />,
      action: () => {
        /* Open calculator modal */
      },
      variant: "secondary"
    },
    {
      id: "incident-report",
      title: "Report Issue",
      description: "Log equipment or safety issues",
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => router.push("/staff/incident-report"),
      badge: "Important",
      variant: "destructive"
    },
    {
      id: "break-timer",
      title: "Break Timer",
      description: "Track break duration",
      icon: <Clock className="h-4 w-4" />,
      action: () => {
        /* Start break timer */
      },
      variant: "secondary"
    },
    {
      id: "daily-checklist",
      title: "Daily Checklist",
      description: "Complete opening tasks",
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push("/staff/checklist"),
      badge: "3/8 Done",
      variant: "default"
    },
    {
      id: "staff-chat",
      title: "Staff Messages",
      description: "Team communication",
      icon: <Users className="h-4 w-4" />,
      action: () => router.push("/staff/messages"),
      badge: "2 New",
      variant: "default"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <Button
              key={action.id}
              variant="outline"
              className="flex h-auto flex-col items-start gap-2 p-3"
              onClick={action.action}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span className="text-sm font-medium">{action.title}</span>
                </div>
                {action.badge && (
                  <Badge
                    variant={
                      action.variant === "destructive"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-left text-xs">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
