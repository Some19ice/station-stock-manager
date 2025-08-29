# Implementation Plan

- [-] 1. Create shared header component with user profile and connection status
  - Create `components/layout/header.tsx` with Station Stock Manager branding, user profile display, and online/offline status indicator
  - Implement connection status hook `hooks/use-connection-status.ts` to track online/offline state
  - Add user profile dropdown with logout functionality
  - Style header with clean white background, subtle shadow, and proper spacing
  - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3, 3.5_

- [ ] 2. Implement Sales Staff dashboard view components
  - [ ] 2.1 Create primary action button component
    - Build `components/dashboard/primary-action-button.tsx` with prominent "Record New Sale" styling
    - Use deep navy blue (#1e3a8a) background with hover effects and shadow
    - Ensure minimum 44px touch target for mobile accessibility
    - Add loading and disabled states for action feedback
    - _Requirements: 1.1, 1.6, 4.2, 5.4, 8.3_

  - [ ] 2.2 Build quick stats bar component
    - Create `components/dashboard/quick-stats-bar.tsx` to display daily sales and transaction count
    - Format Nigerian Naira currency properly with thousand separators
    - Use responsive grid layout for mobile and desktop views
    - Implement real-time updates when new sales are recorded
    - _Requirements: 1.2, 4.1, 5.2, 6.5_

  - [ ] 2.3 Develop frequently sold products grid
    - Build `components/dashboard/frequently-sold-products.tsx` with product cards
    - Display product name, price, stock level indicators (green/yellow/red dots), and "Sell This" buttons
    - Implement responsive grid (2 columns mobile, 3 columns tablet+)
    - Add hover effects and touch-friendly interactions
    - _Requirements: 1.3, 1.4, 4.2, 6.2, 6.3_

  - [ ] 2.4 Create recent activity feed component
    - Build `components/dashboard/recent-activity-feed.tsx` for last 5 transactions
    - Display timestamp, product name, quantity, and amount in compact format
    - Use scannable list design with proper spacing and typography
    - Implement auto-refresh for real-time updates
    - _Requirements: 1.5, 5.2, 7.4_

- [ ] 3. Implement Manager dashboard view components
  - [ ] 3.1 Create metrics cards component
    - Build `components/dashboard/metrics-cards.tsx` with 4 key metric cards
    - Display today's sales, active stock, transactions, and staff count
    - Add percentage changes and trending arrows (up/down/neutral)
    - Use appropriate colors for different metric types and trends
    - Implement responsive grid layout (1 column mobile, 2 tablet, 4 desktop)
    - _Requirements: 2.1, 2.5, 6.2, 6.3, 6.5_

  - [ ] 3.2 Build quick actions hub component
    - Create `components/dashboard/quick-actions-hub.tsx` with 6 primary action buttons
    - Include Record Sale, Add Stock, View Reports, Manage Products, Staff Management, End-of-Day Summary
    - Use distinct colors for different action types (blue, green, purple, orange, indigo, gray)
    - Ensure consistent button sizing and proper touch targets
    - _Requirements: 2.2, 4.2, 6.1, 6.2, 8.3_

  - [ ] 3.3 Develop low stock alerts component
    - Build `components/dashboard/low-stock-alerts.tsx` with red warning indicators
    - Display products below minimum threshold with urgency levels
    - Show current stock, minimum threshold, and recommended reorder quantities
    - Use red (#dc2626) for critical alerts and amber (#d97706) for warnings
    - _Requirements: 2.3, 6.4, 6.2, 6.3_

  - [ ] 3.4 Create live activity feed component
    - Build `components/dashboard/live-activity-feed.tsx` for all staff sales monitoring
    - Display real-time feed of staff actions with timestamps and details
    - Implement auto-scroll and update functionality
    - Use clean, scannable format with staff identification
    - _Requirements: 2.4, 5.2, 7.4_

- [ ] 4. Create role-based routing and page structure
  - [ ] 4.1 Implement staff dashboard page
    - Create `app/(authenticated)/staff/page.tsx` with Sales Staff view layout
    - Integrate primary action button, quick stats, frequently sold products, and recent activity components
    - Add proper error boundaries and loading states
    - Ensure mobile-first responsive design with proper spacing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.4_

  - [ ] 4.2 Build manager dashboard page
    - Create updated `app/(authenticated)/dashboard/page.tsx` with Manager view layout
    - Integrate metrics cards, quick actions hub, low stock alerts, and live activity feed
    - Implement proper grid layouts for different screen sizes
    - Add comprehensive error handling and loading states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.4_

  - [ ] 4.3 Update authentication middleware for role-based routing
    - Modify `middleware.ts` to redirect users to appropriate dashboard based on role
    - Ensure staff users access `/staff` and managers access `/dashboard`
    - Add proper error handling for users without assigned roles
    - Implement session validation and automatic logout for expired sessions
    - _Requirements: 3.2, 7.1_

- [ ] 5. Replace marketing template with simplified authentication flow
  - [ ] 5.1 Simplify unauthenticated marketing pages
    - Replace `app/(unauthenticated)/(marketing)/page.tsx` with simple login redirect
    - Remove all generic SaaS template sections (hero, features, pricing, etc.)
    - Create minimal landing page that redirects to login for unauthenticated users
    - Keep only essential branding and login/signup links
    - _Requirements: 3.5_

  - [ ] 5.2 Update navigation and layout components
    - Remove marketing-specific navigation from `app/(unauthenticated)/(marketing)/_components/header.tsx`
    - Simplify footer to remove generic template content
    - Update layout components to focus on authentication flow
    - Remove unused marketing section components
    - _Requirements: 3.5_

- [ ] 6. Implement visual design system and styling
  - [ ] 6.1 Create design system CSS variables
    - Add color palette CSS variables to `app/globals.css` with primary, success, warning, danger colors
    - Define typography scale with display, heading, body, and caption styles
    - Create spacing system with consistent margin and padding utilities
    - Implement component-specific styling classes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 6.2 Style header component with design system
    - Apply clean white background with subtle shadow to header
    - Use proper typography hierarchy for branding and user information
    - Implement connection status indicator with green/red dot styling
    - Add hover effects and transitions for interactive elements
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 6.5_

  - [ ] 6.3 Apply consistent styling to dashboard components
    - Style all dashboard components with design system colors and typography
    - Implement proper card designs with subtle borders and shadows
    - Add hover effects and interactive states for all buttons and cards
    - Ensure consistent spacing and alignment across all components
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Implement responsive design and mobile optimization
  - [ ] 7.1 Add responsive breakpoints and mobile-first styling
    - Implement mobile-first CSS with proper breakpoints (768px tablet, 1024px desktop)
    - Create responsive grid layouts for all dashboard components
    - Ensure proper touch targets (minimum 44px) for all interactive elements
    - Add mobile-specific optimizations for button sizes and spacing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.3_

  - [ ] 7.2 Optimize for touch interactions and mobile performance
    - Add touch-friendly hover states and active states for mobile
    - Implement proper focus management for keyboard navigation
    - Optimize loading performance with skeleton screens and lazy loading
    - Add mobile-specific gestures and interactions where appropriate
    - _Requirements: 4.2, 4.5, 7.2, 7.3, 7.5_

- [ ] 8. Add accessibility features and error handling
  - [ ] 8.1 Implement comprehensive accessibility features
    - Add proper ARIA labels and semantic HTML structure to all components
    - Ensure full keyboard navigation support for all interactive elements
    - Implement high contrast ratios and screen reader compatibility
    - Add focus indicators and proper tab order throughout the interface
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [ ] 8.2 Create error boundaries and loading states
    - Implement dashboard error boundary component with user-friendly error messages
    - Add loading skeletons for all dashboard components during data fetching
    - Create connection error handling with retry mechanisms
    - Add proper error messaging for failed actions with recovery options
    - _Requirements: 5.1, 5.3, 5.5, 5.6, 7.6_

- [ ] 9. Integrate with existing authentication and data systems
  - [ ] 9.1 Connect dashboard components to existing server actions
    - Integrate dashboard components with existing `actions/dashboard.ts` for metrics data
    - Connect sales components to `actions/sales.ts` for transaction data
    - Link product components to `actions/products.ts` for inventory information
    - Ensure proper error handling and loading states for all data operations
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.3, 2.4, 5.2_

  - [ ] 9.2 Implement real-time updates and sync functionality
    - Add real-time updates for metrics and activity feeds using existing infrastructure
    - Implement proper data refresh patterns for dashboard components
    - Connect offline/online status to existing PWA sync functionality
    - Add proper cache invalidation and data consistency handling
    - _Requirements: 5.2, 7.4, 3.3, 3.4_

- [ ] 10. Write comprehensive tests for new components
  - [ ] 10.1 Create unit tests for all dashboard components
    - Write tests for header component with user profile and connection status
    - Test all Sales Staff dashboard components (action button, stats, products, activity)
    - Test all Manager dashboard components (metrics, actions, alerts, activity)
    - Ensure proper role-based rendering and interaction testing
    - _Requirements: All requirements - testing coverage_

  - [ ] 10.2 Add integration tests for role-based routing
    - Test role-based redirection for staff and manager users
    - Verify proper authentication flow and unauthorized access handling
    - Test responsive behavior across different screen sizes
    - Add accessibility testing for keyboard navigation and screen readers
    - _Requirements: 3.2, 4.1, 4.3, 8.1, 8.2, 8.4_