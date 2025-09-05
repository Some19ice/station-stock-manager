"use client"

import { Component, ReactNode, ErrorInfo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  retryCount: number
}

interface WidgetErrorProps {
  title: string
  error: string | Error
  onRetry?: () => void
}

export class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Dashboard error:", error, errorInfo)
    
    // Log additional context for debugging
    console.error("Error boundary context:", {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  handleRetry = (): void => {
    this.setState(prev => ({
      hasError: false,
      error: undefined,
      retryCount: prev.retryCount + 1
    }))
    this.props.onRetry?.()
  }

  private isNetworkError(error?: Error): boolean {
    if (!error) return false
    
    const networkErrorPatterns = [
      'fetch',
      'network',
      'NetworkError',
      'Failed to fetch',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED'
    ]
    
    return networkErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase()) ||
      error.name.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  private getErrorMessage(error?: Error): string {
    if (!error) return "An unknown error occurred"
    
    if (this.isNetworkError(error)) {
      return "Unable to connect to the server. Please check your internet connection."
    }
    
    // Sanitize error messages for user display
    const userFriendlyMessages: Record<string, string> = {
      'ChunkLoadError': 'Failed to load application resources. Please refresh the page.',
      'TypeError': 'A technical error occurred. Please try again.',
      'ReferenceError': 'A technical error occurred. Please try again.',
      'SyntaxError': 'A technical error occurred. Please try again.'
    }
    
    return userFriendlyMessages[error.name] || "An unexpected error occurred while loading the dashboard."
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isNetworkError = this.isNetworkError(this.state.error)
      const errorMessage = this.getErrorMessage(this.state.error)

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              {isNetworkError ? (
                <WifiOff className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              {isNetworkError ? "Connection Error" : "Something went wrong"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-red-600">
                Retry attempt {this.state.retryCount}/3
              </p>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs text-red-600 bg-red-100 p-2 rounded">
                <summary className="cursor-pointer font-medium">
                  Debug Information (Development Only)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {this.state.retryCount >= 3
                  ? "Max retries reached"
                  : "Try Again"}
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
}: WidgetErrorProps): ReactNode {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error'
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-red-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-700" title={errorMessage}>
            {errorMessage.length > 50 ? `${errorMessage.substring(0, 50)}...` : errorMessage}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="h-6 border-red-300 px-2 text-xs text-red-700 hover:bg-red-100"
              title="Retry loading this widget"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
