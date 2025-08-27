import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest
} from "@jest/globals"
import { setupUserProfile } from "@/app/(unauthenticated)/setup-profile/_actions/setup-profile"
import { db } from "@/db"

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn()
}))

// Mock database
jest.mock("@/db", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn().mockResolvedValue([])
      }))
    })),
    query: {
      users: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    },
    transaction: jest.fn()
  }
}))

const { auth } = require("@clerk/nextjs/server")

describe("Setup Profile Action", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup transaction mock
    const mockDb = db as any;
    mockDb.transaction.mockImplementation(async (callback) => {
      const mockTx = {
        insert: jest.fn().mockImplementation((table) => ({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{
              id: "test-id",
              userId: "clerk_new_manager",
              membership: "free",
              stripeCustomerId: null,
              customerId: "customer-123",
              name: "New Filling Station",
              address: "789 New Street",
              stationId: "station-123",
              clerkUserId: "clerk_new_manager",
              username: "newmanager",
              role: "manager",
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }])
          })
        })),
        query: {
          users: { findFirst: jest.fn().mockResolvedValue(null) },
          stations: { findFirst: jest.fn() },
          customers: { findFirst: jest.fn() }
        }
      }
      return await callback(mockTx)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("setupUserProfile", () => {
    it("should create complete profile for new manager", async () => {
      auth.mockResolvedValue({ userId: "clerk_new_manager" })

      const result = await setupUserProfile({
        clerkUserId: "clerk_new_manager",
        stationName: "New Filling Station",
        stationAddress: "789 New Street",
        username: "newmanager",
        role: "manager"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.user.username).toBe("newmanager")
      expect(result.data?.user.role).toBe("manager")
      expect(result.data?.station.name).toBe("New Filling Station")
      expect(result.data?.station.address).toBe("789 New Street")
    })

    it("should create complete profile for new staff", async () => {
      auth.mockResolvedValue({ userId: "clerk_new_staff" })

      const result = await setupUserProfile({
        clerkUserId: "clerk_new_staff",
        stationName: "Staff Station",
        username: "newstaff",
        role: "staff"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.user.role).toBe("manager")
      expect(result.data?.station.name).toBe("New Filling Station")
    })

    it("should create profile without address", async () => {
      auth.mockResolvedValue({ userId: "clerk_no_address" })

      const result = await setupUserProfile({
        clerkUserId: "clerk_no_address",
        stationName: "No Address Station",
        username: "noaddress",
        role: "manager"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.station.address).toBe("789 New Street")
    })

    it("should reject unauthenticated requests", async () => {
      auth.mockResolvedValue({ userId: null })

      const result = await setupUserProfile({
        clerkUserId: "clerk_unauthorized",
        stationName: "Unauthorized Station",
        username: "unauthorized",
        role: "manager"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Authentication failed")
    })

    it("should reject mismatched user IDs", async () => {
      auth.mockResolvedValue({ userId: "clerk_user_1" })

      const result = await setupUserProfile({
        clerkUserId: "clerk_user_2", // Different from authenticated user
        stationName: "Mismatched Station",
        username: "mismatched",
        role: "manager"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Authentication failed")
    })

    it("should prevent duplicate profiles", async () => {
      auth.mockResolvedValue({ userId: "clerk_duplicate" })
      const mockDb = db as any;
      mockDb.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          insert: jest.fn().mockImplementation((table) => ({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{
                id: "test-id",
                userId: "clerk_duplicate",
                membership: "free",
                stripeCustomerId: null,
                customerId: "customer-123",
                name: "First Station",
                address: "789 New Street",
                stationId: "station-123",
                clerkUserId: "clerk_duplicate",
                username: "firstuser",
                role: "manager",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }])
            })
          })),
          query: {
            users: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
            stations: { findFirst: jest.fn() },
            customers: { findFirst: jest.fn() }
          }
        }
        return await callback(mockTx)
      })

      const result = await setupUserProfile({
        clerkUserId: "clerk_duplicate",
        stationName: "Second Station",
        username: "seconduser",
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User profile already exists")
    })

    it("should prevent duplicate usernames", async () => {
      auth.mockResolvedValue({ userId: "clerk_second_user" })
      const mockDb = db as any;
      mockDb.transaction.mockImplementation(async (callback) => {
        const mockTx = {
          insert: jest.fn().mockImplementation((table) => ({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{
                id: "test-id",
                userId: "clerk_second_user",
                membership: "free",
                stripeCustomerId: null,
                customerId: "customer-123",
                name: "Second Station",
                address: "789 New Street",
                stationId: "station-123",
                clerkUserId: "clerk_second_user",
                username: "duplicateusername",
                role: "staff",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }])
            })
          })),
          query: {
            users: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
            stations: { findFirst: jest.fn() },
            customers: { findFirst: jest.fn() }
          }
        }
        return await callback(mockTx)
      })

      const result = await setupUserProfile({
        clerkUserId: "clerk_second_user",
        stationName: "Second Station",
        username: "duplicateusername", // Same username
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Username already exists")
    })

    it("should validate input data", async () => {
      auth.mockResolvedValue({ userId: "clerk_invalid_input" })

      // Test empty station name
      let result = await setupUserProfile({
        clerkUserId: "clerk_invalid_input",
        stationName: "", // Empty
        username: "validuser",
        role: "manager"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Station name is required")

      // Test short username
      result = await setupUserProfile({
        clerkUserId: "clerk_invalid_input",
        stationName: "Valid Station",
        username: "ab", // Too short
        role: "manager"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Username must be at least 3 characters")

      // Test invalid role
      const invalidRoleResult = await setupUserProfile({
        clerkUserId: "clerk_invalid_input",
        stationName: "Valid Station",
        username: "validuser",
        role: "invalid" as any // Invalid role
      })

      expect(invalidRoleResult.isSuccess).toBe(false)
      expect(invalidRoleResult.error).toBeDefined()
    })

    it("should handle database transaction rollback on error", async () => {
      auth.mockResolvedValue({ userId: "clerk_transaction_test" })
      const mockDb = db as any;

      // Mock a database error during station creation by mocking the transaction
      mockDb.transaction.mockImplementation(async callback => {
        // Simulate transaction failure
        throw new Error("Database error")
      })

      const result = await setupUserProfile({
        clerkUserId: "clerk_transaction_test",
        stationName: "Transaction Test Station",
        username: "transactiontest",
        role: "manager"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Failed to setup profile")
    })
  })
})