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
import { useState, useEffect } from "react"

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

  // Delay showing content to match other sections
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

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
      description: "Process fuel sales, generate receipts, and update inventory levels automatically",
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
      description: "Add new stock, track deliveries, and monitor fuel levels across all tanks",
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
      description: "View sales trends, performance metrics, and generate detailed business reports",
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
      description: "Update pricing, manage product categories, and configure fuel types and services",
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
      description: "Manage staff accounts, set permissions, and track employee performance metrics",
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
      description: "Complete end-of-day procedures, reconcile cash, and generate daily reports",
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
    return (
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-7 w-32" />
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-sm">
        <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setKeyboardMode(!keyboardMode)}
                  className="h-8 w-8 p-0"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle keyboard shortcuts</TooltipContent>
            </Tooltip>

            <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
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
                    <Label className="text-sm font-medium">Action Order</Label>
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
                          <span className="flex-1 text-sm">{action.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action visibility */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Show Actions</Label>
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {sortedActions.map(action => (
            <EnhancedActionCard
              key={action.id}
              action={action}
              showShortcut={keyboardMode}
              isCompleted={completedActions.has(action.id)}
              onClick={handleActionClick}
            />
          ))}
        </div>

        {/* Contextual alerts */}
        <div className="space-y-2">
          {lowStockCount > 0 && (
            <AlertCard
              icon={AlertTriangle}
              title={`${lowStockCount} items need restocking`}
              variant="warning"
              action={{ label: "View Inventory", href: "/dashboard/inventory" }}
            />
          )}

          {pendingTasks > 0 && (
            <AlertCard
              icon={ClockIcon}
              title={`${pendingTasks} pending tasks`}
              variant="info"
              action={{ label: "View Reports", href: "/dashboard/reports" }}
            />
          )}
        </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Enhanced modern action card with shadcn patterns
const EnhancedActionCard: React.FC<{
  action: QuickAction
  showShortcut: boolean
  isCompleted: boolean
  onClick: (action: QuickAction) => void
}> = ({ action, showShortcut, isCompleted, onClick }) => {
  const Icon = action.icon
  const [isHovered, setIsHovered] = useState(false)

  const handlePrimaryAction = () => {
    onClick(action)
  }

  const handleSecondaryAction = (secondaryAction: { action: () => void }) => {
    secondaryAction.action()
  }

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar */}
      {action.progress !== undefined && action.progress > 0 && (
        <div className="absolute top-0 right-0 left-0">
          <Progress value={action.progress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 ${
        isHovered ? 'opacity-5' : 'opacity-0'
      } ${action.color.replace('bg-', 'from-').replace('hover:bg-', 'to-')}`} />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 transition-all duration-300 ${action.color} ${
              isHovered ? 'scale-110 shadow-lg' : ''
            }`}>
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
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    <Sparkles className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                )}
                {isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" />
                )}
              </div>
              <CardDescription className="mt-1 text-sm text-gray-600 leading-relaxed">
                {action.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action.badge && (
              <Badge 
                variant={action.badgeVariant} 
                className="text-xs font-semibold animate-pulse"
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
                    className={`h-8 w-8 p-0 transition-all duration-200 ${
                      isHovered ? 'opacity-100 scale-110' : 'opacity-0'
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-semibold">Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {action.secondaryActions.map((secondaryAction, index) => {
                    const SecondaryIcon = secondaryAction.icon
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleSecondaryAction(secondaryAction)}
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
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

      <CardContent className="pt-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showShortcut && action.shortcut && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="font-mono text-xs border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    {action.shortcut}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Keyboard shortcut</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex gap-2">
            {action.success && (
              <Badge variant="default" className="bg-green-500 text-white animate-pulse">
                <CheckCircle className="mr-1 h-3 w-3" />
                Done
              </Badge>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handlePrimaryAction}
                  disabled={action.loading}
                  size="sm"
                  className={`${action.color} text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Go
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{action.description}</p>
                {action.shortcut && (
                  <p className="mt-1 text-xs opacity-75">Shortcut: {action.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Action stats or additional info */}
        {(action.progress !== undefined || action.badge) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {action.progress !== undefined && (
                <span>Progress: {action.progress}%</span>
              )}
              {action.badge && (
                <span className="font-medium">{action.badge} items</span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform transition-transform duration-700 ${
        isHovered ? 'translate-x-full' : '-translate-x-full'
      }`} style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
    </Card>
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

// Alert card component
const AlertCard: React.FC<{
  icon: React.ElementType
  title: string
  variant: "warning" | "info" | "success"
  action?: { label: string; href: string }
}> = ({ icon: Icon, title, variant, action }) => {
  const variantStyles = {
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800"
  }

  return (
    <div className={`rounded-lg border p-3 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {action && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
