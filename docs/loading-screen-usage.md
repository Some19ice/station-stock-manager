# LoadingScreen Component Usage

The `LoadingScreen` component provides a consistent loading experience across the Station Stock Manager application. It was extracted from the dashboard loading implementation to ensure consistency.

## Import

```typescript
import { LoadingScreen } from "@/components/ui/loading-screen"
```

## Basic Usage

### Dashboard-style Loading (Default)
```typescript
<LoadingScreen 
  title="Dashboard Overview"
  subtitle="Loading your station data..."
/>
```

### Simple Loading
```typescript
<LoadingScreen 
  variant="simple"
  title="Staff Dashboard"
  subtitle="Loading your sales data..."
  showMetrics={false}
  showAlerts={false}
/>
```

### Minimal Loading
```typescript
<LoadingScreen variant="minimal" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Loading"` | Main loading title |
| `subtitle` | `string` | `undefined` | Optional subtitle text |
| `showMetrics` | `boolean` | `true` | Show metrics cards loading |
| `showAlerts` | `boolean` | `true` | Show alerts section loading |
| `showActivity` | `boolean` | `true` | Show activity section loading |
| `showHeader` | `boolean` | `true` | Show animated header |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"dashboard" \| "simple" \| "minimal"` | `"dashboard"` | Loading screen variant |

## Variants

### Dashboard Variant
- Full dashboard-style loading with metrics, alerts, and activity sections
- Animated header with rotating Sparkles icon
- Best for manager dashboard and complex pages

### Simple Variant
- Simplified loading with basic cards
- Centered header with loading animation
- Best for staff pages and simpler interfaces

### Minimal Variant
- Just a spinning refresh icon
- Best for quick loading states and overlays

## Usage in Next.js Routes

### Route-level Loading (loading.tsx)
```typescript
// app/(authenticated)/dashboard/loading.tsx
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function DashboardLoading() {
  return (
    <LoadingScreen 
      title="Dashboard Overview"
      subtitle="Loading your station data..."
    />
  )
}
```

### Component-level Loading
```typescript
"use client"

import { LoadingScreen } from "@/components/ui/loading-screen"

export default function MyComponent() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return (
      <LoadingScreen 
        variant="simple"
        title="Processing"
        subtitle="Please wait..."
      />
    )
  }

  return <div>Your content</div>
}
```

## Customization

### Custom Styling
```typescript
<LoadingScreen 
  className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
  variant="simple"
/>
```

### Conditional Sections
```typescript
<LoadingScreen 
  showMetrics={userRole === 'manager'}
  showAlerts={hasAlerts}
  showActivity={showRecentActivity}
/>
```

## Animation Features

- **GSAP Animations**: Smooth staggered animations for loading elements
- **Framer Motion**: Page entrance animations and micro-interactions
- **Rotating Icons**: Continuous rotation for loading indicators
- **Staggered Loading**: Elements appear with timing delays for smooth experience

## Best Practices

1. **Match the Context**: Use `dashboard` variant for complex pages, `simple` for basic pages, `minimal` for quick states
2. **Consistent Timing**: Keep loading screens visible for at least 300ms to avoid flashing
3. **Meaningful Messages**: Use descriptive titles and subtitles that match the loading context
4. **Progressive Loading**: Show different sections based on what's actually loading

## Examples by Page Type

### Manager Dashboard
```typescript
<LoadingScreen 
  title="Dashboard Overview"
  subtitle="Loading analytics and metrics..."
/>
```

### Staff Interface
```typescript
<LoadingScreen 
  variant="simple"
  title="Sales Interface"
  subtitle="Loading product catalog..."
  showMetrics={false}
/>
```

### Inventory Management
```typescript
<LoadingScreen 
  title="Inventory Management"
  subtitle="Loading stock levels..."
  showActivity={false}
/>
```

### Quick Actions
```typescript
<LoadingScreen variant="minimal" />
```
