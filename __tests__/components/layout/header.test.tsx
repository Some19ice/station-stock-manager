/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Header } from "@/components/layout/header"

// Mock Clerk
// Mock functions must be declared before jest.mock() calls
const mockUseUser = jest.fn()
const mockSignOutButton = jest.fn(({ children }) => <div>{children}</div>)

jest.mock("@clerk/nextjs", () => ({
  useUser: () => mockUseUser(),
  SignOutButton: mockSignOutButton
}))

const mockUser = {
  id: "user-123",
  firstName: "John",
  lastName: "Doe",
  primaryEmailAddress: {
    emailAddress: "john.doe@example.com"
  },
  publicMetadata: {
    role: "manager"
  }
}

// Mock connection status hook
const mockUseConnectionStatus = jest.fn()
jest.mock("@/hooks/use-connection-status", () => ({
  useConnectionStatus: () => mockUseConnectionStatus()
}))

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoaded: true
    })

    mockUseConnectionStatus.mockReturnValue({
      status: "online",
      isOnline: true,
      isOffline: false,
      lastSync: new Date()
    })
  })

  describe("Branding", () => {
    it("should display Station Stock Manager branding", () => {
      render(<Header />)

      expect(screen.getByText("Station Stock Manager")).toBeInTheDocument()
    })
  })

  describe("Connection Status", () => {
    it("should show online status when connected", () => {
      render(<Header />)

      expect(screen.getByText("Online")).toBeInTheDocument()
    })

    it("should show offline status when disconnected", () => {
      mockUseConnectionStatus.mockReturnValue({
        status: "offline",
        isOnline: false,
        isOffline: true,
        lastSync: null
      })

      render(<Header />)

      expect(screen.getByText("Offline")).toBeInTheDocument()
    })

    it("should display connection status indicator dot", () => {
      const { container } = render(<Header />)

      // Check for the green dot (online status)
      const statusDot = container.querySelector(".bg-green-500")
      expect(statusDot).toBeInTheDocument()
    })

    it("should show red dot when offline", () => {
      mockUseConnectionStatus.mockReturnValue({
        status: "offline",
        isOnline: false,
        isOffline: true,
        lastSync: null
      })

      const { container } = render(<Header />)

      // Check for the red dot (offline status)
      const statusDot = container.querySelector(".bg-red-500")
      expect(statusDot).toBeInTheDocument()
    })
  })

  describe("User Profile", () => {
    it("should display user avatar and name", () => {
      render(<Header />)

      // Avatar should be present
      const avatar = screen.getByRole("button")
      expect(avatar).toBeInTheDocument()
    })

    it("should show user initials as fallback", () => {
      render(<Header />)

      // Should show initials JD for John Doe
      expect(screen.getByText("JD")).toBeInTheDocument()
    })

    it("should display user information in dropdown", async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Click on avatar to open dropdown
      const avatarButton = screen.getByRole("button")
      await user.click(avatarButton)

      // Check dropdown content
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument()
      expect(screen.getByText("Manager")).toBeInTheDocument()
    })

    it("should show staff role badge for staff users", async () => {
      mockUseUser.mockReturnValue({
        user: {
          ...mockUser,
          publicMetadata: { role: "staff" }
        },
        isLoaded: true
      })

      const user = userEvent.setup()
      render(<Header />)

      // Click on avatar to open dropdown
      const avatarButton = screen.getByRole("button")
      await user.click(avatarButton)

      expect(screen.getByText("Staff")).toBeInTheDocument()
    })

    it("should show loading state when user is not loaded", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false
      })

      const { container } = render(<Header />)

      // Should show loading skeleton
      const loadingSkeleton = container.querySelector(".animate-pulse")
      expect(loadingSkeleton).toBeInTheDocument()
    })

    it("should include logout functionality", async () => {
      const user = userEvent.setup()
      render(<Header />)

      // Click on avatar to open dropdown
      const avatarButton = screen.getByRole("button")
      await user.click(avatarButton)

      // Check for logout option
      expect(screen.getByText("Log out")).toBeInTheDocument()
    })
  })

  describe("Styling", () => {
    it("should have proper header styling", () => {
      const { container } = render(<Header />)

      const header = container.querySelector("header")
      expect(header).toHaveClass(
        "bg-white",
        "shadow-sm",
        "border-b",
        "border-gray-200"
      )
    })

    it("should be sticky positioned", () => {
      const { container } = render(<Header />)

      const header = container.querySelector("header")
      expect(header).toHaveClass("sticky", "top-0", "z-50")
    })

    it("should have proper spacing and layout", () => {
      const { container } = render(<Header />)

      const header = container.querySelector("header")
      expect(header).toHaveClass("px-4", "py-3")

      const innerContainer = header?.querySelector("div")
      expect(innerContainer).toHaveClass(
        "flex",
        "items-center",
        "justify-between",
        "max-w-7xl",
        "mx-auto"
      )
    })
  })

  describe("Responsive Design", () => {
    it("should hide connection status text on small screens", () => {
      render(<Header />)

      const statusText = screen.getByText("Online")
      expect(statusText).toHaveClass("hidden", "sm:inline")
    })
  })
})
