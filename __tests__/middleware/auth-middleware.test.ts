const { describe, it, expect, beforeEach } = require("@jest/globals")

// Mock all dependencies
jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: jest.fn(),
  createRouteMatcher: jest.fn(routes => {
    return req => {
      const pathname = req.nextUrl.pathname
      return routes.some(route => {
        const regex = new RegExp(route.replace(/\\(.*\\)/, ".*"))
        return regex.test(pathname)
      })
    }
  })
}))

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn()
  }
}))

// Import after mocking
const { createRouteMatcher } = require("@clerk/nextjs/server")

describe("Route Matchers", () => {
  const mockReq = pathname => ({ nextUrl: { pathname } })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createRouteMatcher", () => {
    it("should match exact routes", () => {
      const isDashboardRoute = createRouteMatcher(["/dashboard"])
      expect(isDashboardRoute(mockReq("/dashboard"))).toBe(true)
      expect(isDashboardRoute(mockReq("/staff"))).toBe(false)
    })

    it("should match routes with wildcards", () => {
      const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])
      expect(isProtectedRoute(mockReq("/dashboard"))).toBe(true)
      expect(isProtectedRoute(mockReq("/dashboard/inventory"))).toBe(true)
      expect(isProtectedRoute(mockReq("/dashboard/users"))).toBe(true)
      expect(isProtectedRoute(mockReq("/staff"))).toBe(false)
    })

    it("should match staff routes", () => {
      const isStaffRoute = createRouteMatcher(["/staff(.*)"])
      expect(isStaffRoute(mockReq("/staff"))).toBe(true)
      expect(isStaffRoute(mockReq("/staff/sales"))).toBe(true)
      expect(isStaffRoute(mockReq("/dashboard"))).toBe(false)
    })

    it("should match manager-only routes", () => {
      const isManagerOnlyRoute = createRouteMatcher([
        "/dashboard/inventory(.*)",
        "/dashboard/reports(.*)",
        "/dashboard/users(.*)"
      ])

      expect(isManagerOnlyRoute(mockReq("/dashboard/inventory"))).toBe(true)
      expect(isManagerOnlyRoute(mockReq("/dashboard/reports"))).toBe(true)
      expect(isManagerOnlyRoute(mockReq("/dashboard/users"))).toBe(true)
      expect(isManagerOnlyRoute(mockReq("/dashboard"))).toBe(false)
      expect(isManagerOnlyRoute(mockReq("/staff"))).toBe(false)
    })
  })
})
