import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportsInterface } from '@/components/reports/reports-interface'

// Mock the child components
jest.mock('@/components/reports/daily-report-tab', () => ({
  DailyReportTab: () => <div data-testid="daily-report-tab">Daily Report Tab</div>
}))

jest.mock('@/components/reports/staff-performance-tab', () => ({
  StaffPerformanceTab: () => <div data-testid="staff-performance-tab">Staff Performance Tab</div>
}))

jest.mock('@/components/reports/low-stock-alerts-tab', () => ({
  LowStockAlertsTab: () => <div data-testid="low-stock-alerts-tab">Low Stock Alerts Tab</div>
}))

jest.mock('@/components/reports/weekly-monthly-tab', () => ({
  WeeklyMonthlyTab: () => <div data-testid="weekly-monthly-tab">Weekly Monthly Tab</div>
}))

describe('ReportsInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default tab selected', () => {
      render(<ReportsInterface />)
      
      expect(screen.getByText('Business Reports')).toBeInTheDocument()
      expect(screen.getByText('Generate and view comprehensive reports for your station')).toBeInTheDocument()
      expect(screen.getByTestId('daily-report-tab')).toBeInTheDocument()
    })

    it('should render all tab triggers', () => {
      render(<ReportsInterface />)
      
      expect(screen.getByText('Daily Reports')).toBeInTheDocument()
      expect(screen.getByText('Staff Performance')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
      expect(screen.getByText('Weekly/Monthly')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to staff performance tab when clicked', () => {
      render(<ReportsInterface />)
      
      fireEvent.click(screen.getByText('Staff Performance'))
      
      expect(screen.getByTestId('staff-performance-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('daily-report-tab')).not.toBeInTheDocument()
    })

    it('should switch to low stock alerts tab when clicked', () => {
      render(<ReportsInterface />)
      
      fireEvent.click(screen.getByText('Low Stock Alerts'))
      
      expect(screen.getByTestId('low-stock-alerts-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('daily-report-tab')).not.toBeInTheDocument()
    })

    it('should switch to weekly/monthly tab when clicked', () => {
      render(<ReportsInterface />)
      
      fireEvent.click(screen.getByText('Weekly/Monthly'))
      
      expect(screen.getByTestId('weekly-monthly-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('daily-report-tab')).not.toBeInTheDocument()
    })

    it('should switch back to daily reports tab', () => {
      render(<ReportsInterface />)
      
      // Switch to another tab first
      fireEvent.click(screen.getByText('Staff Performance'))
      expect(screen.getByTestId('staff-performance-tab')).toBeInTheDocument()
      
      // Switch back to daily reports
      fireEvent.click(screen.getByText('Daily Reports'))
      expect(screen.getByTestId('daily-report-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('staff-performance-tab')).not.toBeInTheDocument()
    })
  })

  describe('Tab Content', () => {
    it('should show only one tab content at a time', () => {
      render(<ReportsInterface />)
      
      // Initially daily report should be visible
      expect(screen.getByTestId('daily-report-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('staff-performance-tab')).not.toBeInTheDocument()
      expect(screen.queryByTestId('low-stock-alerts-tab')).not.toBeInTheDocument()
      expect(screen.queryByTestId('weekly-monthly-tab')).not.toBeInTheDocument()
      
      // Switch to staff performance
      fireEvent.click(screen.getByText('Staff Performance'))
      expect(screen.queryByTestId('daily-report-tab')).not.toBeInTheDocument()
      expect(screen.getByTestId('staff-performance-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('low-stock-alerts-tab')).not.toBeInTheDocument()
      expect(screen.queryByTestId('weekly-monthly-tab')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for tabs', () => {
      render(<ReportsInterface />)
      
      const tabsList = screen.getByRole('tablist')
      expect(tabsList).toBeInTheDocument()
      
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(4)
      
      // Check that first tab is selected by default
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[3]).toHaveAttribute('aria-selected', 'false')
    })

    it('should update aria-selected when tab changes', () => {
      render(<ReportsInterface />)
      
      const tabs = screen.getAllByRole('tab')
      
      // Click on staff performance tab
      fireEvent.click(tabs[1])
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[3]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Layout', () => {
    it('should have proper card structure', () => {
      render(<ReportsInterface />)
      
      const card = screen.getByText('Business Reports').closest('[class*="card"]')
      expect(card).toBeInTheDocument()
      
      const cardHeader = screen.getByText('Business Reports').closest('[class*="card-header"]')
      expect(cardHeader).toBeInTheDocument()
      
      const cardContent = screen.getByText('Generate and view comprehensive reports for your station').closest('[class*="card-content"]')
      expect(cardContent).toBeInTheDocument()
    })

    it('should have proper grid layout for tabs', () => {
      render(<ReportsInterface />)
      
      const tabsList = screen.getByRole('tablist')
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-4')
    })
  })
})