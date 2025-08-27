---
inclusion: fileMatch
fileMatchPattern: '**/station-stock-manager/**'
---

# Station Stock Manager - Development Standards

## Code Standards

### Database Schema Conventions
- Use `uuid` for all primary keys with `defaultRandom()`
- Include `createdAt` and `updatedAt` timestamps on all tables
- Use descriptive enum types (e.g., `userRole`, `productType`, `syncStatus`)
- Follow existing naming conventions from the SaaS template
- Use decimal type for monetary values: `decimal("amount", { precision: 10, scale: 2 })`

### TypeScript Standards
- Define interfaces for all data models
- Use strict typing for all function parameters and returns
- Create separate types for Insert/Select/Update operations
- Use enums for fixed value sets (roles, product types, etc.)
- Include proper JSDoc comments for complex business logic

### Component Architecture
- Follow existing SaaS template patterns
- Use Server Components by default, Client Components only when needed
- Implement proper loading states and error boundaries
- Use Shadcn UI components consistently
- Follow mobile-first responsive design principles

### Server Actions Standards
- Always validate input data using Zod or similar
- Include proper error handling with user-friendly messages
- Use database transactions for multi-table operations
- Return consistent response format: `{ isSuccess: boolean; data?: T; error?: string }`
- Include proper authentication and authorization checks

## PWA Implementation Standards

### Service Worker
- Use Workbox for service worker management
- Implement cache-first strategy for static assets
- Use network-first strategy for API calls
- Include background sync for offline transactions
- Handle cache versioning and updates properly

### Offline Storage
- Use IndexedDB for structured data (transactions, products)
- Use LocalStorage for simple key-value pairs (user preferences)
- Implement proper data expiration and cleanup
- Include data compression for large datasets
- Handle storage quota limits gracefully

### Sync Strategy
- Queue offline transactions with unique temporary IDs
- Implement exponential backoff for failed sync attempts
- Handle conflict resolution with last-write-wins + user override
- Provide clear sync status indicators to users
- Log sync operations for debugging

## Security Standards

### Authentication & Authorization
- Leverage existing Clerk authentication
- Implement role-based middleware for route protection
- Validate user permissions on every server action
- Use secure session management
- Include proper CSRF protection

### Data Validation
- Validate all inputs on both client and server
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for API endpoints
- Include proper error handling without information leakage

### Business Logic Security
- Prevent negative stock levels through validation
- Ensure only managers can void/correct transactions
- Validate price calculations on server side
- Include audit logging for sensitive operations
- Implement proper data access controls

## Testing Standards

### Unit Testing
- Test all server actions with various input scenarios
- Mock external dependencies (database, Clerk)
- Test business logic calculations (stock, pricing)
- Include edge cases and error conditions
- Achieve minimum 80% code coverage

### Integration Testing
- Test complete API workflows
- Test database operations with real data
- Test authentication and authorization flows
- Test offline sync scenarios
- Include performance testing for large datasets

### E2E Testing
- Test complete user journeys for both roles
- Test PWA installation and offline functionality
- Test cross-browser compatibility
- Test mobile responsiveness
- Include accessibility testing

## Performance Standards

### Database Performance
- Use appropriate indexes for frequently queried columns
- Implement pagination for large data sets
- Use database transactions efficiently
- Monitor query performance and optimize slow queries
- Include proper connection pooling

### Frontend Performance
- Implement lazy loading for large components
- Use React.memo for expensive components
- Optimize bundle size with proper code splitting
- Include proper loading states and skeleton screens
- Monitor Core Web Vitals and optimize accordingly

### PWA Performance
- Minimize service worker cache size
- Implement efficient sync strategies
- Optimize offline storage usage
- Include proper background task management
- Monitor battery usage and optimize

## Error Handling Standards

### User-Facing Errors
- Provide clear, actionable error messages
- Use toast notifications for temporary messages
- Include proper form validation feedback
- Handle network errors gracefully
- Provide offline indicators and guidance

### System Errors
- Log all errors with proper context
- Include error tracking and monitoring
- Implement proper error boundaries
- Handle database connection failures
- Include proper fallback mechanisms

### Sync Errors
- Handle conflict resolution gracefully
- Provide manual resolution options when needed
- Include retry mechanisms with backoff
- Log sync failures for debugging
- Notify users of sync status changes

## Deployment Standards

### Environment Configuration
- Use environment variables for all configuration
- Include proper staging and production environments
- Implement proper secret management
- Include database migration strategies
- Use proper CI/CD pipelines

### Monitoring & Logging
- Include application performance monitoring
- Log business-critical operations
- Monitor PWA installation and usage
- Track sync success/failure rates
- Include user analytics (privacy-compliant)

### Backup & Recovery
- Implement regular database backups
- Include disaster recovery procedures
- Test backup restoration processes
- Monitor data integrity
- Include proper data retention policies