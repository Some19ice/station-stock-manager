# Requirements Document

## Introduction

The Station Stock Manager is a Progressive Web App (PWA) designed to replace paper-based inventory tracking for filling stations selling PMS (Premium Motor Spirit) and lubricants. The system provides mobile-first design with offline capability and role-based access, enabling efficient inventory management and sales tracking for filling station operations.

## Requirements

### Requirement 1

**User Story:** As a filling station owner, I want a role-based authentication system, so that I can control access to different features based on user roles (Sales Staff vs Manager).

#### Acceptance Criteria

1. WHEN a user attempts to access the application THEN the system SHALL present a login screen with username and password fields
2. WHEN a user enters valid credentials THEN the system SHALL authenticate the user and redirect them to their role-appropriate dashboard
3. WHEN a Sales Staff user logs in THEN the system SHALL restrict access to sales recording, personal daily summary, and simplified product views only
4. WHEN a Manager user logs in THEN the system SHALL provide full access to all system features including analytics, inventory management, and user management
5. WHEN a user session expires THEN the system SHALL automatically redirect to the login screen
6. WHEN invalid credentials are entered THEN the system SHALL display an appropriate error message

### Requirement 2

**User Story:** As a Sales Staff member, I want a simple and fast sales recording interface, so that I can quickly record customer transactions without complex navigation.

#### Acceptance Criteria

1. WHEN a Sales Staff user accesses the sales interface THEN the system SHALL display product type selection (PMS or Lubricants)
2. WHEN a product type is selected THEN the system SHALL show a searchable/scrollable list of available products
3. WHEN a product is selected THEN the system SHALL allow quantity entry (litres for PMS, units for lubricants)
4. WHEN quantity is entered THEN the system SHALL calculate and display the total price automatically
5. WHEN a sale is confirmed THEN the system SHALL record the transaction with timestamp, automatically deduct stock, and show confirmation
6. WHEN the interface loads THEN the system SHALL display frequently sold items at the top for quick access
7. WHEN recording multiple items THEN the system SHALL allow adding multiple products to one transaction

### Requirement 3

**User Story:** As a Sales Staff member, I want to work offline and sync when connection is available, so that I can continue recording sales even without internet connectivity.

#### Acceptance Criteria

1. WHEN the device goes offline THEN the system SHALL continue to function for sales recording using cached data
2. WHEN sales are recorded offline THEN the system SHALL store transactions in a local queue
3. WHEN internet connection is restored THEN the system SHALL automatically sync queued transactions to the server
4. WHEN offline THEN the system SHALL display a clear offline indicator to the user
5. WHEN sync occurs THEN the system SHALL show sync status and confirmation to the user
6. WHEN sync conflicts occur THEN the system SHALL handle them gracefully without data loss

### Requirement 4

**User Story:** As a Manager, I want a comprehensive dashboard with key metrics, so that I can quickly assess business performance and inventory status.

#### Acceptance Criteria

1. WHEN a Manager logs in THEN the system SHALL display today's key metrics including total sales value, number of transactions, and top-selling products
2. WHEN the dashboard loads THEN the system SHALL show quick status cards for current PMS level, low stock alerts, and active staff count
3. WHEN low stock items exist THEN the system SHALL highlight them prominently on the dashboard
4. WHEN viewing the dashboard THEN the system SHALL provide quick action buttons for adding stock, viewing reports, and recording sales
5. WHEN metrics are displayed THEN the system SHALL update them in real-time as new sales are recorded

### Requirement 5

**User Story:** As a Manager, I want comprehensive product management capabilities, so that I can maintain accurate inventory of both PMS and lubricants.

#### Acceptance Criteria

