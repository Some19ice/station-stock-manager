import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DailyReportTab } from '@/components/reports/daily-report-tab'

// Mock the reports actions
const mockGenerateDailyReport = jest.fn()
jest.mock('@/actions/reports', () => ({
  generateDailyReport: mockGenerateDailyReport
}))

// Mock the station auth hook
const mockUseStationAuth = jest.fn()
jest.mock('@/hooks/use-station-auth', () => ({
  useStationAuth: mockUseStationAuth
}))

// Mock sonner toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn()
}
jest.mock('sonner', () => ({
  toast: mockToast
}))

// Mock window.print and URL methods
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true
})

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  },
  writable: true
})

describe('DailyReportTab', () => {
  const mockUser = {
    id: 'user-123',
    stationId: 'station-123',
    username: 'testuser',
    role: 'manager' as const
  }

  const mockReportData = {
    salesOverview: {
      totalSales: '5000',
      totalTransactions: 10,
      averageTransaction: '500',
      topSellingProduct: 'Premium PMS'
    },
    pmsReport: {
      openingStock: '1000',
      litresSold: '100',
      closingStock: '900',
      revenue: '5000'
    },
    lubricantBreakdown: [
      {
        productName: 'Engine Oil',
        brand: 'Shell',
        openingStock: '50',
        unitsSold: '5',
        closingStock: '45',
        revenue: '2500'
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseStationAuth.mockReturnValue({ user: mockUser })
    
    // Mock current date
    const mockDate = new Date('2024-01-15')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render date input with current date as default', () => {
      render(<DailyReportTab />)
      
      const dateInput = screen.getByLabelText('Report Date')
      expect(dateInput).toBeInTheDocument()
      expect(dateInput).toHaveValue('2024-01-15')
    })

    it('should render generate report button', () => {
      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      expect(generateButton).toBeInTheDocument()
      expect(generateButton).not.toBeDisabled()
    })

    it('should not show report data initially', () => {
      render(<DailyReportTab />)
      
      expect(screen.queryByText('Sales Overview')).not.toBeInTheDocument()
      expect(screen.queryByText('PMS Report')).not.toBeInTheDocument()
    })
  })

  describe('Date Selection', () => {
    it('should update selected date when input changes', () => {
      render(<DailyReportTab />)
      
      const dateInput = screen.getByLabelText('Report Date')
      fireEvent.change(dateInput, { target: { value: '2024-01-10' } })
      
      expect(dateInput).toHaveValue('2024-01-10')
    })

    it('should not allow future dates', () => {
      render(<DailyReportTab />)
      
      const dateInput = screen.getByLabelText('Report Date')
      expect(dateInput).toHaveAttribute('max', '2024-01-15')
    })
  })

  describe('Report Generation', () => {
    it('should generate report successfully', async () => {
      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: true,
        data: mockReportData
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      expect(generateButton).toBeDisabled()
      expect(screen.getByText('Generating...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(mockGenerateDailyReport).toHaveBeenCalledWith({
          stationId: 'station-123',
          startDate: '2024-01-15',
          endDate: '2024-01-15'
        })
      })
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Daily report generated successfully')
      })
      
      expect(generateButton).not.toBeDisabled()
      expect(screen.getByText('Generate Report')).toBeInTheDocument()
    })

    it('should handle report generation failure', async () => {
      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: false,
        error: 'Database connection failed'
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Database connection failed')
      })
    })

    it('should handle missing station information', async () => {
      mockUseStationAuth.mockReturnValue({ user: { ...mockUser, stationId: null } })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Station information not found')
      })
      
      expect(mockGenerateDailyReport).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      mockGenerateDailyReport.mockRejectedValue(new Error('Network error'))

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('An error occurred while generating the report')
      })
    })
  })

  describe('Report Display', () => {
    beforeEach(async () => {
      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: true,
        data: mockReportData
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('Sales Overview')).toBeInTheDocument()
      })
    })

    it('should display sales overview correctly', () => {
      expect(screen.getByText('Sales Overview')).toBeInTheDocument()
      expect(screen.getByText('₦5,000.00')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Premium PMS')).toBeInTheDocument()
    })

    it('should display PMS report correctly', () => {
      expect(screen.getByText('PMS Report')).toBeInTheDocument()
      expect(screen.getByText('1,000 L')).toBeInTheDocument()
      expect(screen.getByText('100 L')).toBeInTheDocument()
      expect(screen.getByText('900 L')).toBeInTheDocument()
    })

    it('should display lubricant breakdown correctly', () => {
      expect(screen.getByText('Lubricant Breakdown')).toBeInTheDocument()
      expect(screen.getByText('Engine Oil')).toBeInTheDocument()
      expect(screen.getByText('Shell')).toBeInTheDocument()
      expect(screen.getByText('50 units')).toBeInTheDocument()
      expect(screen.getByText('5 units')).toBeInTheDocument()
    })

    it('should show export and print buttons when report is generated', () => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
      expect(screen.getByText('Print')).toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    beforeEach(async () => {
      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: true,
        data: mockReportData
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument()
      })
    })

    it('should export CSV when export button is clicked', () => {
      // Mock createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn()
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)

      const exportButton = screen.getByText('Export CSV')
      fireEvent.click(exportButton)
      
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toContain('daily-report-2024-01-15.csv')
    })

    it('should trigger print when print button is clicked', () => {
      const printButton = screen.getByText('Print')
      fireEvent.click(printButton)
      
      expect(window.print).toHaveBeenCalled()
    })
  })

  describe('Empty Data Handling', () => {
    it('should handle empty lubricant breakdown', async () => {
      const emptyReportData = {
        ...mockReportData,
        lubricantBreakdown: []
      }

      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: true,
        data: emptyReportData
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('No lubricant sales recorded for this date')).toBeInTheDocument()
      })
    })
  })

  describe('Currency Formatting', () => {
    it('should format Nigerian currency correctly', async () => {
      mockGenerateDailyReport.mockResolvedValue({
        isSuccess: true,
        data: mockReportData
      })

      render(<DailyReportTab />)
      
      const generateButton = screen.getByText('Generate Report')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        // Check for Nigerian Naira symbol and proper formatting
        expect(screen.getByText('₦5,000.00')).toBeInTheDocument()
        expect(screen.getByText('₦500.00')).toBeInTheDocument()
      })
    })
  })
})