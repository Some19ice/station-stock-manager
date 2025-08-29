import { FullConfig } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for e2e tests...')

  try {
    // Clean up temporary authentication state files
    const authStatePath = './e2e/auth-state.json'
    try {
      await fs.access(authStatePath)
      await fs.unlink(authStatePath)
      console.log('✅ Cleaned up authentication state file')
    } catch (error) {
      // File doesn't exist, which is fine
      console.log('ℹ️ No authentication state file to clean up')
    }

    // Clean up test artifacts
    await cleanupTestArtifacts()

    // Clean up test data if needed
    await cleanupTestData()

    // Log test completion statistics
    logTestCompletion()

  } catch (error) {
    console.error('❌ Global teardown encountered an error:', error)
    // Don't throw here - we want teardown to complete even if there are issues
  }

  console.log('✅ Global teardown completed')
}

async function cleanupTestArtifacts() {
  console.log('🧹 Cleaning up test artifacts...')

  const artifactPaths = [
    './e2e/test-results',
    './playwright-report/results.json'
  ]

  for (const artifactPath of artifactPaths) {
    try {
      const fullPath = path.resolve(artifactPath)
      await fs.access(fullPath)

      // Check if it's a directory or file
      const stats = await fs.stat(fullPath)
      if (stats.isDirectory()) {
        // For directories, we might want to keep them but clean contents
        // or remove entirely - depends on your needs
        console.log(`ℹ️ Test results directory exists at: ${fullPath}`)
      } else {
        // For files, we can remove them
        await fs.unlink(fullPath)
        console.log(`✅ Cleaned up artifact: ${artifactPath}`)
      }
    } catch (error) {
      // Artifact doesn't exist or can't be accessed, which is fine
      console.log(`ℹ️ No artifact to clean up at: ${artifactPath}`)
    }
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')

  // This is where you would implement test data cleanup
  // For example:
  // 1. Delete test users created during tests
  // 2. Clean up test database records
  // 3. Remove uploaded test files
  // 4. Reset any external service states

  // Example implementation (commented out as it depends on your data setup):
  /*
  try {
    // Clean up test database
    if (process.env.DATABASE_URL_TEST) {
      await cleanupTestDatabase()
    }

    // Clean up test files
    await cleanupTestFiles()

    console.log('✅ Test data cleaned up successfully')
  } catch (error) {
    console.error('⚠️ Error during test data cleanup:', error)
  }
  */

  console.log('✅ Test data cleanup completed')
}

function logTestCompletion() {
  const timestamp = new Date().toISOString()
  console.log(`📊 Test suite completed at: ${timestamp}`)

  // You could also log additional statistics here:
  // - Test duration
  // - Number of tests run
  // - Success/failure rates
  // - Performance metrics

  console.log('📈 For detailed test results, check the HTML report')
  console.log('💡 Run "npx playwright show-report" to view the test report')
}

// Helper functions for specific cleanup tasks

async function cleanupTestDatabase() {
  // Implement database cleanup logic here
  console.log('🗄️ Cleaning up test database...')

  // Example:
  // - Truncate test tables
  // - Delete test records
  // - Reset sequences/auto-increment values
}

async function cleanupTestFiles() {
  // Implement file cleanup logic here
  console.log('📁 Cleaning up test files...')

  const testFilePatterns = [
    './uploads/test-*',
    './tmp/e2e-*',
    './logs/test-*.log'
  ]

  // Clean up files matching patterns
  // Implementation would depend on your specific file structure
}

export default globalTeardown
