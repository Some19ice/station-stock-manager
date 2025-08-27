---
inclusion: fileMatch
fileMatchPattern: '**/station-stock-manager/**'
---

# Station Stock Manager - Implementation Guidelines

## Task Execution Guidelines

### Before Starting Any Task
1. **Read Context**: Always review the requirements, design, and task details
2. **Understand Dependencies**: Check which previous tasks must be completed first
3. **Plan Approach**: Break down the task into smaller, testable steps
4. **Set Up Tests**: Write tests before or alongside implementation (TDD approach)

### During Implementation
1. **Follow Incremental Development**: Make small, working changes
2. **Test Continuously**: Run tests after each significant change
3. **Maintain Data Integrity**: Ensure all database operations are consistent
4. **Handle Errors Gracefully**: Include proper error handling and user feedback
5. **Document Complex Logic**: Add comments for business rules and calculations

### After Completing a Task
1. **Run Full Test Suite**: Ensure no regressions were introduced
2. **Test User Workflows**: Verify the feature works end-to-end
3. **Update Documentation**: Update any relevant documentation
4. **Mark Task Complete**: Update the task status in tasks.md

## Common Implementation Patterns

### Server Action Pattern
```typescript
"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { z } from "zod"

const inputSchema = z.object({
  // Define input validation
})

export async function actionName(input: z.infer<typeof inputSchema>) {
  try {
    // 1. Validate input
    const validatedInput = inputSchema.parse(input)
    
    // 2. Check authentication
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, error: "Unauthorized" }
    }
    
    // 3. Check permissions (if needed)
    const userRole = await getUserRole(userId)
    if (userRole !== 'manager') {
      return { isSuccess: false, error: "Insufficient permissions" }
    }
    
    // 4. Perform database operations
    const result = await db.transaction(async (tx) => {
      // Database operations here
    })
    
    // 5. Return success response
    return { isSuccess: true, data: result }
    
  } catch (error) {
    console.error("Error in actionName:", error)
    return { isSuccess: false, error: "Operation failed" }
  }
}
```

### Component Pattern
```typescript
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function ComponentName() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground mt-2">Page description</p>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <DataComponent />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
```

### Database Schema Pattern
```typescript
import { pgTable, uuid, text, decimal, timestamp, boolean } from "drizzle-orm/pg-core"

export const tableName = pgTable("table_name", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Foreign key reference
  parentId: uuid("parent_id").references(() => parentTable.id).notNull(),
  // Required fields
  name: text("name").notNull(),
  // Optional fields
  description: text("description"),
  // Monetary values
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // Status fields
  isActive: boolean("is_active").default(true).notNull(),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertTableName = typeof tableName.$inferInsert
export type SelectTableName = typeof tableName.$inferSelect
```

## PWA Implementation Guidelines

### Service Worker Setup
1. Use Next.js PWA plugin or Workbox
2. Implement proper caching strategies
3. Handle service worker updates gracefully
4. Include background sync for offline operations
5. Test offline functionality thoroughly

### Offline Storage Implementation
```typescript
// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'station-stock-db'
  private version = 1
  
  async storeTransaction(transaction: OfflineTransaction) {
    // Store transaction in IndexedDB
  }
  
  async getQueuedTransactions(): Promise<OfflineTransaction[]> {
    // Retrieve queued transactions
  }
  
  async clearSyncedTransactions(transactionIds: string[]) {
    // Remove successfully synced transactions
  }
}
```

### Sync Implementation
```typescript
// Background sync handler
export async function syncOfflineData() {
  const offlineStorage = new OfflineStorage()
  const queuedTransactions = await offlineStorage.getQueuedTransactions()
  
  for (const transaction of queuedTransactions) {
    try {
      await syncTransaction(transaction)
      await offlineStorage.clearSyncedTransactions([transaction.tempId])
    } catch (error) {
      // Handle sync failure
      console.error('Sync failed for transaction:', transaction.tempId, error)
    }
  }
}
```

## Business Logic Implementation

### Stock Management
```typescript
export async function updateStock(
  productId: string, 
  quantity: number, 
  movementType: 'sale' | 'adjustment' | 'delivery'
) {
  return await db.transaction(async (tx) => {
    // 1. Get current stock
    const product = await tx.query.products.findFirst({
      where: eq(products.id, productId)
    })
    
    if (!product) {
      throw new Error('Product not found')
    }
    
    // 2. Calculate new stock
    const newStock = product.currentStock + quantity
    
    // 3. Validate stock levels
    if (newStock < 0) {
      throw new Error('Insufficient stock')
    }
    
    // 4. Update product stock
    await tx.update(products)
      .set({ 
        currentStock: newStock,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
    
    // 5. Record stock movement
    await tx.insert(stockMovements).values({
      productId,
      movementType,
      quantity,
      previousStock: product.currentStock,
      newStock
    })
    
    return { previousStock: product.currentStock, newStock }
  })
}
```

### Sales Recording
```typescript
export async function recordSale(saleData: CreateSaleData) {
  return await db.transaction(async (tx) => {
    // 1. Create transaction record
    const [transaction] = await tx.insert(transactions).values({
      stationId: saleData.stationId,
      userId: saleData.userId,
      totalAmount: saleData.totalAmount
    }).returning()
    
    // 2. Process each item
    for (const item of saleData.items) {
      // Create transaction item
      await tx.insert(transactionItems).values({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })
      
      // Update stock
      await updateStock(item.productId, -item.quantity, 'sale')
    }
    
    return transaction
  })
}
```

## Testing Implementation

### Unit Test Example
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals'
import { updateStock } from '@/actions/inventory'

describe('updateStock', () => {
  beforeEach(async () => {
    // Set up test data
  })
  
  it('should update stock levels correctly', async () => {
    const result = await updateStock('product-id', 10, 'delivery')
    
    expect(result.isSuccess).toBe(true)
    expect(result.data?.newStock).toBe(110) // Assuming previous stock was 100
  })
  
  it('should prevent negative stock', async () => {
    const result = await updateStock('product-id', -200, 'sale')
    
    expect(result.isSuccess).toBe(false)
    expect(result.error).toContain('Insufficient stock')
  })
})
```

### Integration Test Example
```typescript
import { test, expect } from '@playwright/test'

test('staff can record a sale', async ({ page }) => {
  // Login as staff user
  await page.goto('/login')
  await page.fill('[data-testid="username"]', 'staff-user')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login-button"]')
  
  // Navigate to sales
  await page.click('[data-testid="record-sale"]')
  
  // Select product type
  await page.click('[data-testid="product-type-pms"]')
  
  // Select product
  await page.click('[data-testid="product-premium-pms"]')
  
  // Enter quantity
  await page.fill('[data-testid="quantity-input"]', '50')
  
  // Confirm sale
  await page.click('[data-testid="confirm-sale"]')
  
  // Verify success
  await expect(page.locator('[data-testid="sale-success"]')).toBeVisible()
})
```

## Common Pitfalls to Avoid

1. **Database Transactions**: Always use transactions for multi-table operations
2. **Stock Validation**: Always validate stock levels before allowing sales
3. **Role Permissions**: Check user permissions on every sensitive operation
4. **Offline Conflicts**: Handle sync conflicts gracefully with user input when needed
5. **Price Calculations**: Always validate calculations on the server side
6. **Error Messages**: Provide user-friendly error messages without exposing system details
7. **Data Types**: Use proper decimal types for monetary values, not floats
8. **Timestamps**: Always use UTC timestamps and convert for display
9. **Caching**: Be careful with caching sensitive data like stock levels
10. **Testing**: Test both happy path and error scenarios thoroughly