// Dashboard-specific TypeScript type definitions

export interface DashboardError {
  message: string
  code?: string
  timestamp: Date
  context?: Record<string, unknown>
}

export interface LoadingState {
  isLoading: boolean
  isValidating?: boolean
  error?: DashboardError | null
}

export interface CacheOptions {
  ttl?: number
  refreshInterval?: number
  staleWhileRevalidate?: boolean
  maxRetries?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface DashboardCacheHookResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isValidating: boolean
  retryCount: number
  refresh: () => void
  invalidate: () => void
}

export interface MetricCardData {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend: "up" | "down" | "neutral"
  trendValue: string
  variant: "default" | "metric" | "alert" | "feature"
  priority: "high" | "normal"
  bgColor?: string
}

export interface WidgetProps {
  title: string
  isLoading?: boolean
  error?: string | Error | null
  onRetry?: () => void
  className?: string
}

export interface AnimationConfig {
  duration?: number
  delay?: number
  ease?: string
  stagger?: number
}

export interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export interface UserProfile {
  id: string
  username: string
  role: "manager" | "staff" | "admin"
  stationId: string
  permissions: string[]
}

export interface StationInfo {
  id: string
  name: string
  address: string
  isActive: boolean
}

export interface DashboardContext {
  user: UserProfile | null
  station: StationInfo | null
  isLoading: boolean
  error: DashboardError | null
  refresh: () => Promise<void>
}

// Component-specific prop types
export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "metric" | "alert" | "feature"
  hover?: boolean
  glow?: boolean
  magnetic?: boolean
  delay?: number
}

export interface LoadingScreenProps {
  title?: string
  subtitle?: string
  showMetrics?: boolean
  showAlerts?: boolean
  showActivity?: boolean
  showHeader?: boolean
  className?: string
  variant?: "dashboard" | "simple" | "minimal" | "inventory" | "users"
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
}

export interface WidgetErrorProps {
  title: string
  error: string | Error
  onRetry?: () => void
}

// Animation-related types
export interface GSAPTimelineConfig {
  repeat?: number
  yoyo?: boolean
  delay?: number
  duration?: number
  ease?: string
}

export interface AnimatedComponentRef {
  timeline: gsap.core.Timeline | null
  cleanup: () => void
}

// Cache-related types
export interface CacheManager<T = unknown> {
  set(key: string, data: T, ttl?: number): void
  get<U = T>(key: string): U | null
  invalidate(key: string): void
  clear(): void
  isStale(key: string, maxAge?: number): boolean
}

// Hook return types
export interface UseAnimationReturn {
  ref: React.RefObject<HTMLElement>
  isAnimating: boolean
  play: () => void
  pause: () => void
  reset: () => void
}

export interface UseErrorHandlingReturn {
  error: DashboardError | null
  setError: (error: DashboardError | null) => void
  clearError: () => void
  isError: boolean
}

// Utility types
export type ComponentVariant = "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost"
export type ComponentSize = "sm" | "md" | "lg" | "xl"
export type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton"
export type AnimationDirection = "up" | "down" | "left" | "right" | "fade"

// Generic component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  variant?: ComponentVariant
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
}

// Form-related types
export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Data fetching types
export interface FetcherFunction<T> {
  (): Promise<T>
}

export interface MutationFunction<TData, TVariables = void> {
  (variables: TVariables): Promise<TData>
}

export interface QueryOptions<T> extends CacheOptions {
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void
export type ChangeHandler<T = string> = (value: T) => void
export type SubmitHandler<T = Record<string, unknown>> = (data: T) => void | Promise<void>

// Responsive design types
export interface ResponsiveValue<T> {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

export interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
}

// Theme-related types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  destructive: string
  muted: string
  background: string
  foreground: string
  border: string
}

export interface ThemeConfig {
  colors: ThemeColors
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  fontSize: Record<string, string>
  fontWeight: Record<string, number>
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number
  loadTime: number
  interactionTime: number
  memoryUsage?: number
}

export interface PerformanceConfig {
  enableMetrics: boolean
  sampleRate: number
  reportingEndpoint?: string
}
