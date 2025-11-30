import { checkDatabaseHealth } from "@/lib/db-health"

export default async function DebugPage() {
  const dbHealth = await checkDatabaseHealth()
  
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV || "development"
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-mono">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Database Health</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={dbHealth.isHealthy ? "text-green-600" : "text-red-600"}>
                {dbHealth.isHealthy ? "✅ Healthy" : "❌ Unhealthy"}
              </span>
            </div>
            {dbHealth.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-700">{dbHealth.error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Quick Fixes</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800">Database Connection Issues:</h3>
              <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                <li>Check if DATABASE_URL is set in .env.local</li>
                <li>Ensure PostgreSQL database is running</li>
                <li>Run database migrations: <code className="bg-blue-100 px-1 rounded">npx drizzle-kit migrate</code></li>
                <li>Check database credentials and permissions</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800">Authentication Issues:</h3>
              <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
                <li>Verify Clerk keys are set correctly</li>
                <li>Check Clerk dashboard for webhook configuration</li>
                <li>Ensure user has completed profile setup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
