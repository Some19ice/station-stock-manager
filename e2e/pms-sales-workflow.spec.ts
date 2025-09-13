import { test, expect } from '@playwright/test'

/**
 * E2E Test: Complete PMS Sales Workflow
 * 
 * This test validates the complete meter-based PMS sales capture workflow
 * covering all major scenarios from the quickstart guide:
 * 
 * 1. Daily meter reading entry
 * 2. Meter rollover handling
 * 3. Estimated reading approval
 * 4. Deviation detection and alerts
 * 5. Report integration
 * 6. Modification window enforcement
 */

// Test data
const TEST_STATION_ID = 'test-station-123'
const TEST_USER_EMAIL = 'manager@teststation.com'
const TEST_USER_PASSWORD = 'TestPassword123!'

test.describe('PMS Sales Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Login as manager
    await page.fill('input[name="email"]', TEST_USER_EMAIL)
    await page.fill('input[name="password"]', TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('Complete daily meter reading workflow', async ({ page }) => {
    // Navigate to PMS meter readings section
    await page.click('text=Inventory')
    await page.click('text=Meter Readings')
    
    // Verify meter reading form is loaded
    await expect(page.locator('h2')).toContainText('Record Opening Readings')
    
    // Select today's date
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    
    // Enter opening readings for all pumps
    const openingReadings = [
      { pump: 'P001', value: '10000.5' },
      { pump: 'P002', value: '15000.2' },
      { pump: 'P003', value: '20000.8' }
    ]
    
    for (const reading of openingReadings) {
      const pumpSection = page.locator(`text=${reading.pump}`).locator('..')
      await pumpSection.locator('input[type="number"]').fill(reading.value)
    }
    
    // Submit opening readings
    await page.click('text=Submit All Readings')
    await expect(page.locator('text=Successfully recorded')).toBeVisible()
    
    // Switch to closing readings
    await page.click('text=Closing Readings')
    
    // Enter closing readings (including one with potential rollover)
    const closingReadings = [
      { pump: 'P001', value: '10150.3' },
      { pump: 'P002', value: '15200.7' },
      { pump: 'P003', value: '100.5' } // Rollover scenario
    ]
    
    for (const reading of closingReadings) {
      const pumpSection = page.locator(`text=${reading.pump}`).locator('..')
      await pumpSection.locator('input[type="number"]').fill(reading.value)
    }
    
    // Submit closing readings
    await page.click('text=Submit All Readings')
    await expect(page.locator('text=Successfully recorded')).toBeVisible()
    
    // Verify automatic calculation trigger
    await page.click('text=Daily Calculations')
    await expect(page.locator('text=Calculate')).toBeVisible()
    
    // Trigger calculation
    await page.click('text=Calculate')
    await expect(page.locator('text=Calculated')).toBeVisible()
  })

  test('Handle meter rollover scenario', async ({ page }) => {
    // Navigate to daily calculations
    await page.goto('/dashboard/inventory')
    await page.click('text=Daily Calculations')
    
    // Look for rollover alert
    await expect(page.locator('text=Meter Rollover Detected')).toBeVisible()
    
    // Click confirm rollover button
    await page.click('text=Confirm Rollover')
    
    // Verify rollover dialog opens
    await expect(page.locator('text=Confirm Meter Rollover')).toBeVisible()
    
    // Enter rollover details
    await page.fill('input[id="rolloverValue"]', '50000') // Meter capacity
    await page.fill('input[id="newReading"]', '100.5') // Actual closing reading
    await page.fill('textarea[id="notes"]', 'Meter rollover occurred during night shift')
    
    // Verify calculated volume display
    await expect(page.locator('text=Corrected Calculation')).toBeVisible()
    await expect(page.locator('text=Total Volume:')).toBeVisible()
    
    // Confirm rollover
    await page.click('text=Confirm Rollover')
    await expect(page.locator('text=Rollover confirmed successfully')).toBeVisible()
    
    // Verify calculation is updated
    await expect(page.locator('text=Confirmed', { exact: false })).toBeVisible()
  })

  test('Estimated reading approval workflow', async ({ page }) => {
    // Navigate to daily calculations with estimated readings
    await page.goto('/dashboard/inventory')
    await page.click('text=Daily Calculations')
    
    // Switch to estimated tab
    await page.click('text=Estimated')
    
    // Verify estimated calculations are shown
    await expect(page.locator('text=estimated', { exact: false })).toBeVisible()
    
    // Approve an estimated calculation
    const firstApproveButton = page.locator('text=Approve').first()
    await firstApproveButton.click()
    
    // Verify approval success
    await expect(page.locator('text=Calculation approved')).toBeVisible()
    
    // Verify the calculation is marked as approved
    await expect(page.locator('text=Approved')).toBeVisible()
  })

  test('Deviation detection and alerts', async ({ page }) => {
    // Navigate to deviation alerts
    await page.goto('/dashboard/inventory')
    await page.click('text=Deviation Alerts')
    
    // Verify deviation alerts component loads
    await expect(page.locator('text=Volume Deviation Alerts')).toBeVisible()
    
    // Check for critical deviations
    const criticalAlerts = page.locator('text=Critical Alerts')
    if (await criticalAlerts.isVisible()) {
      // Verify critical deviation details
      await expect(page.locator('text=≥50% deviation')).toBeVisible()
    }
    
    // Adjust threshold and refresh
    await page.selectOption('select', '15') // 15% threshold
    await page.click('text=Refresh')
    
    // Verify updated results
    await expect(page.locator('text=15%-29% deviation')).toBeVisible()
    
    // Acknowledge a deviation if present
    const acknowledgeButton = page.locator('text=Acknowledge').first()
    if (await acknowledgeButton.isVisible()) {
      await acknowledgeButton.click()
      await expect(page.locator('text=Deviation acknowledged')).toBeVisible()
    }
  })

  test('Pump configuration management', async ({ page }) => {
    // Navigate to pump management
    await page.goto('/dashboard/inventory')
    await page.click('text=Pump Management')
    
    // Verify pump management component loads
    await expect(page.locator('text=Pump Configuration Management')).toBeVisible()
    
    // View pump status
    const statusButtons = page.locator('text=Status')
    await expect(statusButtons.first()).toBeVisible()
    
    // Update pump status
    await statusButtons.first().click()
    await expect(page.locator('text=Update Pump Status')).toBeVisible()
    
    // Change to maintenance status
    await page.selectOption('select', 'maintenance')
    await page.fill('textarea', 'Scheduled maintenance - weekly check')
    await page.click('text=Update Status')
    
    // Verify status update
    await expect(page.locator('text=Pump status updated successfully')).toBeVisible()
    await expect(page.locator('text=Maintenance')).toBeVisible()
  })

  test('Report integration with meter-based data', async ({ page }) => {
    // Navigate to reports
    await page.goto('/dashboard/reports')
    
    // Generate daily report
    await page.click('text=Daily Report')
    
    // Select today's date
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    await page.click('text=Generate Report')
    
    // Verify meter-based PMS data in report
    await expect(page.locator('text=PMS Report')).toBeVisible()
    await expect(page.locator('text=Total Volume')).toBeVisible()
    await expect(page.locator('text=Meter Based')).toBeVisible()
    
    // Check for pump-level details
    await expect(page.locator('text=Pump Calculations')).toBeVisible()
    await expect(page.locator('text=Opening Reading')).toBeVisible()
    await expect(page.locator('text=Closing Reading')).toBeVisible()
    
    // Verify lubricant sales are preserved
    await expect(page.locator('text=Lubricant Breakdown')).toBeVisible()
  })

  test('Modification window enforcement', async ({ page }) => {
    // This test simulates attempting to modify readings outside the allowed window
    // In a real test, this would require test data with older readings
    
    // Navigate to meter readings
    await page.goto('/dashboard/inventory')
    await page.click('text=Meter Readings')
    
    // Try to modify a reading from yesterday (if exists)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    await page.fill('input[type="date"]', yesterdayStr)
    
    // Check if there are existing readings to modify
    const editButtons = page.locator('text=Edit')
    if (await editButtons.count() > 0) {
      await editButtons.first().click()
      
      // Try to modify the reading
      await page.fill('input[type="number"]', '12345.6')
      await page.click('text=Save')
      
      // Verify modification window error
      await expect(page.locator('text=Modification window expired')).toBeVisible()
    }
  })

  test('Dashboard metrics include meter-based data', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Verify PMS metrics cards are present
    await expect(page.locator('text=PMS Volume')).toBeVisible()
    await expect(page.locator('text=PMS Revenue')).toBeVisible()
    await expect(page.locator('text=Active Pumps')).toBeVisible()
    
    // Check meter reading status
    await expect(page.locator('text=Reading Status')).toBeVisible()
    await expect(page.locator('text=Complete Readings')).toBeVisible()
    await expect(page.locator('text=Pending Readings')).toBeVisible()
    
    // Verify deviation alerts
    await expect(page.locator('text=Deviation Alerts')).toBeVisible()
    
    // Check that meter-based indicator is shown
    await expect(page.locator('text=Meter Based')).toBeVisible()
  })

  test('End-to-end quickstart scenario', async ({ page }) => {
    // This test runs through the complete quickstart workflow
    // combining multiple components in the expected user journey
    
    // 1. Start with pump configuration
    await page.goto('/dashboard/inventory')
    await page.click('text=Pump Management')
    
    // Verify at least one active pump exists
    await expect(page.locator('text=Active')).toBeVisible()
    
    // 2. Record morning readings
    await page.click('text=Meter Readings')
    await page.click('text=Opening Readings')
    
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    
    // Enter readings for all visible pumps
    const pumpCards = page.locator('[data-testid="pump-card"]')
    const pumpCount = await pumpCards.count()
    
    for (let i = 0; i < pumpCount; i++) {
      const pumpCard = pumpCards.nth(i)
      const meterInput = pumpCard.locator('input[type="number"]')
      await meterInput.fill(`${10000 + i * 5000}.5`)
    }
    
    await page.click('text=Submit All Readings')
    await expect(page.locator('text=Successfully recorded')).toBeVisible()
    
    // 3. Record evening readings
    await page.click('text=Closing Readings')
    
    for (let i = 0; i < pumpCount; i++) {
      const pumpCard = pumpCards.nth(i)
      const meterInput = pumpCard.locator('input[type="number"]')
      await meterInput.fill(`${10150 + i * 5200}.3`)
    }
    
    await page.click('text=Submit All Readings')
    await expect(page.locator('text=Successfully recorded')).toBeVisible()
    
    // 4. Generate calculations
    await page.click('text=Daily Calculations')
    await page.click('text=Calculate')
    await expect(page.locator('text=Calculated')).toBeVisible()
    
    // 5. Review and approve any estimations
    const estimatedTab = page.locator('text=Estimated')
    if (await estimatedTab.isVisible()) {
      await estimatedTab.click()
      
      const approveButtons = page.locator('text=Approve')
      const approveCount = await approveButtons.count()
      
      for (let i = 0; i < approveCount; i++) {
        await approveButtons.nth(i).click()
        await page.waitForTimeout(500) // Brief pause between approvals
      }
    }
    
    // 6. Check for and handle deviations
    await page.click('text=Deviation Alerts')
    
    const acknowledgeButtons = page.locator('text=Acknowledge')
    const ackCount = await acknowledgeButtons.count()
    
    if (ackCount > 0) {
      await acknowledgeButtons.first().click()
      await expect(page.locator('text=Deviation acknowledged')).toBeVisible()
    }
    
    // 7. Generate final report
    await page.goto('/dashboard/reports')
    await page.click('text=Daily Report')
    await page.fill('input[type="date"]', today)
    await page.click('text=Generate Report')
    
    // Verify complete report with meter-based data
    await expect(page.locator('text=PMS Report')).toBeVisible()
    await expect(page.locator('text=Meter Based')).toBeVisible()
    await expect(page.locator('text=Total Volume')).toBeVisible()
    await expect(page.locator('text=Total Revenue')).toBeVisible()
    
    // 8. Verify dashboard reflects updated data
    await page.goto('/dashboard')
    await expect(page.locator('text=PMS Volume')).toBeVisible()
    await expect(page.locator('text=Complete')).toBeVisible() // Reading status
  })
})

