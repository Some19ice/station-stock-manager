"use client"

import { Component, ReactNode, ErrorInfo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: undefined,
      retryCount: prev.retryCount + 1 
    }))
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isNetworkError = this.state.error?.message.includes('fetch') || 
                            this.state.error?.message.includes('network')
      
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              {isNetworkError ? <WifiOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              {isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection.'
                : 'An unexpected error occurred while loading the dashboard.'
              }
            </p>
            
            {this.state.retryCount > 0 && (
              <p className="text-xs text-red-600">
                Retry attempt {this.state.retryCount}/3
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Simplified error component for individual widgets
export function WidgetError({ 
  title, 
  error, 
  onRetry 
}: { 
  title: string
  error: string
  onRetry?: () => void 
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-red-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-700">{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
