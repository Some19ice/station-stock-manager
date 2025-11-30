import { db } from "@/db"

export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean
  error?: string
  details?: any
}> {
  try {
    if (!db) {
      return {
        isHealthy: false,
        error: "Database instance not initialized"
      }
    }

    // Simple query to test connection
    const result = await db.execute("SELECT 1 as test")
    
    return {
      isHealthy: true,
      details: {
        connected: true,
        testQuery: result
      }
    }
  } catch (error) {
    console.error("Database health check failed:", error)
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      details: error
    }
  }
}

export async function ensureDatabaseConnection(): Promise<boolean> {
  const health = await checkDatabaseHealth()
  if (!health.isHealthy) {
    console.error("Database connection failed:", health.error)
    return false
  }
  return true
}
