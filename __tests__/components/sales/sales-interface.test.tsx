import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SalesInterface } from '@/components/sales/sales-interface'

// Mock the actions
const mockRecordSale = jest.fn()
const mockGetProducts = jest.fn()

jest.mock('@/actions/sales', () => ({
  recordSale: mockRecordSale
}))

jest.mock('@/actions/products', () => ({
  getProducts: mockGetProducts
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

describe('SalesInterface', () => {
  const mockProps = {
    stationId: 'station-123',
    onSaleComplete: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful mock for getProducts
    mockGetProducts.mockResolvedValue({
      isSuccess: true,
      data: []
    })
    
    // Default successful mock for recordSale
    mockRecordSale.mockResolvedValue({
      isSuccess: true,
      data: { id: 'transaction-123' }
    })
  })

  it('should render product type selection initially', () => {
    render(<SalesInterface {...mockProps} />)

    expect(screen.getByText('Select Product Type')).toBeInTheDocument()
    expect(screen.getByText('PMS (Petrol)')).toBeInTheDocument()
    expect(screen.getByText('Lubricants')).toBeInTheDocument()
  })

  it('should show PMS sales interface when PMS is selected', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    const pmsCard = screen.getByText('PMS (Petrol)').closest('div')
    await user.click(pmsCard!)

    expect(screen.getByText('PMS Sales')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search PMS products...')).toBeInTheDocument()
  })

  it('should show lubricant sales interface when lubricants is selected', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    const lubricantCard = screen.getByText('Lubricants').closest('div')
    await user.click(lubricantCard!)

    expect(screen.getByText('Lubricant Sales')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search lubricants...')).toBeInTheDocument()
  })

  it('should call getProducts when product type is selected', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    const pmsCard = screen.getByText('PMS (Petrol)').closest('div')
    await user.click(pmsCard!)

    expect(mockGetProducts).toHaveBeenCalledWith('station-123', 'pms')
  })

  it('should show empty cart initially', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    const pmsCard = screen.getByText('PMS (Petrol)').closest('div')
    await user.click(pmsCard!)

    expect(screen.getByText('Cart (0 items)')).toBeInTheDocument()
    expect(screen.getByText('Cart is empty')).toBeInTheDocument()
  })

  it('should go back to product type selection', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    // Select PMS type
    const pmsCard = screen.getByText('PMS (Petrol)').closest('div')
    await user.click(pmsCard!)

    expect(screen.getByText('PMS Sales')).toBeInTheDocument()

    // Go back
    const backButton = screen.getByText('← Back')
    await user.click(backButton)

    expect(screen.getByText('Select Product Type')).toBeInTheDocument()
  })

  it('should handle search input', async () => {
    const user = userEvent.setup()
    render(<SalesInterface {...mockProps} />)

    // Select PMS type
    const pmsCard = screen.getByText('PMS (Petrol)').closest('div')
    await user.click(pmsCard!)

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search PMS products...')
    await user.type(searchInput, 'Premium')

    expect(searchInput).toHaveValue('Premium')
  })
})