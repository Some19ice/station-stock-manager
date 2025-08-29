import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for e2e tests...')

  // Validate required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars.join(', '))
    console.warn('⚠️ Some tests may fail without proper environment configuration')
  }

  // Launch browser for auth state setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Check if the application is running
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'

    console.log(`🔍 Checking if application is running at ${baseURL}`)

    await page.goto(baseURL, {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    console.log('✅ Application is accessible')

    // Set up test authentication state if needed
    // This is where you would typically:
    // 1. Create test users via API
    // 2. Set up authentication cookies/tokens
    // 3. Seed test data

    // Example: Create authenticated user state
    // await setupTestAuthState(page, context)

    // Save authentication state for reuse in tests
    await context.storageState({
      path: './e2e/auth-state.json'
    })

    console.log('✅ Authentication state saved')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('✅ Global setup completed successfully')
}

// Helper function to set up test authentication state
async function setupTestAuthState(page: any, context: any) {
  // This is where you would implement test user authentication
  // For example:
  // 1. Navigate to login page
  // 2. Fill in test credentials
  // 3. Complete authentication flow
  // 4. Verify successful login

  console.log('🔐 Setting up test authentication state...')

  // Example implementation (commented out as it depends on your auth flow):
  /*
  await page.goto('/sign-in')
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'testpassword')
  await page.click('[data-testid="sign-in-button"]')
  await page.waitForURL('/dashboard')
  */

  console.log('✅ Test authentication state configured')
}

export default globalSetup
