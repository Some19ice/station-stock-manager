// Core data model interfaces for Station Stock Manager

export interface Station {
  id: string
  customerId: string
  name: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  stationId: string
  clerkUserId: string
  username: string
  role: 'staff' | 'manager'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  stationId: string
  name: string
  brand?: string
  type: 'pms' | 'lubricant'
  viscosity?: string
  containerSize?: string
  currentStock: number
  unitPrice: number
  minThreshold: number
  unit: 'litres' | 'units'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  stationId: string
  userId: string
  totalAmount: number
  transactionDate: Date
  syncStatus: 'pending' | 'synced' | 'failed'
  items?: TransactionItem[]
  createdAt: Date
}

export interface TransactionItem {
  id: string
  transactionId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: Product
}

export interface StockMovement {
  id: string
  productId: string
  movementType: 'sale' | 'adjustment' | 'delivery'
  quantity: number
  previousStock: number
  newStock: number
  reference?: string
  createdAt: Date
}

// Offline data models for PWA functionality
export interface OfflineTransaction {
  tempId: string
  stationId: string
  userId: string
  items: OfflineTransactionItem[]
  totalAmount: number
  timestamp: Date
  syncAttempts: number
}

export interface OfflineTransactionItem {
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SyncQueue {
  transactions: OfflineTransaction[]
  lastSyncAttempt: Date
  pendingCount: number
  failedCount: number
}

export interface CachedData {
  products: Product[]
  userProfile: User
  lastUpdated: Date
  version: string
}

// Input/Output types for API operations
export interface CreateStationData {
  customerId: string
  name: string
  address?: string
}

export interface CreateUserData {
  stationId: string
  clerkUserId: string
  username: string
  role: 'staff' | 'manager'
}

export interface CreateProductData {
  stationId: string
  name: string
  brand?: string
  type: 'pms' | 'lubricant'
  viscosity?: string
  containerSize?: string
  currentStock: number
  unitPrice: number
  minThreshold: number
  unit: 'litres' | 'units'
}

export interface UpdateProductData {
  name?: string
  brand?: string
  viscosity?: string
  containerSize?: string
  currentStock?: number
  unitPrice?: number
  minThreshold?: number
  isActive?: boolean
}

export interface CreateSaleData {
  stationId: string
  userId: string
  items: CreateSaleItemData[]
  totalAmount: number
}

export interface CreateSaleItemData {
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Filter and query types
export interface SalesFilters {
  stationId: string
  userId?: string
  startDate?: Date
  endDate?: Date
  productType?: 'pms' | 'lubricant'
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

// Dashboard and reporting types
export interface DashboardMetrics {
  totalSales: number
  transactionCount: number
  topSellingProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    revenue: number
  }>
  lowStockAlerts: Array<{
    productId: string
    productName: string
    currentStock: number
    minThreshold: number
  }>
  activeStaffCount: number
}

export interface DailyReport {
  date: Date
  salesOverview: {
    totalValue: number
    transactionCount: number
    averageTransaction: number
  }
  pmsReport: {
    openingStock: number
    litresSold: number
    closingStock: number
    revenue: number
  }
  lubricantBreakdown: Array<{
    productName: string
    openingStock: number
    unitsSold: number
    closingStock: number
    revenue: number
  }>
  staffPerformance: Array<{
    userId: string
    username: string
    transactionCount: number
    totalSales: number
  }>
}

// API response types
export interface ApiResponse<T = unknown> {
  isSuccess: boolean
  data?: T
  error?: string
}

// Validation schemas (for use with Zod)
export interface StockUpdateData {
  productId: string
  quantity: number
  movementType: 'sale' | 'adjustment' | 'delivery'
  reference?: string
}