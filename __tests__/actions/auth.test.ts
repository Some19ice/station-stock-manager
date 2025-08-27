import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest
} from "@jest/globals"
import {
  getCurrentUserProfile,
  getUserRole,
  validateUserRole,
  createStationUser,
  updateUserStatus,
  getStationUsers
} from "@/actions/auth"
import { db } from "@/db"

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn()
}))

// Mock database
jest.mock("@/db", () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    query: {
      users: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      },
      stations: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      },
      customers: {
        findFirst: jest.fn(),
        findMany: jest.fn()
      }
    },
    transaction: jest.fn()
  }
}))

const { auth } = require("@clerk/nextjs/server")

describe("Authentication Actions", () => {
  let testCustomer: any
  let testStation: any
  let testManagerUser: any
  let testStaffUser: any

  beforeEach(async () => {
    jest.clearAllMocks()

    // Mock test data
    testCustomer = {
      id: "customer-123",
      userId: "test-customer-user-id",
      membership: "free",
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testStation = {
      id: "station-123",
      customerId: testCustomer.id,
      name: "Test Filling Station",
      address: "123 Test Street",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testManagerUser = {
      id: "manager-123",
      stationId: testStation.id,
      clerkUserId: "clerk_manager_123",
      username: "manager1",
      role: "manager",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testStaffUser = {
      id: "staff-123",
      stationId: testStation.id,
      clerkUserId: "clerk_staff_123",
      username: "staff1",
      role: "staff",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getCurrentUserProfile", () => {
    it("should return user profile with station for authenticated user", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      
      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                user: testManagerUser,
                station: testStation
              }])
            })
          })
        })
      });

      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.user.username).toBe("manager1")
      expect(result.data?.station.name).toBe("Test Filling Station")
    })

    it("should return error for unauthenticated user", async () => {
      auth.mockResolvedValue({ userId: null })

      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })

    it("should return error for user without profile", async () => {
      auth.mockResolvedValue({ userId: "nonexistent_user" })
      
      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User profile not found")
    })
  })

  describe("getUserRole", () => {
    it("should return manager role for manager user", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)

      const result = await getUserRole()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe("manager")
    })

    it("should return staff role for staff user", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await getUserRole()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe("staff")
    })

    it("should return error for inactive user", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue({
        ...testStaffUser,
        isActive: false
      })

      const result = await getUserRole()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User account is inactive")
    })

    it("should return error for unauthenticated user", async () => {
      auth.mockResolvedValue({ userId: null })

      const result = await getUserRole()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })
  })

  describe("validateUserRole", () => {
    it("should allow manager to access manager-only functions", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)

      const result = await validateUserRole("manager")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe(true)
    })

    it("should allow manager to access staff functions", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)

      const result = await validateUserRole("staff")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe(true)
    })

    it("should allow staff to access staff functions", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await validateUserRole("staff")

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe(true)
    })

    it("should deny staff access to manager-only functions", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await validateUserRole("manager")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Insufficient permissions")
    })
  })

  describe("createStationUser", () => {
    it("should allow manager to create staff user", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role check
        .mockResolvedValueOnce(null) // For username check
        .mockResolvedValueOnce(null) // For clerk user ID check
      
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                user: testManagerUser,
                station: testStation
              }])
            })
          })
        })
      });

      const newStaffUser = {
        id: "new-staff-123",
        stationId: testStation.id,
        clerkUserId: "clerk_new_staff",
        username: "newstaff",
        role: "staff",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newStaffUser])
        })
      });

      const result = await createStationUser({
        stationId: testStation.id,
        clerkUserId: "clerk_new_staff",
        username: "newstaff",
        role: "staff"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.username).toBe("newstaff")
      expect(result.data?.role).toBe("staff")
    })

    it("should allow manager to create another manager", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([testManagerUser])
        })
      });

      const result = await createStationUser({
        stationId: testStation.id,
        clerkUserId: "clerk_new_manager",
        username: "newmanager",
        role: "manager"
      })

      expect(result.isSuccess).toBe(true)
      expect(result.data?.role).toBe("manager")
    })

    it("should deny staff from creating users", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await createStationUser({
        stationId: testStation.id,
        clerkUserId: "clerk_new_user",
        username: "newuser",
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can create user accounts")
    })

    it("should prevent duplicate usernames", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.query.users.findFirst.mockResolvedValueOnce(testManagerUser) // For role check
        .mockResolvedValueOnce(testManagerUser) // For username check

      const result = await createStationUser({
        stationId: testStation.id,
        clerkUserId: "clerk_duplicate",
        username: "manager1", // Already exists
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Username already exists")
    })

    it("should prevent duplicate Clerk user IDs", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.query.users.findFirst.mockResolvedValueOnce(testManagerUser) // For role check
        .mockResolvedValueOnce(null) // For username check
        .mockResolvedValueOnce(testStaffUser) // For clerk user ID check

      const result = await createStationUser({
        stationId: testStation.id,
        clerkUserId: "clerk_staff_123", // Already exists
        username: "uniqueusername",
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User already has a station account")
    })
  })

  describe("updateUserStatus", () => {
    it("should allow manager to deactivate staff user", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{...testStaffUser, isActive: false}])
          })
        })
      });

      const result = await updateUserStatus(testStaffUser.id, false)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.isActive).toBe(false)
    })

    it("should allow manager to activate staff user", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{...testStaffUser, isActive: true}])
          })
        })
      });

      const result = await updateUserStatus(testStaffUser.id, true)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.isActive).toBe(true)
    })

    it("should prevent manager from deactivating themselves", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)

      const result = await updateUserStatus(testManagerUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Cannot deactivate your own account")
    })

    it("should deny staff from updating user status", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await updateUserStatus(testStaffUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update user status")
    })
  })

  describe("getStationUsers", () => {
    it("should allow manager to get all station users", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      mockDb.query.users.findMany.mockResolvedValue([testManagerUser, testStaffUser])

      const result = await getStationUsers()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toHaveLength(2) // manager + staff
      expect(result.data?.some(u => u.username === "manager1")).toBe(true)
      expect(result.data?.some(u => u.username === "staff1")).toBe(true)
    })

    it("should deny staff from getting all users", async () => {
      auth.mockResolvedValue({ userId: "clerk_staff_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testStaffUser)

      const result = await getStationUsers()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can view all users")
    })
  })

  describe("Cross-station security", () => {
    let otherStation: any
    let otherStationUser: any

    beforeEach(() => {
      // Mock other station data
      otherStation = {
        id: "other-station-123",
        customerId: "other-customer-123",
        name: "Other Filling Station",
        address: "456 Other Street",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      otherStationUser = {
        id: "other-user-123",
        stationId: otherStation.id,
        clerkUserId: "clerk_other_manager",
        username: "othermanager",
        role: "manager",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    it("should prevent manager from creating users for other stations", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst.mockResolvedValue(testManagerUser)
      
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                user: testManagerUser,
                station: testStation
              }])
            })
          })
        })
      });

      const result = await createStationUser({
        stationId: otherStation.id, // Different station
        clerkUserId: "clerk_cross_station",
        username: "crossuser",
        role: "staff"
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Cannot create users for other stations")
    })

    it("should prevent manager from updating users from other stations", async () => {
      auth.mockResolvedValue({ userId: "clerk_manager_123" })
      const mockDb = db as any;
      mockDb.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role check
        .mockResolvedValueOnce(otherStationUser) // For target user lookup
      
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{
                user: testManagerUser,
                station: testStation
              }])
            })
          })
        })
      });

      const result = await updateUserStatus(otherStationUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Cannot update users from other stations")
    })
  })
})