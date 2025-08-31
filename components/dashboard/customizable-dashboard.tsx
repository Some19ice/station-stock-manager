"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, GripVertical, Eye, EyeOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Widget {
  id: string
  title: string
  component: React.ReactNode
  visible: boolean
  order: number
}

interface CustomizableDashboardProps {
  widgets: Widget[]
  onWidgetToggle: (id: string) => void
  onWidgetReorder: (widgets: Widget[]) => void
}

export function CustomizableDashboard({ 
  widgets, 
  onWidgetToggle, 
  onWidgetReorder 
}: CustomizableDashboardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order)

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWidget || draggedWidget === targetId) return

    const newWidgets = [...widgets]
    const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = newWidgets.findIndex(w => w.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Swap orders
      const draggedOrder = newWidgets[draggedIndex].order
      newWidgets[draggedIndex].order = newWidgets[targetIndex].order
      newWidgets[targetIndex].order = draggedOrder

      onWidgetReorder(newWidgets)
    }
    setDraggedWidget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={isCustomizing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
          
          {isCustomizing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Widgets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {widgets.map(widget => (
                  <DropdownMenuItem
                    key={widget.id}
                    onClick={() => onWidgetToggle(widget.id)}
                    className="flex items-center gap-2"
                  >
                    {widget.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    {widget.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {visibleWidgets.map(widget => (
          <div
            key={widget.id}
            draggable={isCustomizing}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, widget.id)}
            className={`${
              isCustomizing 
                ? 'cursor-move border-2 border-dashed border-gray-300 rounded-lg p-2' 
                : ''
            }`}
          >
            {isCustomizing && (
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <GripVertical className="h-4 w-4" />
                {widget.title}
              </div>
            )}
            {widget.component}
          </div>
        ))}
      </div>
    </div>
  )
}
