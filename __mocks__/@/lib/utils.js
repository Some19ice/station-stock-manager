// Mock for @/lib/utils
const cn = jest.fn((...inputs) => {
  // Simple implementation that flattens and joins class names
  const classes = inputs
    .flat()
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') {
        return input
      }
      if (typeof input === 'object' && input !== null) {
        // Handle object syntax like { 'class-name': true, 'other-class': false }
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ')
      }
      return String(input)
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return classes
})

// Common utility function mocks
const formatCurrency = jest.fn((amount, currency = 'NGN') => {
  const symbol = currency === 'NGN' ? '₦' : '$'
  return `${symbol}${amount.toLocaleString()}`
})

const formatDate = jest.fn((date, format = 'short') => {
  if (!date) return ''
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString()
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return d.toISOString()
})

const formatNumber = jest.fn((num, decimals = 0) => {
  return Number(num).toFixed(decimals)
})

const truncateText = jest.fn((text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
})

const slugify = jest.fn((text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
})

const capitalizeFirst = jest.fn((text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
})

const generateId = jest.fn(() => {
  return `mock-id-${Math.random().toString(36).substr(2, 9)}`
})

const sleep = jest.fn(async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
})

const debounce = jest.fn((func, wait) => {
  let timeout
  const debounced = (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
  debounced.cancel = () => clearTimeout(timeout)
  return debounced
})

const throttle = jest.fn((func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
})

const isEmpty = jest.fn((value) => {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)
})

const isValidEmail = jest.fn((email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
})

const isValidPhone = jest.fn((phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
})

const parseJSON = jest.fn((str, fallback = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
})

const copyToClipboard = jest.fn(async (text) => {
  // Mock implementation for testing
  return Promise.resolve(text)
})

const downloadFile = jest.fn((data, filename, mimeType = 'text/plain') => {
  // Mock implementation for testing
  return { data, filename, mimeType }
})

const getErrorMessage = jest.fn((error) => {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
})

const randomBetween = jest.fn((min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
})

const clamp = jest.fn((num, min, max) => {
  return Math.min(Math.max(num, min), max)
})

const arrayToObject = jest.fn((array, key) => {
  return array.reduce((obj, item) => {
    obj[item[key]] = item
    return obj
  }, {})
})

const groupBy = jest.fn((array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
})

const sortBy = jest.fn((array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (direction === 'desc') {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
  })
})

const uniqueBy = jest.fn((array, key) => {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
})

// Export all mocked utilities
module.exports = {
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
  truncateText,
  slugify,
  capitalizeFirst,
  generateId,
  sleep,
  debounce,
  throttle,
  isEmpty,
  isValidEmail,
  isValidPhone,
  parseJSON,
  copyToClipboard,
  downloadFile,
  getErrorMessage,
  randomBetween,
  clamp,
  arrayToObject,
  groupBy,
  sortBy,
  uniqueBy
}
