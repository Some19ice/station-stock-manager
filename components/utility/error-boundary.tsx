"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logError } from "@/lib/utils"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log error for debugging
    logError(error, "React Error Boundary", {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        )
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              An unexpected error occurred. Please try again or contact support
              if the problem persists.
            </AlertDescription>
          </Alert>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 rounded border bg-gray-50 p-2 text-xs whitespace-pre-wrap text-gray-600">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex justify-center gap-2">
            <Button onClick={retry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components to handle async errors
export function useAsyncError() {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary
