/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react"
import { RecentActivity } from "@/components/dashboard/recent-activity"

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

describe("RecentActivity", () => {
  const mockTransactions = [
    {
      id: "transaction-1",
      totalAmount: "1500.50",
      transactionDate: new Date("2024-01-15T10:30:00Z"),
      userName: "john_doe",
      itemCount: 3
    },
    {
      id: "transaction-2",
      totalAmount: "750.00",
      transactionDate: new Date("2024-01-15T09:15:00Z"),
      userName: "jane_smith",
      itemCount: 1
    },
    {
      id: "transaction-3",
      totalAmount: "2250.75",
      transactionDate: new Date("2024-01-14T16:45:00Z"),
      userName: "bob_wilson",
      itemCount: 5
    }
  ]

  describe("Rendering with Transactions", () => {
    it("should render activity header", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
      expect(
        screen.getByText("Latest transactions and activities")
      ).toBeInTheDocument()
    })

    it("should render all transactions", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      expect(screen.getByText("₦1,501")).toBeInTheDocument() // Rounded currency
      expect(screen.getByText("₦750")).toBeInTheDocument()
      expect(screen.getByText("₦2,251")).toBeInTheDocument()
    })

    it("should display user names", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      expect(screen.getByText("john_doe")).toBeInTheDocument()
      expect(screen.getByText("jane_smith")).toBeInTheDocument()
      expect(screen.getByText("bob_wilson")).toBeInTheDocument()
    })

    it("should display item counts with correct pluralization", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      expect(screen.getByText("3 items")).toBeInTheDocument()
      expect(screen.getByText("1 item")).toBeInTheDocument() // Singular
      expect(screen.getByText("5 items")).toBeInTheDocument()
    })

    it("should show view buttons for each transaction", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      const viewButtons = screen.getAllByText("View")
      expect(viewButtons).toHaveLength(3)
    })
  })

  describe("Empty State", () => {
    it("should render empty state when no transactions", () => {
      render(<RecentActivity transactions={[]} />)

      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
      expect(screen.getByText("No recent transactions")).toBeInTheDocument()
      expect(
        screen.getByText("Transactions will appear here as they are recorded")
      ).toBeInTheDocument()
    })

    it("should not show view buttons in empty state", () => {
      render(<RecentActivity transactions={[]} />)

      expect(screen.queryByText("View")).not.toBeInTheDocument()
    })

    it("should not show 'View All' button in empty state", () => {
      render(<RecentActivity transactions={[]} />)

      expect(
        screen.queryByText("View All Transactions")
      ).not.toBeInTheDocument()
    })
  })

  describe("Date and Time Formatting", () => {
    beforeEach(() => {
      // Mock current date for consistent testing
      jest.useFakeTimers()
      jest.setSystemTime(new Date("2024-01-15T12:00:00Z"))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("should show time for transactions within 24 hours", () => {
      const recentTransactions = [
        {
          id: "transaction-1",
          totalAmount: "1000.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"), // Same day
          userName: "test_user",
          itemCount: 2
        }
      ]

      render(<RecentActivity transactions={recentTransactions} />)

      // Should show time format (11:30 am - adjusted for timezone)
      expect(screen.getByText(/11:30 am/)).toBeInTheDocument()
    })

    it("should show date and time for older transactions", () => {
      const olderTransactions = [
        {
          id: "transaction-1",
          totalAmount: "1000.00",
          transactionDate: new Date("2024-01-13T10:30:00Z"), // 2 days ago
          userName: "test_user",
          itemCount: 2
        }
      ]

      render(<RecentActivity transactions={olderTransactions} />)

      // Should show date format (13 Jan, 11:30 am - adjusted for timezone and format)
      expect(screen.getByText(/13 Jan, 11:30 am/)).toBeInTheDocument()
    })
  })

  describe("Currency Formatting", () => {
    it("should format currency as Nigerian Naira", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      // Check for Naira symbol
      expect(screen.getByText("₦1,501")).toBeInTheDocument()
      expect(screen.getByText("₦750")).toBeInTheDocument()
      expect(screen.getByText("₦2,251")).toBeInTheDocument()
    })

    it("should handle zero amounts", () => {
      const zeroAmountTransactions = [
        {
          id: "transaction-1",
          totalAmount: "0.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 0
        }
      ]

      render(<RecentActivity transactions={zeroAmountTransactions} />)

      expect(screen.getByText("₦0")).toBeInTheDocument()
      expect(screen.getByText("0 items")).toBeInTheDocument()
    })

    it("should handle large amounts", () => {
      const largeAmountTransactions = [
        {
          id: "transaction-1",
          totalAmount: "123456.78",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 10
        }
      ]

      render(<RecentActivity transactions={largeAmountTransactions} />)

      expect(screen.getByText("₦123,457")).toBeInTheDocument() // Rounded
    })
  })

  describe("Navigation Links", () => {
    it("should have correct view transaction links", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      const viewLinks = screen.getAllByRole("link")
      const transactionLinks = viewLinks.filter(link =>
        link.getAttribute("href")?.includes("/dashboard/reports?transaction=")
      )

      expect(transactionLinks).toHaveLength(3)
      expect(transactionLinks[0]).toHaveAttribute(
        "href",
        "/dashboard/reports?transaction=transaction-1"
      )
      expect(transactionLinks[1]).toHaveAttribute(
        "href",
        "/dashboard/reports?transaction=transaction-2"
      )
      expect(transactionLinks[2]).toHaveAttribute(
        "href",
        "/dashboard/reports?transaction=transaction-3"
      )
    })

    it("should show 'View All' button when 10 or more transactions", () => {
      const manyTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `transaction-${i}`,
        totalAmount: "1000.00",
        transactionDate: new Date("2024-01-15T10:30:00Z"),
        userName: `user_${i}`,
        itemCount: 2
      }))

      render(<RecentActivity transactions={manyTransactions} />)

      expect(screen.getByText("View All Transactions")).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "View All Transactions" })
      ).toHaveAttribute("href", "/dashboard/reports")
    })

    it("should not show 'View All' button when fewer than 10 transactions", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      expect(
        screen.queryByText("View All Transactions")
      ).not.toBeInTheDocument()
    })
  })

  describe("Item Count Pluralization", () => {
    it("should use singular 'item' for count of 1", () => {
      const singleItemTransaction = [
        {
          id: "transaction-1",
          totalAmount: "500.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 1
        }
      ]

      render(<RecentActivity transactions={singleItemTransaction} />)

      expect(screen.getByText("1 item")).toBeInTheDocument()
      expect(screen.queryByText("1 items")).not.toBeInTheDocument()
    })

    it("should use plural 'items' for count other than 1", () => {
      const multiItemTransactions = [
        {
          id: "transaction-1",
          totalAmount: "500.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 0
        },
        {
          id: "transaction-2",
          totalAmount: "1000.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 5
        }
      ]

      render(<RecentActivity transactions={multiItemTransactions} />)

      expect(screen.getByText("0 items")).toBeInTheDocument()
      expect(screen.getByText("5 items")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper link roles", () => {
      render(<RecentActivity transactions={mockTransactions} />)

      const links = screen.getAllByRole("link")
      expect(links.length).toBeGreaterThan(0)

      // Each transaction should have a view link
      const viewLinks = screen.getAllByText("View")
      expect(viewLinks).toHaveLength(3)
    })

    it("should have proper button roles", () => {
      const manyTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `transaction-${i}`,
        totalAmount: "1000.00",
        transactionDate: new Date("2024-01-15T10:30:00Z"),
        userName: `user_${i}`,
        itemCount: 2
      }))

      render(<RecentActivity transactions={manyTransactions} />)

      const viewAllButton = screen.getByRole("link", {
        name: "View All Transactions"
      })
      expect(viewAllButton).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle very long usernames", () => {
      const longUsernameTransactions = [
        {
          id: "transaction-1",
          totalAmount: "1000.00",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "very_long_username_that_might_cause_layout_issues",
          itemCount: 2
        }
      ]

      render(<RecentActivity transactions={longUsernameTransactions} />)

      expect(
        screen.getByText("very_long_username_that_might_cause_layout_issues")
      ).toBeInTheDocument()
    })

    it("should handle decimal amounts correctly", () => {
      const decimalTransactions = [
        {
          id: "transaction-1",
          totalAmount: "1234.56",
          transactionDate: new Date("2024-01-15T10:30:00Z"),
          userName: "test_user",
          itemCount: 2
        }
      ]

      render(<RecentActivity transactions={decimalTransactions} />)

      expect(screen.getByText("₦1,235")).toBeInTheDocument() // Rounded to nearest whole number
    })
  })
})