1. WHEN managing PMS inventory THEN the system SHALL track current volume in litres, price per litre, and daily sales
2. WHEN managing lubricant inventory THEN the system SHALL store product name, brand, type/viscosity, container size, current stock units, unit price, and minimum stock threshold
3. WHEN adding new products THEN the system SHALL allow entry of all required product details
4. WHEN editing existing products THEN the system SHALL allow modification of prices, stock levels, and thresholds
5. WHEN stock levels reach minimum threshold THEN the system SHALL generate automated low-stock alerts
6. WHEN stock updates occur THEN the system SHALL maintain a complete stock movement history

### Requirement 6

**User Story:** As a Manager, I want detailed reporting capabilities, so that I can analyze business performance and make informed decisions.

#### Acceptance Criteria

1. WHEN generating end-of-day reports THEN the system SHALL include sales overview with total value, transactions, and average transaction value
2. WHEN viewing PMS reports THEN the system SHALL show opening stock, litres sold, closing stock, and revenue
3. WHEN viewing lubricant reports THEN the system SHALL display a breakdown by product showing opening stock, sold units, closing stock, and revenue
4. WHEN reviewing staff performance THEN the system SHALL show individual staff transaction counts and total sales values
5. WHEN low stock exists THEN the system SHALL highlight products below minimum threshold in red with recommended reorder quantities
6. WHEN generating reports THEN the system SHALL provide weekly summary, monthly analysis, and staff performance comparisons
7. WHEN reports are complete THEN the system SHALL allow export/print functionality

### Requirement 7

**User Story:** As a Manager, I want inventory management tools, so that I can efficiently handle stock updates, deliveries, and adjustments.

#### Acceptance Criteria

1. WHEN new stock arrives THEN the system SHALL allow adding delivery quantities to existing inventory
2. WHEN stock adjustments are needed THEN the system SHALL support corrections for damage, theft, or counting errors
3. WHEN managing inventory THEN the system SHALL maintain real-time stock levels across all products
4. WHEN viewing inventory THEN the system SHALL display complete stock movement history
5. WHEN stock changes occur THEN the system SHALL automatically update all related calculations and reports
6. WHEN managing suppliers THEN the system SHALL store supplier information for reference

### Requirement 8

**User Story:** As a Manager, I want user account management capabilities, so that I can control staff access and monitor user activity.

#### Acceptance Criteria

1. WHEN managing users THEN the system SHALL allow creation of new staff accounts with unique usernames
2. WHEN creating accounts THEN the system SHALL assign appropriate role permissions (Staff or Manager)
3. WHEN viewing user activity THEN the system SHALL display login history and transaction records per user
4. WHEN managing passwords THEN the system SHALL enforce secure password requirements
5. WHEN users are inactive THEN the system SHALL provide options to disable or remove accounts

### Requirement 9

**User Story:** As a system user, I want a Progressive Web App experience, so that I can use the application like a native mobile app with offline capabilities.

#### Acceptance Criteria

1. WHEN accessing the application THEN the system SHALL function as a PWA with mobile-first responsive design
2. WHEN installing the app THEN the system SHALL allow installation on mobile devices like a native app
3. WHEN using offline THEN the system SHALL cache essential resources and maintain core functionality
4. WHEN the app loads THEN the system SHALL optimize for fast loading with minimal data transfer
5. WHEN using on different devices THEN the system SHALL adapt to all screen sizes appropriately
6. WHEN running THEN the system SHALL optimize battery usage and network efficiency

### Requirement 10

**User Story:** As a system user, I want a comprehensive notification system, so that I can stay informed about important events and system status.

#### Acceptance Criteria

1. WHEN stock levels are low THEN the system SHALL notify Managers with low stock alerts
2. WHEN large transactions occur THEN the system SHALL alert Managers about transactions above set amounts
3. WHEN end-of-day is ready THEN the system SHALL notify Managers when all staff have synced their sales
4. WHEN sync issues occur THEN the system SHALL alert users about data conflicts or connection problems
5. WHEN sales are recorded THEN the system SHALL confirm successful transactions to staff
6. WHEN errors occur THEN the system SHALL display clear, actionable error messages
7. WHEN offline/online status changes THEN the system SHALL indicate current connectivity status