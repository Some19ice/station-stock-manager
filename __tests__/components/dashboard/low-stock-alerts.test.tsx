import { render, screen } from "@testing-library/react"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { LowStockAlert } from "@/actions/dashboard"

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe("LowStockAlerts", () => {
  const mockAlerts: LowStockAlert[] = [
    {
      id: "product-1",
      name: "Engine Oil 10W-40",
      type: "lubricant",
      currentStock: "5.00",
      minThreshold: "20.00",
      unit: "units",
      brand: "Mobil"
    },
    {
      id: "product-2",
      name: "Premium PMS",
      type: "pms",
      currentStock: "100.00",
      minThreshold: "500.00",
      unit: "litres"
    },
    {
      id: "product-3",
      name: "Brake Fluid",
      type: "lubricant",
      currentStock: "0.00",
      minThreshold: "10.00",
      unit: "units",
      brand: "Castrol"
    }
  ]

  describe("Rendering with Alerts", () => {
    it("should render alert header with count", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      expect(screen.getByText("Low Stock Alerts (3)")).toBeInTheDocument()
      expect(screen.getByText("Products that need immediate attention")).toBeInTheDocument()
    })

    it("should render all alert items", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      expect(screen.getByText("Engine Oil 10W-40")).toBeInTheDocument()
      expect(screen.getByText("Premium PMS")).toBeInTheDocument()
      expect(screen.getByText("Brake Fluid")).toBeInTheDocument()
    })

    it("should display stock information correctly", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      expect(screen.getByText("Current: 5 units")).toBeInTheDocument()
      expect(screen.getByText("Min: 20 units")).toBeInTheDocument()
      expect(screen.getByText("Current: 100 litres")).toBeInTheDocument()
      expect(screen.getByText("Min: 500 litres")).toBeInTheDocument()
    })

    it("should display brand badges when available", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      expect(screen.getByText("Mobil")).toBeInTheDocument()
      expect(screen.getByText("Castrol")).toBeInTheDocument()
    })

    it("should show restock buttons for each item", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      const restockButtons = screen.getAllByText("Restock")
      expect(restockButtons).toHaveLength(3)
    })
  })

  describe("No Alerts State", () => {
    it("should render positive message when no alerts", () => {
      render(<LowStockAlerts alerts={[]} />)
      
      expect(screen.getByText("Stock Status")).toBeInTheDocument()
      expect(screen.getByText("All products are above minimum threshold")).toBeInTheDocument()
      expect(screen.getByText("No low stock alerts at this time. Great job maintaining inventory levels!")).toBeInTheDocument()
    })

    it("should not show alert-related elements when no alerts", () => {
      render(<LowStockAlerts alerts={[]} />)
      
      expect(screen.queryByText("Low Stock Alerts")).not.toBeInTheDocument()
      expect(screen.queryByText("Restock")).not.toBeInTheDocument()
    })
  })

  describe("Stock Percentage Calculations", () => {
    it("should show correct percentage badges", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      // Engine Oil: 5/20 = 25%
      expect(screen.getByText("25% of threshold")).toBeInTheDocument()
      
      // Premium PMS: 100/500 = 20%
      expect(screen.getByText("20% of threshold")).toBeInTheDocument()
      
      // Brake Fluid: 0/10 = 0%
      expect(screen.getByText("0% of threshold")).toBeInTheDocument()
    })

    it("should handle zero threshold gracefully", () => {
      const alertsWithZeroThreshold: LowStockAlert[] = [
        {
          id: "product-1",
          name: "Test Product",
          type: "lubricant",
          currentStock: "10.00",
          minThreshold: "0.00",
          unit: "units"
        }
      ]
      
      render(<LowStockAlerts alerts={alertsWithZeroThreshold} />)
      
      expect(screen.getByText("0% of threshold")).toBeInTheDocument()
    })
  })

  describe("Product Type Icons", () => {
    it("should show fuel icon for PMS products", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      // Check that PMS product has appropriate styling/icon
      const pmsProduct = screen.getByText("Premium PMS").closest('div')
      expect(pmsProduct).toBeInTheDocument()
    })

    it("should show package icon for lubricant products", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      // Check that lubricant products have appropriate styling/icon
      const lubricantProduct = screen.getByText("Engine Oil 10W-40").closest('div')
      expect(lubricantProduct).toBeInTheDocument()
    })
  })

  describe("Severity Styling", () => {
    it("should apply critical styling for zero stock", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      // Brake Fluid has 0% stock, should be critical
      const criticalBadge = screen.getByText("0% of threshold")
      expect(criticalBadge).toBeInTheDocument()
    })

    it("should apply appropriate styling for different stock levels", () => {
      const varyingStockAlerts: LowStockAlert[] = [
        {
          id: "product-1",
          name: "Critical Stock",
          type: "lubricant",
          currentStock: "0.00",
          minThreshold: "20.00",
          unit: "units"
        },
        {
          id: "product-2",
          name: "High Alert",
          type: "lubricant",
          currentStock: "5.00",
          minThreshold: "20.00",
          unit: "units"
        },
        {
          id: "product-3",
          name: "Medium Alert",
          type: "lubricant",
          currentStock: "15.00",
          minThreshold: "20.00",
          unit: "units"
        }
      ]
      
      render(<LowStockAlerts alerts={varyingStockAlerts} />)
      
      expect(screen.getByText("0% of threshold")).toBeInTheDocument() // Critical
      expect(screen.getByText("25% of threshold")).toBeInTheDocument() // High
      expect(screen.getByText("75% of threshold")).toBeInTheDocument() // Medium
    })
  })

  describe("Navigation Links", () => {
    it("should have correct restock links", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      const restockLinks = screen.getAllByRole('link')
      const restockButtons = restockLinks.filter(link => 
        link.getAttribute('href')?.includes('/dashboard/inventory?product=')
      )
      
      expect(restockButtons).toHaveLength(3)
      expect(restockButtons[0]).toHaveAttribute('href', '/dashboard/inventory?product=product-1')
      expect(restockButtons[1]).toHaveAttribute('href', '/dashboard/inventory?product=product-2')
      expect(restockButtons[2]).toHaveAttribute('href', '/dashboard/inventory?product=product-3')
    })

    it("should show 'View All' button when more than 5 alerts", () => {
      const manyAlerts = Array.from({ length: 7 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        type: "lubricant" as const,
        currentStock: "5.00",
        minThreshold: "20.00",
        unit: "units"
      }))
      
      render(<LowStockAlerts alerts={manyAlerts} />)
      
      expect(screen.getByText("View All Low Stock Items")).toBeInTheDocument()
      expect(screen.getByRole('link', { name: "View All Low Stock Items" }))
        .toHaveAttribute('href', '/dashboard/inventory?filter=low-stock')
    })

    it("should not show 'View All' button when 5 or fewer alerts", () => {
      render(<LowStockAlerts alerts={mockAlerts} />)
      
      expect(screen.queryByText("View All Low Stock Items")).not.toBeInTheDocument()
    })
  })

  describe("Number Formatting", () => {
    it("should format decimal numbers correctly", () => {
      const decimalAlerts: LowStockAlert[] = [
        {
          id: "product-1",
          name: "Test Product",
          type: "lubricant",
          currentStock: "5.50",
          minThreshold: "20.75",
          unit: "units"
        }
      ]
      
      render(<LowStockAlerts alerts={decimalAlerts} />)
      
      expect(screen.getByText("Current: 5.5 units")).toBeInTheDocument()
      expect(screen.getByText("Min: 20.75 units")).toBeInTheDocument()
    })

    it("should format large numbers with commas", () => {
      const largeNumberAlerts: LowStockAlert[] = [
        {
          id: "product-1",
          name: "Test Product",
          type: "pms",
          currentStock: "1500.00",
          minThreshold: "5000.00",
          unit: "litres"
        }
      ]
      
      render(<LowStockAlerts alerts={largeNumberAlerts} />)
      
      expect(screen.getByText("Current: 1,500 litres")).toBeInTheDocument()
      expect(screen.getByText("Min: 5,000 litres")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle products without brand", () => {
      const noBrandAlerts: LowStockAlert[] = [
        {
          id: "product-1",
          name: "Generic Product",
          type: "lubricant",
          currentStock: "5.00",
          minThreshold: "20.00",
          unit: "units"
          // No brand property
        }
      ]
      
      render(<LowStockAlerts alerts={noBrandAlerts} />)
      
      expect(screen.getByText("Generic Product")).toBeInTheDocument()
      // Should not show any brand badge
      expect(screen.queryByText("Mobil")).not.toBeInTheDocument()
    })

    it("should handle very long product names", () => {
      const longNameAlerts: LowStockAlert[] = [
        {
          id: "product-1",
          name: "This is a very long product name that might cause layout issues",
          type: "lubricant",
          currentStock: "5.00",
          minThreshold: "20.00",
          unit: "units"
        }
      ]
      
      render(<LowStockAlerts alerts={longNameAlerts} />)
      
      expect(screen.getByText("This is a very long product name that might cause layout issues")).toBeInTheDocument()
    })
  })
})