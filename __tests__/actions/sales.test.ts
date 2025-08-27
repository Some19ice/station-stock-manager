import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { recordSale, getSalesHistory, getTodaysSalesSummary } from '@/actions/sales'

// Mock the auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

// Mock the database
jest.mock('@/db', () => ({
  db: {
    transaction: jest.fn(),
    query: {
      users: {
        findFirst: jest.fn()
      },
      products: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      },
      transactions: {
        findMany: jest.fn()
      }
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}))

const mockAuth = require('@clerk/nextjs/server').auth as jest.MockedFunction<any>
const mockDb = require('@/db').db

describe('Sales Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('recordSale', () => {
    const mockSaleData = {
      stationId: 'station-123',
      items: [
        {
          productId: 'product-1',
          quantity: 10,
          unitPrice: 150
        }
      ],
      totalAmount: 1500
    }

    const mockUser = {
      id: 'user-123',
      stationId: 'station-123',
      role: 'staff'
    }

    const mockProduct = {
      id: 'product-1',
      name: 'Premium PMS',
      type: 'pms',
      currentStock: '100',
      unitPrice: '150',
      unit: 'litres'
    }

    it('should record a sale successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)
      
      mockDb.transaction.mockImplementation(async (callback) => {
        // Mock the transaction callback
        const mockTx = {
          query: {
            products: {
              findFirst: jest.fn().mockResolvedValue(mockProduct)
            }
          },
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{
                id: 'transaction-123',
                stationId: 'station-123',
                userId: 'user-123',
                totalAmount: '1500'
              }])
            })
          }),
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined)
            })
          })
        }
        
        return await callback(mockTx)
      })

      const result = await recordSale(mockSaleData)

      expect(result.isSuccess).toBe(true)
      expect(mockDb.transaction).toHaveBeenCalled()
    })

    it('should fail when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await recordSale(mockSaleData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('should fail when user does not belong to station', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue({
        ...mockUser,
        stationId: 'different-station'
      })

      const result = await recordSale(mockSaleData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Access denied for this station')
    })

    it('should fail with insufficient stock', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)
      
      mockDb.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          query: {
            products: {
              findFirst: jest.fn().mockResolvedValue({
                ...mockProduct,
                currentStock: '5' // Less than requested quantity
              })
            }
          }
        }
        
        try {
          return await callback(mockTx)
        } catch (error) {
          throw error
        }
      })

      const result = await recordSale(mockSaleData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Insufficient stock')
    })

    it('should validate input data', async () => {
      const invalidSaleData = {
        stationId: '',
        items: [],
        totalAmount: -100
      }

      const result = await recordSale(invalidSaleData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getSalesHistory', () => {
    const mockHistoryData = {
      stationId: 'station-123',
      limit: 10
    }

    const mockUser = {
      id: 'user-123',
      stationId: 'station-123',
      role: 'staff'
    }

    it('should fetch sales history successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)
      mockDb.query.transactions.findMany.mockResolvedValue([
        {
          id: 'transaction-1',
          totalAmount: '1500',
          transactionDate: new Date(),
          user: { username: 'staff1' },
          items: []
        }
      ])

      const result = await getSalesHistory(mockHistoryData)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should fail when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getSalesHistory(mockHistoryData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('getTodaysSalesSummary', () => {
    const mockUser = {
      id: 'user-123',
      stationId: 'station-123',
      role: 'staff'
    }

    it('should fetch today\'s sales summary successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)
      mockDb.query.transactions.findMany.mockResolvedValue([
        {
          id: 'transaction-1',
          totalAmount: '1500',
          transactionDate: new Date(),
          items: [
            {
              id: 'item-1',
              quantity: '10',
              totalPrice: '1500',
              product: {
                id: 'product-1',
                name: 'Premium PMS',
                type: 'pms',
                unit: 'litres'
              }
            }
          ]
        }
      ])

      const result = await getTodaysSalesSummary('station-123')

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.totalTransactions).toBe(1)
      expect(result.data?.totalAmount).toBe(1500)
    })

    it('should handle empty sales data', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk-user-123' })
      mockDb.query.users.findFirst.mockResolvedValue(mockUser)
      mockDb.query.transactions.findMany.mockResolvedValue([])

      const result = await getTodaysSalesSummary('station-123')

      expect(result.isSuccess).toBe(true)
      expect(result.data?.totalTransactions).toBe(0)
      expect(result.data?.totalAmount).toBe(0)
    })
  })
})