// Utility functions for test data setup
test.describe('Test Data Setup', () => {
  test.beforeAll(async ({ browser }) => {
    // This would typically set up test data in a real environment
    // For now, we assume the test database is properly seeded
    console.log('Setting up test data for PMS workflow tests')
  })

  test.afterAll(async ({ browser }) => {
    // Clean up test data if needed
    console.log('Cleaning up test data after PMS workflow tests')
  })
})

// Performance and reliability tests
test.describe('Performance & Reliability', () => {
  test('Meter reading submission performance', async ({ page }) => {
    await page.goto('/dashboard/inventory')
    await page.click('text=Meter Readings')
    
    // Measure time for bulk reading submission
    const startTime = Date.now()
    
    // Submit readings for all pumps
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    
    const pumpCards = page.locator('[data-testid="pump-card"]')
    const pumpCount = await pumpCards.count()
    
    for (let i = 0; i < pumpCount; i++) {
      const pumpCard = pumpCards.nth(i)
      const meterInput = pumpCard.locator('input[type="number"]')
      await meterInput.fill(`${10000 + i * 1000}.0`)
    }
    
    await page.click('text=Submit All Readings')
    await expect(page.locator('text=Successfully recorded')).toBeVisible()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Performance assertion: should complete within 5 seconds
    expect(duration).toBeLessThan(5000)
  })

  test('Calculation performance', async ({ page }) => {
    await page.goto('/dashboard/inventory')
    await page.click('text=Daily Calculations')
    
    // Measure calculation time
    const startTime = Date.now()
    
    await page.click('text=Calculate')
    await expect(page.locator('text=Calculated')).toBeVisible()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Performance assertion: calculations should complete within 3 seconds
    expect(duration).toBeLessThan(3000)
  })
})

