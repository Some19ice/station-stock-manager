// Jest setup file for global test configuration

// Setup jest-dom for React testing
require("@testing-library/jest-dom")

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CLERK_SECRET_KEY = "sk_test_mock"
process.env.STRIPE_SECRET_KEY = "sk_test_mock"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"

// Global test timeout
jest.setTimeout(30000)

// Mock Next.js router - this is safe to mock globally
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    toString: jest.fn()
  }),
  usePathname: () => "/test-path",
  redirect: jest.fn(),
  permanentRedirect: jest.fn(),
  notFound: jest.fn()
}))

// Mock Next.js image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
}))

// Mock Next.js link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    return <a {...props}>{children}</a>
  }
}))

// Mock utility dependencies for styling
jest.mock("clsx", () => ({
  __esModule: true,
  default: jest.fn((...classes) =>
    classes
      .flat()
      .filter(cls => cls && typeof cls === "string")
      .join(" ")
  ),
  clsx: jest.fn((...classes) =>
    classes
      .flat()
      .filter(cls => cls && typeof cls === "string")
      .join(" ")
  )
}))

jest.mock("tailwind-merge", () => ({
  twMerge: jest.fn(classes => classes),
  twJoin: jest.fn((...classes) => classes.filter(Boolean).join(" "))
}))

// Mock class-variance-authority for component variants
jest.mock("class-variance-authority", () => ({
  cva: jest.fn(() => jest.fn(() => "mocked-classes")),
  cx: jest.fn((...classes) => classes.filter(Boolean).join(" "))
}))

// Mock Drizzle ORM functions
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition"),
  and: jest.fn(() => "and-condition"),
  or: jest.fn(() => "or-condition"),
  desc: jest.fn(() => "desc-order"),
  asc: jest.fn(() => "asc-order"),
  sql: jest.fn(() => ({ raw: "sql-query" })),
  relations: jest.fn((table, callback) => {
    // Mock the relations callback structure
    const mockRelations = {
      one: jest.fn(() => ({})),
      many: jest.fn(() => ({}))
    }
    return callback ? callback(mockRelations) : {}
  }),
  count: jest.fn(() => "count-function"),
  sum: jest.fn(() => "sum-function"),
  avg: jest.fn(() => "avg-function"),
  gte: jest.fn(() => "gte-condition"),
  lte: jest.fn(() => "lte-condition"),
  like: jest.fn(() => "like-condition"),
  ilike: jest.fn(() => "ilike-condition")
}))

// Mock database schema relations
jest.mock("@/db/schema", () => ({
  // Mock all schema exports
  customers: {},
  stations: {},
  users: {},
  products: {},
  suppliers: {},
  stockMovements: {},
  sales: {},
  // Mock relations
  customersRelations: {},
  stationsRelations: {},
  usersRelations: {},
  productsRelations: {},
  suppliersRelations: {},
  stockMovementsRelations: {},
  salesRelations: {}
}))

// Mock database schema relations file specifically
jest.mock("@/db/schema/relations", () => ({
  customersRelations: {},
  stationsRelations: {},
  usersRelations: {},
  productsRelations: {},
  suppliersRelations: {},
  stockMovementsRelations: {},
  salesRelations: {}
}))

// Global error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.warn("Unhandled Rejection at:", promise, "reason:", reason)
})

// Suppress console warnings during tests for known issues
const originalError = console.error
const originalWarn = console.warn

console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Warning:") ||
      args[0].includes("ReactDOMTestUtils") ||
      args[0].includes("act()"))
  ) {
    return
  }
  originalError(...args)
}

console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Warning:") ||
      args[0].includes("componentWillReceiveProps") ||
      args[0].includes("Legacy context API"))
  ) {
    return
  }
  originalWarn(...args)
}

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn(() => ({
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn()
}))

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn(() => ({
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn()
}))

// Mock matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock scrollTo for components that use it
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true
})
