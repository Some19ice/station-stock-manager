import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { redirect } from "next/navigation"
import DirectorLayout from "@/app/(authenticated)/director/layout"

// Mock dependencies
jest.mock("@/actions/auth", () => ({
  validateUserRole: jest.fn()
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn()
}))

describe("DirectorLayout Authorization", () => {
  let mockValidateUserRole: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const authActions = await import("@/actions/auth")
    mockValidateUserRole = authActions.validateUserRole
  })

  it("should allow access for director", async () => {
    mockValidateUserRole.mockResolvedValue({ isSuccess: true })
    
    await DirectorLayout({ children: <div>Content</div> })
    
    expect(mockValidateUserRole).toHaveBeenCalledWith("director")
    expect(redirect).not.toHaveBeenCalled()
  })

  it("should redirect to /unauthorized if role validation fails", async () => {
    mockValidateUserRole.mockResolvedValue({ isSuccess: false })
    
    try {
      await DirectorLayout({ children: <div>Content</div> })
    } catch (e) {
      // redirect throws error
    }
    
    expect(mockValidateUserRole).toHaveBeenCalledWith("director")
    expect(redirect).toHaveBeenCalledWith("/unauthorized")
  })
})
