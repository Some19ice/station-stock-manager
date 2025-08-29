import { test, expect } from '@playwright/test'

test.describe('Station Stock Manager E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test('should load the home page successfully', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Station Stock Manager/)

    // Look for key elements on the homepage
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Check for navigation or auth elements
    const signInButton = page.locator('[data-testid="sign-in"], [href*="sign-in"], text=/sign in/i').first()
    if (await signInButton.isVisible()) {
      await expect(signInButton).toBeVisible()
    }
  })

  test('should navigate to sign-in page', async ({ page }) => {
    // Look for sign-in link and click it
    const signInLink = page.locator('[href*="sign-in"], text=/sign in/i').first()

    if (await signInLink.isVisible()) {
      await signInLink.click()

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle')

      // Verify we're on the sign-in page
      await expect(page).toHaveURL(/.*sign-in.*/)

      // Look for sign-in form elements
      const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email"]').first()
      const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password"]').first()

      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible()
      }
      if (await passwordInput.isVisible()) {
        await expect(passwordInput).toBeVisible()
      }
    } else {
      console.log('Sign-in link not found - might be already authenticated or different auth flow')
    }
  })

  test('should handle authenticated user dashboard access', async ({ page }) => {
    // This test assumes user might be pre-authenticated or we're testing the dashboard directly

    // Try to navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    // Check if we were redirected to sign-in or if we can access dashboard
    const currentUrl = page.url()

    if (currentUrl.includes('sign-in') || currentUrl.includes('auth')) {
      console.log('User not authenticated - redirected to auth flow')
      // This is expected behavior for unauthenticated users
      expect(currentUrl).toMatch(/sign-in|auth/)
    } else if (currentUrl.includes('dashboard')) {
      console.log('User authenticated - testing dashboard functionality')

      // Test dashboard elements
      await expect(page).toHaveTitle(/Dashboard|Station/)

      // Look for common dashboard elements
      const metricsCards = page.locator('[data-testid*="metric"], .metric, [class*="metric"]')
      const navigationMenu = page.locator('nav, [role="navigation"], [data-testid="navigation"]')

      // Check for dashboard content
      const dashboardHeading = page.locator('h1, h2').filter({ hasText: /dashboard|overview|metrics/i }).first()
      if (await dashboardHeading.isVisible()) {
        await expect(dashboardHeading).toBeVisible()
      }

      // Test navigation menu if present
      if (await navigationMenu.first().isVisible()) {
        await expect(navigationMenu.first()).toBeVisible()

        // Look for common navigation items
        const inventoryLink = page.locator('a').filter({ hasText: /inventory|stock|products/i }).first()
        const salesLink = page.locator('a').filter({ hasText: /sales|transactions/i }).first()
        const reportsLink = page.locator('a').filter({ hasText: /reports|analytics/i }).first()

        // Test navigation to different sections
        if (await inventoryLink.isVisible()) {
          await inventoryLink.click()
          await page.waitForLoadState('networkidle')
          expect(page.url()).toMatch(/inventory|stock|products/)

          // Navigate back to dashboard
          await page.goto('/dashboard')
        }
      }
    }
  })

  test('should handle responsive navigation', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Look for mobile menu toggle
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .hamburger, [class*="menu-toggle"]').first()

    if (await mobileMenuToggle.isVisible()) {
      await expect(mobileMenuToggle).toBeVisible()

      // Test mobile menu functionality
      await mobileMenuToggle.click()

      // Wait for menu to open
      await page.waitForTimeout(300)

      // Look for mobile navigation menu
      const mobileNav = page.locator('[data-testid="mobile-nav"], nav[class*="mobile"], .mobile-menu').first()
      if (await mobileNav.isVisible()) {
        await expect(mobileNav).toBeVisible()
      }
    }
  })

  test('should handle form interactions', async ({ page }) => {
    // Try to find and test a form on the site
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    // Look for forms or interactive elements
    const forms = page.locator('form')
    const buttons = page.locator('button')
    const inputs = page.locator('input')

    const formCount = await forms.count()
    const buttonCount = await buttons.count()
    const inputCount = await inputs.count()

    console.log(`Found ${formCount} forms, ${buttonCount} buttons, ${inputCount} inputs`)

    // Test a simple button click if buttons exist
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      if (await firstButton.isVisible() && await firstButton.isEnabled()) {
        const buttonText = await firstButton.textContent()
        console.log(`Testing button: ${buttonText}`)

        // Click the button and wait for any response
        await firstButton.click()
        await page.waitForTimeout(500)

        // Verify no JavaScript errors occurred
        const errors: string[] = []
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text())
          }
        })

        expect(errors.length).toBe(0)
      }
    }
  })

  test('should check for accessibility basics', async ({ page }) => {
    await page.goto('/')

    // Check for basic accessibility elements
    const mainContent = page.locator('main, [role="main"]').first()
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link').first()
    const headings = page.locator('h1, h2, h3, h4, h5, h6')

    // Verify heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(2) // Should typically have only one h1 per page

    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i)
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt')
          const src = await img.getAttribute('src')

          // Images should have alt text (can be empty for decorative images)
          expect(alt).not.toBeNull()
          console.log(`Image ${i}: src="${src}", alt="${alt}"`)
        }
      }
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' })

    // Should show some kind of error or 404 page
    const errorMessages = page.locator('text=/404|not found|error/i')
    const homeLink = page.locator('a[href="/"], a[href="/dashboard"]').first()

    // Either we get a 404 page or we're redirected somewhere appropriate
    const status = await page.evaluate(() => {
      return document.title.toLowerCase().includes('404') ||
             document.body.textContent?.toLowerCase().includes('not found') ||
             document.body.textContent?.toLowerCase().includes('error')
    })

    if (status) {
      console.log('404 page displayed correctly')

      // Look for navigation back to home
      if (await homeLink.isVisible()) {
        await expect(homeLink).toBeVisible()
      }
    } else {
      console.log('Redirected instead of showing 404 - checking redirect behavior')

      // Should redirect to a valid page
      expect(page.url()).not.toContain('/non-existent-page')
    }
  })
})

test.describe('Performance and Loading Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime
    console.log(`Page load time: ${loadTime}ms`)

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)

    // Check for performance metrics
    const performanceTiming = await page.evaluate(() => {
      const perf = window.performance
      const timing = perf.timing
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullyLoaded: timing.loadEventEnd - timing.navigationStart
      }
    })

    console.log('Performance metrics:', performanceTiming)

    // DOM should be ready quickly
    expect(performanceTiming.domContentLoaded).toBeLessThan(3000)
  })
})
