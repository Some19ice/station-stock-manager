import { render, screen } from "@testing-library/react"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { DashboardMetrics } from "@/actions/dashboard"

describe("MetricsCards", () => {
  const mockMetrics: DashboardMetrics = {
    todaysSales: {
      totalValue: "15000.50",
      transactionCount: 25,
      averageTransaction: "600.02"
    },
    stockStatus: {
      lowStockCount: 3,
      totalProducts: 50,
      pmsLevel: "2500.75"
    },
    staffActivity: {
      activeStaffCount: 4,
      totalStaff: 6
    },
    topProducts: [
      {
        id: "product-1",
        name: "Premium PMS",
        totalSold: "500.00",
        revenue: "325000.00"
      },
      {
        id: "product-2",
        name: "Engine Oil 10W-40",
        totalSold: "25.00",
        revenue: "12500.00"
      },
      {
        id: "product-3",
        name: "Brake Fluid",
        totalSold: "10.00",
        revenue: "5000.00"
      }
    ]
  }

  describe("Rendering", () => {
    it("should render all metric cards", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText("Today's Sales")).toBeInTheDocument()
      expect(screen.getByText("Transactions")).toBeInTheDocument()
      expect(screen.getByText("Low Stock Items")).toBeInTheDocument()
      expect(screen.getByText("Active Staff")).toBeInTheDocument()
      expect(screen.getByText("PMS Level")).toBeInTheDocument()
      expect(screen.getByText("Top Selling Today")).toBeInTheDocument()
    })

    it("should display formatted currency values", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      // Check if currency is formatted correctly (Nigerian Naira)
      expect(screen.getByText("₦15,001")).toBeInTheDocument() // Rounded to nearest whole number
      expect(screen.getByText(/Avg: ₦600/)).toBeInTheDocument()
    })

    it("should display transaction count", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText("25")).toBeInTheDocument()
      expect(screen.getByText("Today's transaction count")).toBeInTheDocument()
    })

    it("should display stock information", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText("3")).toBeInTheDocument() // Low stock count
      expect(screen.getByText("of 50 products")).toBeInTheDocument()
      expect(screen.getByText("2,500.75 L")).toBeInTheDocument() // PMS level - exact format
    })

    it("should display staff information", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText("4")).toBeInTheDocument() // Active staff
      expect(screen.getByText("of 6 total staff")).toBeInTheDocument()
    })
  })

  describe("Low Stock Styling", () => {
    it("should highlight low stock items in red when count > 0", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      const lowStockValue = screen.getByText("3")
      expect(lowStockValue).toHaveClass("text-red-600")
    })

    it("should show green color when no low stock items", () => {
      const metricsWithNoLowStock = {
        ...mockMetrics,
        stockStatus: {
          ...mockMetrics.stockStatus,
          lowStockCount: 0
        }
      }
      
      render(<MetricsCards metrics={metricsWithNoLowStock} />)
      
      const lowStockValue = screen.getByText("0")
      expect(lowStockValue).toHaveClass("text-green-600")
    })
  })

  describe("Top Products Display", () => {
    it("should display top 3 products", () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText("1. Premium PMS")).toBeInTheDocument()
      expect(screen.getByText("2. Engine Oil 10W-40")).toBeInTheDocument()
      expect(screen.getByText("3. Brake Fluid")).toBeInTheDocument()
      
      // Check revenue display
      expect(screen.getByText("₦325,000")).toBeInTheDocument()
      expect(screen.getByText("₦12,500")).toBeInTheDocument()
      expect(screen.getByText("₦5,000")).toBeInTheDocument()
    })

    it("should show 'No sales today' when no top products", () => {
      const metricsWithNoProducts = {
        ...mockMetrics,
        topProducts: []
      }
      
      render(<MetricsCards metrics={metricsWithNoProducts} />)
      
      expect(screen.getByText("No sales today")).toBeInTheDocument()
    })

    it("should limit display to 3 products even if more exist", () => {
      const metricsWithManyProducts = {
        ...mockMetrics,
        topProducts: [
          ...mockMetrics.topProducts,
          {
            id: "product-4",
            name: "Product 4",
            totalSold: "5.00",
            revenue: "2500.00"
          },
          {
            id: "product-5",
            name: "Product 5",
            totalSold: "3.00",
            revenue: "1500.00"
          }
        ]
      }
      
      render(<MetricsCards metrics={metricsWithManyProducts} />)
      
      expect(screen.getByText("1. Premium PMS")).toBeInTheDocument()
      expect(screen.getByText("2. Engine Oil 10W-40")).toBeInTheDocument()
      expect(screen.getByText("3. Brake Fluid")).toBeInTheDocument()
      expect(screen.queryByText("4. Product 4")).not.toBeInTheDocument()
      expect(screen.queryByText("5. Product 5")).not.toBeInTheDocument()
    })
  })

  describe("Zero Values Handling", () => {
    const zeroMetrics: DashboardMetrics = {
      todaysSales: {
        totalValue: "0",
        transactionCount: 0,
        averageTransaction: "0"
      },
      stockStatus: {
        lowStockCount: 0,
        totalProducts: 0,
        pmsLevel: "0"
      },
      staffActivity: {
        activeStaffCount: 0,
        totalStaff: 0
      },
      topProducts: []
    }

    it("should handle zero values gracefully", () => {
      render(<MetricsCards metrics={zeroMetrics} />)
      
      expect(screen.getByText("₦0")).toBeInTheDocument()
      expect(screen.getAllByText("0")).toHaveLength(3) // Multiple zeros for different metrics
      expect(screen.getByText("0 L")).toBeInTheDocument() // PMS level
      expect(screen.getByText("No sales today")).toBeInTheDocument()
    })

    it("should show zero average transaction", () => {
      render(<MetricsCards metrics={zeroMetrics} />)
      
      expect(screen.getByText(/Avg: ₦0/)).toBeInTheDocument()
    })
  })

  describe("Number Formatting", () => {
    const largeNumberMetrics: DashboardMetrics = {
      todaysSales: {
        totalValue: "1234567.89",
        transactionCount: 1500,
        averageTransaction: "822.38"
      },
      stockStatus: {
        lowStockCount: 25,
        totalProducts: 150,
        pmsLevel: "15000.50"
      },
      staffActivity: {
        activeStaffCount: 12,
        totalStaff: 15
      },
      topProducts: []
    }

    it("should format large numbers with commas", () => {
      render(<MetricsCards metrics={largeNumberMetrics} />)
      
      expect(screen.getByText("₦1,234,568")).toBeInTheDocument() // Rounded currency
      expect(screen.getByText("1,500")).toBeInTheDocument() // Transaction count
      expect(screen.getByText("15,000.5 L")).toBeInTheDocument() // PMS level - exact format
      expect(screen.getByText("of 150 products")).toBeInTheDocument()
    })
  })

  describe("Null/Undefined Handling", () => {
    const metricsWithNulls: DashboardMetrics = {
      todaysSales: {
        totalValue: "1000.00",
        transactionCount: 5,
        averageTransaction: "200.00"
      },
      stockStatus: {
        lowStockCount: 0,
        totalProducts: 10,
        pmsLevel: null // Null PMS level
      },
      staffActivity: {
        activeStaffCount: 2,
        totalStaff: 3
      },
      topProducts: []
    }

    it("should handle null PMS level", () => {
      render(<MetricsCards metrics={metricsWithNulls} />)
      
      expect(screen.getByText("0 L")).toBeInTheDocument() // Should default to 0
    })
  })
})