// Jest setup file for global test configuration

// Setup jest-dom for React testing
require("@testing-library/jest-dom")

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CLERK_SECRET_KEY = "sk_test_mock"

// Global test timeout
jest.setTimeout(30000)

// Mock Clerk for testing
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => Promise.resolve({ userId: "test-user-id" })),
  currentUser: jest.fn(() => Promise.resolve({ id: "test-user-id" }))
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  }),
  usePathname: () => "/test-path"
}))

// Remove global database mock - let individual tests handle their own mocking

// Suppress console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.("Warning:")) {
    return
  }
  originalWarn(...args)
}
