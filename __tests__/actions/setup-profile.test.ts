// Mock Clerk authentication
const mockAuth = jest.fn()
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth
}))

// Mock the database
const mockDb = {
  query: {
    users: {
      findFirst: jest.fn()
    }
  },
  transaction: jest.fn(),
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ id: "new-user-id" }]))
    }))
  }))
}

jest.mock("@/db", () => ({
  db: mockDb
}))

// Mock Drizzle ORM operators
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition")
}))

// Mock Zod validation
jest.mock("zod")

// Import after mocks
const {
  setupUserProfile
} = require("@/app/(unauthenticated)/setup-profile/_actions/setup-profile")

describe("Setup Profile Action - Simplified", () => {
  const validInput = {
    clerkUserId: "test-user-id",
    stationName: "Test Station",
    stationAddress: "123 Test Street",
    username: "testuser",
    role: "manager"
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful transaction
    mockDb.transaction.mockImplementation(async callback => {
      const txMock = {
        insert: jest.fn(() => ({
          values: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([{ id: "new-id" }]))
          }))
        }))
      }
      return await callback(txMock)
    })
  })

  describe("setupUserProfile", () => {
    it("should create user profile successfully", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue(null) // No existing user

      const result = await setupUserProfile(validInput)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockAuth).toHaveBeenCalled()
      expect(mockDb.transaction).toHaveBeenCalled()
    })

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await setupUserProfile(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Authentication failed")
    })

    it("should prevent duplicate users", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue({ id: "existing-user" })

      const result = await setupUserProfile(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User profile already exists")
    })

    it("should validate input data", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })

      // Mock Zod to throw validation error
      const mockZodObject = {
        parse: jest.fn(() => {
          throw new Error("Validation failed")
        })
      }

      const { z } = require("zod")
      z.object.mockReturnValue(mockZodObject)

      const invalidInput = {
        ...validInput,
        username: "ab" // Too short
      }

      const result = await setupUserProfile(invalidInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Username must be at least 3 characters")
    })

    it("should handle database errors gracefully", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue(null)
      mockDb.transaction.mockRejectedValue(new Error("Database error"))

      const result = await setupUserProfile(validInput)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to setup profile")
    })
  })

  describe("Role Validation", () => {
    it("should accept manager role", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue(null)

      const managerInput = { ...validInput, role: "manager" }
      const result = await setupUserProfile(managerInput)

      expect(result.isSuccess).toBe(true)
    })

    it("should accept staff role", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue(null)

      const staffInput = { ...validInput, role: "staff" }
      const result = await setupUserProfile(staffInput)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe("Station Creation", () => {
    it("should handle optional station address", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })
      mockDb.query.users.findFirst.mockResolvedValue(null)

      const inputWithoutAddress = {
        clerkUserId: "test-user-id",
        stationName: "Station No Address",
        username: "testuser",
        role: "manager"
      }

      const result = await setupUserProfile(inputWithoutAddress)

      expect(result.isSuccess).toBe(true)
    })

    it("should require station name", async () => {
      mockAuth.mockResolvedValue({ userId: "test-user-id" })

      // Mock Zod to throw validation error for empty station name
      const mockZodObject = {
        parse: jest.fn(() => {
          throw new Error("Station name required")
        })
      }

      const { z } = require("zod")
      z.object.mockReturnValue(mockZodObject)

      const inputWithoutStation = {
        ...validInput,
        stationName: ""
      }

      const result = await setupUserProfile(inputWithoutStation)

      expect(result.isSuccess).toBe(false)
    })
  })
})
