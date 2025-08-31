"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, ThumbsUp, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface CustomerFeedback {
  id: string
  type: "complaint" | "compliment" | "suggestion"
  message: string
  timestamp: Date
  resolved: boolean
}

export function CustomerInteractionTracker() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([])
  const [newFeedback, setNewFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"complaint" | "compliment" | "suggestion">("compliment")

  useEffect(() => {
    // Mock data
    setFeedbacks([
      {
        id: "1",
        type: "compliment",
        message: "Customer praised quick service",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        resolved: true
      },
      {
        id: "2", 
        type: "complaint",
        message: "Customer complained about pump speed",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        resolved: false
      }
    ])
  }, [])

  const handleAddFeedback = () => {
    if (!newFeedback.trim()) return

    const feedback: CustomerFeedback = {
      id: Date.now().toString(),
      type: feedbackType,
      message: newFeedback,
      timestamp: new Date(),
      resolved: feedbackType !== "complaint"
    }

    setFeedbacks([feedback, ...feedbacks])
    setNewFeedback("")
    toast.success("Customer feedback recorded")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "complaint": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "compliment": return <ThumbsUp className="h-4 w-4 text-green-500" />
      case "suggestion": return <Star className="h-4 w-4 text-blue-500" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "complaint": return "destructive" as const
      case "compliment": return "default" as const
      case "suggestion": return "secondary" as const
      default: return "outline" as const
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          Customer Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliment">Compliment</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Record customer feedback..."
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            rows={2}
          />

          <Button onClick={handleAddFeedback} size="sm" className="w-full">
            Record Feedback
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="p-2 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getIcon(feedback.type)}
                  <Badge variant={getVariant(feedback.type)} className="text-xs">
                    {feedback.type}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {feedback.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{feedback.message}</p>
            </div>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No customer interactions recorded today
          </p>
        )}
      </CardContent>
    </Card>
  )
}
