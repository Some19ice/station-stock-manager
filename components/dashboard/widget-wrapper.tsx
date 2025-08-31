"use client"

import { Component, ReactNode, ErrorInfo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  title: string
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget error in ${this.props.title}:`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {this.props.title} Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-red-700">
              Widget failed to load. Try refreshing.
            </p>
            <Button
              onClick={this.handleRetry}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function WidgetWrapper({ children, title, onRetry }: Props) {
  return (
    <WidgetErrorBoundary title={title} onRetry={onRetry}>
      {children}
    </WidgetErrorBoundary>
  )
}
