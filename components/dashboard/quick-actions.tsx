import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AnimatedCard } from "@/components/ui/animated-card"
import {
  ShoppingCart,
  ArrowUpIcon,
  ChartBarIcon,
  Package,
  UsersIcon,
  ClockIcon,
  AlertTriangle,
  TrendingUp,
  Star,
  Keyboard,
  Loader2,
  CheckCircle,
  PlusCircle,
  Settings,
  GripVertical,
  Eye,
  EyeOff,
  MoreHorizontal,
  Zap,
  Target,
  Activity,
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Inbox,
  Layers,
  PieChart,
  Receipt,
  RotateCcw,
  Save,
  Search,
  Share,
  Sparkles,
  Timer,
  Truck,
  UserCheck,
  Wrench,
  Upload,
  Edit
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  href: string
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  priority?: "high" | "medium" | "low"
  shortcut?: string
  isNew?: boolean
  role?: "staff" | "manager" | "both"
  loading?: boolean
  success?: boolean
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  progress?: number
  secondaryActions?: Array<{
    label: string
    icon: React.ElementType
    action: () => void
  }>
}

interface QuickActionsProps {
  lowStockCount?: number
  pendingTasks?: number
  userRole?: "staff" | "manager"
  isLoading?: boolean
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  lowStockCount = 0,
  pendingTasks = 0,
  userRole = "manager",
  isLoading = false
}) => {
  const [completedActions, setCompletedActions] = useState<Set<string>>(
    new Set()
  )
  const [keyboardMode, setKeyboardMode] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [customActionSettings, setCustomActionSettings] = useState<
    Record<string, { visible: boolean; order: number }>
  >({})
  const [draggedAction, setDraggedAction] = useState<string | null>(null)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const actionsGridRef = useRef<HTMLDivElement>(null)
  const alertsRef = useRef<HTMLDivElement>(null)

  // Enhanced entrance animations
  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: () => setAnimationComplete(true)
    })

    // Header animation
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      )
    }

    // Grid entrance animation
    if (actionsGridRef.current) {
      tl.fromTo(
        actionsGridRef.current.children,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
          rotationX: -15
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out"
        },
        "-=0.3"
      )
    }

    // Delayed content reveal
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      tl.kill()
    }
  }, [])

  // Ensure content shows even if animation fails
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setShowContent(true)
    }, 500)

    return () => clearTimeout(fallbackTimer)
  }, [])

  // Alerts animation
  useEffect(() => {
    if (alertsRef.current && (lowStockCount > 0 || pendingTasks > 0)) {
      const alertItems = alertsRef.current.children

      gsap.fromTo(
        alertItems,
        { opacity: 0, x: -20, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 1
        }
      )
    }
  }, [lowStockCount, pendingTasks])

  // Load custom settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("quickActionsSettings")
    if (saved) {
      setCustomActionSettings(JSON.parse(saved))
    }
  }, [])

  // Save custom settings to localStorage
  const saveCustomSettings = (
    settings: Record<string, { visible: boolean; order: number }>
  ) => {
    localStorage.setItem("quickActionsSettings", JSON.stringify(settings))
    setCustomActionSettings(settings)
  }

  // Toggle action visibility
  const toggleActionVisibility = (actionId: string, visible: boolean) => {
    const newSettings = {
      ...customActionSettings,
      [actionId]: {
        visible,
        order: customActionSettings[actionId]?.order || 0
      }
    }
    saveCustomSettings(newSettings)
  }

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    setDraggedAction(actionId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedAction || draggedAction === targetId) return

    const draggedOrder = customActionSettings[draggedAction]?.order || 0
    const targetOrder = customActionSettings[targetId]?.order || 0

    const newSettings = { ...customActionSettings }
    newSettings[draggedAction] = {
      ...newSettings[draggedAction],
      order: targetOrder
    }
    newSettings[targetId] = { ...newSettings[targetId], order: draggedOrder }

    saveCustomSettings(newSettings)
    setDraggedAction(null)
  }

  const baseActions: QuickAction[] = [
    {
      id: "record-sale",
      title: "Record Sale",
      description:
        "Process fuel sales, generate receipts, and update inventory levels automatically",
      icon: ShoppingCart,
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/staff/sales",
      shortcut: "Ctrl+S",
      role: "both",
      variant: "default",
      size: "sm",
      priority: "high",
      secondaryActions: [
        {
          label: "View Recent Sales",
          icon: Receipt,
          action: () => console.log("View recent sales")
        },
        {
          label: "Print Receipt",
          icon: FileText,
          action: () => console.log("Print receipt")
        }
      ]
    },
    {
      id: "add-stock",
      title: "Manage Inventory",
      description:
        "Add new stock, track deliveries, and monitor fuel levels across all tanks",
      icon: ArrowUpIcon,
      color: "bg-green-600 hover:bg-green-700",
      href: "/dashboard/inventory",
      shortcut: "Ctrl+A",
      role: "both",
      variant: "default",
      size: "sm",
      priority: "medium",
      secondaryActions: [
        {
          label: "Bulk Import",
          icon: Upload,
          action: () => console.log("Bulk import")
        },
        {
          label: "Delivery History",
          icon: Truck,
          action: () => console.log("Delivery history")
        }
      ]
    },
    {
      id: "view-reports",
      title: "Analytics Dashboard",
      description:
        "View sales trends, performance metrics, and generate detailed business reports",
      icon: BarChart3,
      color: "bg-purple-600 hover:bg-purple-700",
      href: "/dashboard/reports",
      shortcut: "Ctrl+R",
      role: "both",
      variant: "outline",
      size: "sm",
      priority: "medium",
      secondaryActions: [
        {
          label: "Export Data",
          icon: Share,
          action: () => console.log("Export data")
        },
        {
          label: "Schedule Report",
          icon: Calendar,
          action: () => console.log("Schedule report")
        }
      ]
    },
    {
      id: "manage-products",
      title: "Product Catalog",
      description:
        "Update pricing, manage product categories, and configure fuel types and services",
      icon: Package,
      color: "bg-orange-600 hover:bg-orange-700",
      href: "/dashboard/inventory",
      shortcut: "Ctrl+P",
      role: "both",
      variant: "secondary",
      size: "sm",
      priority: "medium",
      secondaryActions: [
        {
          label: "Bulk Edit",
          icon: Edit,
          action: () => console.log("Bulk edit")
        },
        {
          label: "Price Analysis",
          icon: TrendingUp,
          action: () => console.log("Price analysis")
        }
      ]
    },
    {
      id: "staff-management",
      title: "Team Management",
      description:
        "Manage staff accounts, set permissions, and track employee performance metrics",
      icon: UserCheck,
      color: "bg-indigo-600 hover:bg-indigo-700",
      href: "/dashboard/users",
      shortcut: "Ctrl+U",
      role: "manager",
      variant: "default",
      size: "sm",
      priority: "low",
      secondaryActions: [
        {
          label: "Schedule Staff",
          icon: Calendar,
          action: () => console.log("Schedule staff")
        },
        {
          label: "Performance Reports",
          icon: PieChart,
          action: () => console.log("Performance reports")
        }
      ]
    },
    {
      id: "end-of-day",
      title: "Daily Summary",
      description:
        "Complete end-of-day procedures, reconcile cash, and generate daily reports",
      icon: Timer,
      color: "bg-gray-600 hover:bg-gray-700",
      href: "/dashboard/reports",
      shortcut: "Ctrl+E",
      role: "both",
      variant: "ghost",
      size: "sm",
      priority: "high",
      progress: 75, // Example progress for daily tasks
      secondaryActions: [
        {
          label: "Financial Summary",
          icon: DollarSign,
          action: () => console.log("Financial summary")
        },
        {
          label: "Backup Data",
          icon: Save,
          action: () => console.log("Backup data")
        }
      ]
    }
  ]

  // Filter actions based on user role
  const filteredActions = baseActions.filter(
    action => action.role === "both" || action.role === userRole
  )

  // Filter actions based on custom settings and sort
  const visibleActions = filteredActions.filter(action => {
    const settings = customActionSettings[action.id]
    return settings ? settings.visible : true // Default to visible if no settings
  })

  // Sort by custom order, then by priority
  const sortedActions = visibleActions.sort((a, b) => {
    const aSettings = customActionSettings[a.id]
    const bSettings = customActionSettings[b.id]

    // If both have custom order, use that
    if (aSettings?.order !== undefined && bSettings?.order !== undefined) {
      return aSettings.order - bSettings.order
    }

    // Otherwise sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (
      (priorityOrder[b.priority || "low"] || 1) -
      (priorityOrder[a.priority || "low"] || 1)
    )
  })

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const shortcutMap: Record<string, string> = {
          KeyS: "record-sale",
          KeyA: "add-stock",
          KeyR: "view-reports",
          KeyP: "manage-products",
          KeyU: "staff-management",
          KeyE: "end-of-day"
        }

        const actionId = shortcutMap[event.code]
        if (actionId) {
          event.preventDefault()
          const action = sortedActions.find(a => a.id === actionId)
          if (action) {
            window.location.href = action.href
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sortedActions])

  const handleActionClick = (action: QuickAction) => {
    if (action.loading) return

    // Simulate loading state
    setCompletedActions(prev => new Set([...prev, action.id]))

    // Navigate after a brief delay to show feedback
    setTimeout(() => {
      window.location.href = action.href
    }, 500)
  }

  if (isLoading || !showContent) {
    return <EnhancedLoadingState />
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm"
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-accent/5 opacity-50" />
        <div className="absolute top-0 left-1/4 h-32 w-32 animate-pulse rounded-full bg-blue-300/20 blur-xl filter" />
        <div
          className="absolute right-1/4 bottom-0 h-24 w-24 animate-pulse rounded-full bg-purple-300/20 blur-xl filter"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 space-y-6">
          <div
            ref={headerRef}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Quick Actions
                </h3>
                <p className="text-xs leading-none text-gray-600">
                  {sortedActions.length} actions available
                </p>
              </div>
              {animationComplete && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "animate-pulse bg-green-100 text-green-700 transition-all duration-300",
                    hoveredAction && "scale-110"
                  )}
                >
                  Live
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setKeyboardMode(!keyboardMode)}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-300",
                      keyboardMode && "scale-110 bg-blue-100 text-blue-600"
                    )}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle keyboard shortcuts</p>
                  <p className="text-xs opacity-75">Press Tab to navigate</p>
                </TooltipContent>
              </Tooltip>

              <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-300 hover:scale-110",
                      isCustomizing && "bg-gray-100 text-gray-700"
                    )}
                  >
                    <Settings
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isCustomizing && "rotate-90"
                      )}
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Customize Quick Actions</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-muted-foreground text-sm">
                      Drag actions to reorder them, and toggle visibility below.
                    </p>

                    {/* Action ordering */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Action Order
                      </Label>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {sortedActions.map(action => (
                          <div
                            key={action.id}
                            draggable
                            onDragStart={e => handleDragStart(e, action.id)}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, action.id)}
                            className="bg-card hover:bg-accent flex cursor-move items-center gap-3 rounded-lg border p-2"
                          >
                            <GripVertical className="text-muted-foreground h-4 w-4" />
                            <action.icon className="h-4 w-4" />
                            <span className="flex-1 text-sm">
                              {action.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action visibility */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Show Actions
                      </Label>
                      <div className="space-y-3">
                        {baseActions.map(action => {
                          const settings = customActionSettings[action.id]
                          const isVisible = settings ? settings.visible : true

                          return (
                            <div
                              key={action.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <action.icon className="h-4 w-4" />
                                <Label
                                  htmlFor={`action-${action.id}`}
                                  className="text-sm"
                                >
                                  {action.title}
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {isVisible ? (
                                  <Eye className="text-muted-foreground h-4 w-4" />
                                ) : (
                                  <EyeOff className="text-muted-foreground h-4 w-4" />
                                )}
                                <Switch
                                  id={`action-${action.id}`}
                                  checked={isVisible}
                                  onCheckedChange={checked =>
                                    toggleActionVisibility(action.id, checked)
                                  }
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div
            ref={actionsGridRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          >
            {sortedActions.map((action, index) => (
              <EnhancedActionCard
                key={action.id}
                action={action}
                index={index}
                showShortcut={keyboardMode}
                isCompleted={completedActions.has(action.id)}
                onClick={handleActionClick}
                onHover={setHoveredAction}
                isHovered={hoveredAction === action.id}
              />
            ))}
          </div>

          {/* Enhanced contextual alerts */}
          <div ref={alertsRef} className="space-y-3">
            {lowStockCount > 0 && (
              <EnhancedAlertCard
                icon={AlertTriangle}
                title={`${lowStockCount} items need restocking`}
                description="Critical inventory levels detected"
                variant="warning"
                action={{
                  label: "View Inventory",
                  href: "/dashboard/inventory"
                }}
                urgent={lowStockCount > 5}
              />
            )}

            {pendingTasks > 0 && (
              <EnhancedAlertCard
                icon={ClockIcon}
                title={`${pendingTasks} pending tasks`}
                description="Complete these tasks to maintain optimal operations"
                variant="info"
                action={{ label: "View Reports", href: "/dashboard/reports" }}
                urgent={false}
              />
            )}

            {sortedActions.length === 0 && (
              <EnhancedAlertCard
                icon={Sparkles}
                title="All actions completed!"
                description="Great work! Your station is running smoothly."
                variant="success"
                urgent={false}
              />
            )}
          </div>
        </div>

        {/* Floating action indicator */}
        {hoveredAction && (
          <div className="absolute top-4 right-4 z-20">
            <div className="animate-bounce rounded-full bg-blue-600 p-2 shadow-lg">
              <Activity className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Enhanced loading state component
function EnhancedLoadingState() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadingRef.current) return

    const cards = loadingRef.current.querySelectorAll(".loading-card")
    const timeline = gsap.timeline({ repeat: -1 })

    timeline
      .to(cards, {
        scale: 1.02,
        duration: 1.5,
        stagger: 0.1,
        ease: "power2.inOut"
      })
      .to(cards, {
        scale: 1,
        duration: 1.5,
        stagger: 0.1,
        ease: "power2.inOut"
      })
  }, [])

  return (
    <div
      ref={loadingRef}
      className="rounded-xl border border-border/30 bg-card/50 p-6 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-to-r from-blue-200 to-blue-300" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="loading-card overflow-hidden bg-white/70 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-primary/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-8 w-12 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced modern action card with sophisticated animations
const EnhancedActionCard: React.FC<{
  action: QuickAction
  showShortcut: boolean
  isCompleted: boolean
  onClick: (action: QuickAction) => void
  onHover: (actionId: string | null) => void
  isHovered: boolean
  index: number
}> = ({
  action,
  showShortcut,
  isCompleted,
  onClick,
  onHover,
  isHovered,
  index
}) => {
  const Icon = action.icon
  const cardRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [localHover, setLocalHover] = useState(false)
  const [clickAnimation, setClickAnimation] = useState(false)

  // Enhanced entrance animation
  useEffect(() => {
    if (!cardRef.current) return

    const tl = gsap.timeline()

    tl.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotationX: -15,
        transformOrigin: "center bottom"
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        delay: index * 0.15,
        ease: "back.out(1.7)"
      }
    )

    // Icon animation
    if (iconRef.current) {
      tl.fromTo(
        iconRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(2)"
        },
        "-=0.4"
      )
    }
  }, [index])

  // Hover animations
  useEffect(() => {
    if (!cardRef.current || !iconRef.current) return

    if (localHover || isHovered) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        y: -8,
        rotationY: 5,
        duration: 0.3,
        ease: "power2.out"
      })

      gsap.to(iconRef.current, {
        scale: 1.2,
        rotation: 10,
        duration: 0.3,
        ease: "back.out(1.7)"
      })
    } else {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out"
      })

      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }, [localHover, isHovered])

  // Progress animation
  useEffect(() => {
    if (action.progress !== undefined && progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: action.progress / 100,
          duration: 1.5,
          ease: "power2.out",
          delay: index * 0.1 + 0.5
        }
      )
    }
  }, [action.progress, index])

  const handlePrimaryAction = () => {
    setClickAnimation(true)

    // Click animation
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(cardRef.current, {
            scale: localHover ? 1.05 : 1,
            duration: 0.2,
            ease: "back.out(1.7)"
          })
        }
      })
    }

    setTimeout(() => {
      onClick(action)
      setClickAnimation(false)
    }, 200)
  }

  const handleSecondaryAction = (secondaryAction: { action: () => void }) => {
    secondaryAction.action()
  }

  const handleMouseEnter = () => {
    setLocalHover(true)
    onHover(action.id)
  }

  const handleMouseLeave = () => {
    setLocalHover(false)
    onHover(null)
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden border-0 shadow-md backdrop-blur-sm transition-all duration-300",
        "bg-card/90 backdrop-blur-sm",
        "hover:shadow-2xl hover:shadow-blue-500/20",
        action.priority === "high" && "ring-2 ring-blue-200/50",
        clickAnimation && "ring-4 ring-blue-400/50"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced progress bar */}
      {action.progress !== undefined && action.progress > 0 && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gray-200/50">
          <div
            ref={progressRef}
            className="h-full bg-primary shadow-sm"
            style={{ width: "0%" }}
          />
        </div>
      )}

      {/* Multiple animated background layers */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 transition-all duration-500",
          (localHover || isHovered) && "opacity-10",
          action.color.replace("bg-", "from-").replace("hover:bg-", "to-")
        )}
      />

      {/* Ambient glow effect */}
      <div
        className={cn(
          "absolute inset-0 bg-accent/10 opacity-0 transition-opacity duration-300",
          (localHover || isHovered) && "opacity-100"
        )}
      />

      {/* Shimmer effect */}
      <div
        className={cn(
          "absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700",
          (localHover || isHovered) && "translate-x-full opacity-100"
        )}
      />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              ref={iconRef}
              className={cn(
                "rounded-xl p-3 shadow-md transition-all duration-300",
                action.color,
                (localHover || isHovered) && "shadow-xl"
              )}
            >
              {action.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Icon className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-gray-900">
                  {action.title}
                </CardTitle>
                {action.isNew && (
                  <Badge variant="secondary" className="animate-pulse text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                )}
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 animate-bounce text-green-500" />
                )}
              </div>
              <CardDescription className="mt-1 text-sm leading-relaxed text-gray-600">
                {action.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action.badge && (
              <Badge
                variant={action.badgeVariant}
                className="animate-pulse text-xs font-semibold"
              >
                {action.badge}
              </Badge>
            )}

            {action.secondaryActions && action.secondaryActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-300",
                      localHover || isHovered
                        ? "scale-110 opacity-100"
                        : "opacity-0"
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-semibold">
                    Quick Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {action.secondaryActions.map((secondaryAction, index) => {
                    const SecondaryIcon = secondaryAction.icon
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleSecondaryAction(secondaryAction)}
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        <SecondaryIcon className="mr-2 h-4 w-4" />
                        {secondaryAction.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showShortcut && action.shortcut && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs transition-all duration-300",
                      "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                      showShortcut && "animate-pulse border-blue-400"
                    )}
                  >
                    {action.shortcut}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcut</p>
                  <p className="text-xs opacity-75">Press to activate</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex gap-2">
            {action.success && (
              <Badge
                variant="default"
                className="animate-bounce bg-green-500 text-white"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Done
              </Badge>
            )}

            {isCompleted && (
              <Badge
                variant="outline"
                className="animate-pulse border-green-300 bg-green-100 text-green-700"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handlePrimaryAction}
                  disabled={action.loading || clickAnimation}
                  size="sm"
                  className={cn(
                    "rounded-lg px-4 py-2 font-semibold transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50",
                    action.color,
                    "text-white shadow-md",
                    (localHover || isHovered) &&
                      "scale-105 transform shadow-xl",
                    clickAnimation && "scale-95"
                  )}
                >
                  {action.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {action.priority === "high" ? "Go Now" : "Go"}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{action.description}</p>
                {action.shortcut && (
                  <p className="mt-1 text-xs opacity-75">
                    Shortcut: {action.shortcut}
                  </p>
                )}
                <p className="text-xs opacity-75">
                  Priority: {action.priority || "normal"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Enhanced action stats */}
        {(action.progress !== undefined ||
          action.badge ||
          action.priority === "high") && (
          <div className="mt-4 border-t border-gray-100/50 pt-4">
            <div className="flex items-center justify-between text-xs">
              {action.progress !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Progress:</span>
                  <Badge variant="outline" className="text-blue-600">
                    {action.progress}%
                  </Badge>
                </div>
              )}
              {action.badge && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Items:</span>
                  <Badge variant="secondary" className="font-medium">
                    {action.badge}
                  </Badge>
                </div>
              )}
              {action.priority === "high" && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  High Priority
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced alert card component
const EnhancedAlertCard: React.FC<{
  icon: React.ElementType
  title: string
  description?: string
  variant: "warning" | "info" | "success"
  action?: { label: string; href: string }
  urgent?: boolean
}> = ({ icon: Icon, title, description, variant, action, urgent = false }) => {
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!alertRef.current) return

    const tl = gsap.timeline()

    // Entrance animation
    tl.fromTo(
      alertRef.current,
      {
        opacity: 0,
        x: -30,
        scale: 0.9
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.2)"
      }
    )

    // Icon animation
    if (iconRef.current) {
      tl.fromTo(
        iconRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(2)"
        },
        "-=0.3"
      )
    }

    // Urgent pulsing animation
    if (urgent && variant === "warning") {
      gsap.to(alertRef.current, {
        scale: 1.02,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      })
    }
  }, [urgent, variant])

  // Hover animations
  useEffect(() => {
    if (!alertRef.current || !iconRef.current) return

    if (isHovered) {
      gsap.to(alertRef.current, {
        scale: 1.02,
        y: -2,
        duration: 0.3,
        ease: "power2.out"
      })

      gsap.to(iconRef.current, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: "back.out(1.7)"
      })
    } else {
      gsap.to(alertRef.current, {
        scale: urgent ? 1.01 : 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      })

      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }, [isHovered, urgent])

  const variantStyles = {
    warning: {
      container:
        "border-chart-4/30 bg-chart-4/5 shadow-chart-4/20",
      icon: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      description: "text-amber-700"
    },
    info: {
      container:
        "border-chart-2/30 bg-chart-2/5 shadow-chart-2/20",
      icon: "bg-blue-100 text-blue-600",
      title: "text-blue-900",
      description: "text-blue-700"
    },
    success: {
      container:
        "border-chart-1/30 bg-chart-1/5 shadow-chart-1/20",
      icon: "bg-green-100 text-green-600",
      title: "text-green-900",
      description: "text-green-700"
    }
  }

  const styles = variantStyles[variant]

  return (
    <div
      ref={alertRef}
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-md transition-all duration-300",
        styles.container,
        urgent && "animate-pulse ring-2 ring-amber-400/50",
        isHovered && "shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background effects */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            ref={iconRef}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all duration-300",
              styles.icon
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={cn("font-semibold transition-colors", styles.title)}>
              {title}
            </h4>
            {description && (
              <p
                className={cn(
                  "mt-1 text-sm transition-colors",
                  styles.description
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {urgent && (
            <Badge variant="destructive" className="animate-bounce text-xs">
              Urgent
            </Badge>
          )}
          {action && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-3 text-xs font-medium transition-all duration-300",
                "hover:scale-105 hover:shadow-md",
                styles.title
                  .replace("text-", "border-")
                  .replace("text-", "hover:bg-"),
                isHovered && "scale-105 shadow-md"
              )}
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Urgent indicator */}
      {urgent && (
        <div className="absolute top-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r from-red-500 to-orange-500" />
      )}
    </div>
  )
}

// Fallback standard action card for backward compatibility
const ActionCard: React.FC<{
  action: QuickAction
  showShortcut: boolean
  isCompleted: boolean
  onClick: (action: QuickAction) => void
}> = ({ action, showShortcut, isCompleted, onClick }) => {
  const Icon = action.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => onClick(action)}
          disabled={action.loading}
          className={`${action.color} relative h-auto min-h-[60px] w-full flex-col gap-2 rounded-lg p-4 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md`}
        >
          {action.loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : (
            <>
              <Icon className="h-5 w-5" />
              <span className="text-center text-sm leading-tight">
                {action.title}
              </span>
              {showShortcut && action.shortcut && (
                <Badge
                  variant="outline"
                  className="mt-1 border-white/30 bg-white/10 text-xs text-white"
                >
                  {action.shortcut}
                </Badge>
              )}
              {isCompleted && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-300" />
              )}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{action.description}</p>
        {action.shortcut && (
          <p className="mt-1 text-xs">Shortcut: {action.shortcut}</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

// Legacy alert card component (kept for backward compatibility)
const AlertCard: React.FC<{
  icon: React.ElementType
  title: string
  variant: "warning" | "info" | "success"
  action?: { label: string; href: string }
}> = ({ icon: Icon, title, variant, action }) => {
  return (
    <EnhancedAlertCard
      icon={Icon}
      title={title}
      variant={variant}
      action={action}
      urgent={variant === "warning"}
    />
  )
}
