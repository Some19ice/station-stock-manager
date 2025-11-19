import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { redirect } from "next/navigation"
import DashboardLayout from "@/app/(authenticated)/dashboard/layout"

// Mock dependencies
jest.mock("@/actions/auth", () => ({
  getCurrentUserProfile: jest.fn(),
  validateUserRole: jest.fn()
}))

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn()
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn()
}))

jest.mock("@/app/(authenticated)/dashboard/_components/enhanced-layout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe("DashboardLayout Authorization", () => {
  let mockValidateUserRole: any
  let mockGetCurrentUserProfile: any
  let mockCurrentUser: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const authActions = await import("@/actions/auth")
    const clerkServer = await import("@clerk/nextjs/server")
    
    mockValidateUserRole = authActions.validateUserRole
    mockGetCurrentUserProfile = authActions.getCurrentUserProfile
    mockCurrentUser = clerkServer.currentUser

    // Default successful setup
    mockCurrentUser.mockResolvedValue({
      id: "user_123",
      fullName: "Test User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      imageUrl: "http://example.com/avatar.jpg"
    })

    mockGetCurrentUserProfile.mockResolvedValue({
      isSuccess: true,
      data: {
        user: { role: "manager" }
      }
    })
  })

  it("should allow access for manager", async () => {
    mockValidateUserRole.mockResolvedValue({ isSuccess: true })
    
    await DashboardLayout({ children: <div>Content</div> })
    
    expect(mockValidateUserRole).toHaveBeenCalledWith("manager")
    expect(redirect).not.toHaveBeenCalled()
  })

  it("should redirect to /staff if role validation fails", async () => {
    mockValidateUserRole.mockResolvedValue({ isSuccess: false })
    
    try {
      await DashboardLayout({ children: <div>Content</div> })
    } catch (e) {
      // redirect throws an error in Next.js, so we catch it
    }
    
    expect(mockValidateUserRole).toHaveBeenCalledWith("manager")
    expect(redirect).toHaveBeenCalledWith("/staff")
  })

  it("should redirect to /login if no current user", async () => {
    mockCurrentUser.mockResolvedValue(null)
    
    try {
      await DashboardLayout({ children: <div>Content</div> })
    } catch (e) {}
    
    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("should redirect to /setup-profile if profile not found", async () => {
    mockGetCurrentUserProfile.mockResolvedValue({ isSuccess: false })
    
    try {
      await DashboardLayout({ children: <div>Content</div> })
    } catch (e) {}
    
    expect(redirect).toHaveBeenCalledWith("/setup-profile")
  })
})
