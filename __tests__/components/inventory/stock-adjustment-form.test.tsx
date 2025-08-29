/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form"

// Mock the inventory actions
jest.mock("@/actions/inventory", () => ({
  recordStockAdjustment: jest.fn()
}))

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock the utility functions
jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((amount) => `₦${amount.toLocaleString()}`)
}))

import { recordStockAdjustment } from "@/actions/inventory"
import { toast } from "sonner"

const mockRecordStockAdjustment = recordStockAdjustment as jest.MockedFunction<typeof recordStockAdjustment>

describe("StockAdjustmentForm", () => {
  const mockProduct = {
    id: "product-123",
    name: "Premium PMS",
    brand: "Shell",
    type: "pms" as const,
    currentStock: 100,
    unitPrice: 650,
    unit: "litres",
    minThreshold: 20
  }

  const mockProps = {
    product: mockProduct,
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRecordStockAdjustment.mockResolvedValue({
      isSuccess: true,
      data: {
        product: mockProduct,
        movement: { id: "movement-123" },
        previousStock: 100,
        newStock: 110,
        adjustment: 10
      }
    })
  })

  it("should render product information", () => {
    render(<StockAdjustmentForm {...mockProps} />)

    expect(screen.getByText("Product Information")).toBeInTheDocument()
    expect(screen.getByText("Premium PMS (Shell)")).toBeInTheDocument()
    expect(screen.getByText("100 litres")).toBeInTheDocument()
    expect(screen.getByText("20 litres")).toBeInTheDocument()
  })

  it("should handle form submission for stock increase", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Select increase adjustment type
    const adjustmentTypeSelect = screen.getByDisplayValue("Increase Stock")
    expect(adjustmentTypeSelect).toBeInTheDocument()

    // Enter quantity
    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "10")

    // Select reason
    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Counting error"))

    // Submit form
    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRecordStockAdjustment).toHaveBeenCalledWith({
        productId: "product-123",
        quantity: 10,
        reason: "Counting error",
        reference: undefined
      })
      expect(toast.success).toHaveBeenCalledWith("Stock adjustment recorded successfully")
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })

  it("should handle form submission for stock decrease", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Select decrease adjustment type
    const adjustmentTypeSelect = screen.getByRole("combobox")
    await user.click(adjustmentTypeSelect)
    await user.click(screen.getByText("Decrease Stock"))

    // Enter quantity
    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "5")

    // Select reason
    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Damaged goods"))

    // Submit form
    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRecordStockAdjustment).toHaveBeenCalledWith({
        productId: "product-123",
        quantity: -5,
        reason: "Damaged goods",
        reference: undefined
      })
    })
  })

  it("should show custom reason field when 'Other' is selected", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Select 'Other' reason
    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Other"))

    // Custom reason field should appear
    expect(screen.getByLabelText("Custom Reason *")).toBeInTheDocument()
  })

  it("should display adjustment preview", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Enter quantity to trigger preview
    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "10")

    await waitFor(() => {
      expect(screen.getByText("Adjustment Preview")).toBeInTheDocument()
      expect(screen.getByText("Current Stock:")).toBeInTheDocument()
      expect(screen.getByText("100 litres")).toBeInTheDocument()
      expect(screen.getByText("New Stock Level:")).toBeInTheDocument()
      expect(screen.getByText("110 litres")).toBeInTheDocument()
    })
  })

  it("should show warning for low stock threshold", async () => {
    const user = userEvent.setup()
    const lowStockProduct = { ...mockProduct, currentStock: 25 }
    render(<StockAdjustmentForm {...mockProps} product={lowStockProduct} />)

    // Select decrease and enter quantity that would go below threshold
    const adjustmentTypeSelect = screen.getByRole("combobox")
    await user.click(adjustmentTypeSelect)
    await user.click(screen.getByText("Decrease Stock"))

    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "10") // 25 - 10 = 15, below threshold of 20

    await waitFor(() => {
      expect(screen.getByText(/below minimum threshold/i)).toBeInTheDocument()
    })
  })

  it("should prevent negative stock adjustments", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Select decrease and enter quantity larger than current stock
    const adjustmentTypeSelect = screen.getByRole("combobox")
    await user.click(adjustmentTypeSelect)
    await user.click(screen.getByText("Decrease Stock"))

    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "150") // More than current stock of 100

    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Damaged goods"))

    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Adjustment would result in negative stock")
    })
  })

  it("should handle form validation errors", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    // Try to submit without filling required fields
    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter a valid quantity")
    })
  })

  it("should handle API errors", async () => {
    const user = userEvent.setup()
    mockRecordStockAdjustment.mockResolvedValue({
      isSuccess: false,
      error: "Database error"
    })

    render(<StockAdjustmentForm {...mockProps} />)

    // Fill form and submit
    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "10")

    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Counting error"))

    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Database error")
    })
  })

  it("should handle cancel action", async () => {
    const user = userEvent.setup()
    render(<StockAdjustmentForm {...mockProps} />)

    const cancelButton = screen.getByText("Cancel")
    await user.click(cancelButton)

    expect(mockProps.onCancel).toHaveBeenCalled()
  })

  it("should disable submit button when form is invalid", () => {
    render(<StockAdjustmentForm {...mockProps} />)

    const submitButton = screen.getByText("Record Adjustment")
    expect(submitButton).toBeDisabled()
  })

  it("should show submitting state", async () => {
    const user = userEvent.setup()
    mockRecordStockAdjustment.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<StockAdjustmentForm {...mockProps} />)

    // Fill form
    const quantityInput = screen.getByLabelText("Quantity *")
    await user.type(quantityInput, "10")

    const reasonSelect = screen.getByRole("combobox", { name: /reason/i })
    await user.click(reasonSelect)
    await user.click(screen.getByText("Counting error"))

    // Submit form
    const submitButton = screen.getByText("Record Adjustment")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Recording...")).toBeInTheDocument()
    })
  })
})