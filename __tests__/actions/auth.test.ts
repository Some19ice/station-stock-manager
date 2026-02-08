import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest
} from "@jest/globals"
import {
  createDbMock,
  createAuthMock,
  createTestUUID,
  createDrizzleMocks,
  mockUser,
  mockStation,
  resetDbMocks
} from "../utils/db-mock"

// Helper function to create chainable database mocks
const createChainableMock = (finalResult: any = []) => {
  const chainable: any = {
    from: jest.fn(() => chainable),
    where: jest.fn(() => chainable),
    innerJoin: jest.fn(() => chainable),
    leftJoin: jest.fn(() => chainable),
    rightJoin: jest.fn(() => chainable),
    groupBy: jest.fn(() => chainable),
    orderBy: jest.fn(() => chainable),
    limit: jest.fn(() => chainable),
    offset: jest.fn(() => chainable),
    having: jest.fn(() => chainable),
    distinct: jest.fn(() => chainable),
    into: jest.fn(() => chainable),
    values: jest.fn(() => chainable),
    returning: jest.fn(() => chainable),
    set: jest.fn(() => chainable),
    then: jest.fn(resolve => resolve(finalResult)),
    [Symbol.toStringTag]: "Promise"
  }

  Object.defineProperty(chainable, "then", {
    value: jest.fn(resolve => Promise.resolve(finalResult).then(resolve)),
    writable: true
  })

  return chainable
}

// Create mocks
const { mockAuth, mockCurrentUser } = createAuthMock()
const dbMock = createDbMock()
const drizzleMocks = createDrizzleMocks()

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser
}))

jest.mock("@/db", () => ({
  db: dbMock
}))

jest.mock("@/db/schema", () => ({
  users: {
    id: "users.id",
    clerkUserId: "users.clerk_user_id",
    stationId: "users.station_id",
    username: "users.username",
    role: "users.role",
    isActive: "users.is_active"
  },
  stations: {
    id: "stations.id",
    name: "stations.name",
    customerId: "stations.customer_id"
  },
  customers: {
    id: "customers.id",
    userId: "customers.user_id"
  }
}))

jest.mock("drizzle-orm", () => drizzleMocks)

describe("Authentication Actions", () => {
  let testCustomer: any
  let testStation: any
  let testManagerUser: any
  let testStaffUser: any
  let testInactiveUser: any

  beforeEach(() => {
    jest.clearAllMocks()
    resetDbMocks(dbMock)

    // Setup test data with valid UUIDs
    testCustomer = {
      id: createTestUUID("1000"),
      userId: "clerk_customer_123",
      membership: "free",
      paystackCustomerCode: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testStation = {
      id: createTestUUID("1001"),
      customerId: testCustomer.id,
      name: "Test Filling Station",
      address: "123 Test Street",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testManagerUser = {
      id: createTestUUID("1002"),
      stationId: testStation.id,
      clerkUserId: "clerk_manager_123",
      username: "manager1",
      role: "manager",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testStaffUser = {
      id: createTestUUID("1003"),
      stationId: testStation.id,
      clerkUserId: "clerk_staff_123",
      username: "staff1",
      role: "staff",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    testInactiveUser = {
      id: createTestUUID("1004"),
      stationId: testStation.id,
      clerkUserId: "clerk_inactive_123",
      username: "inactive1",
      role: "staff",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getCurrentUserProfile", () => {
    it("should return user profile with station for authenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      // Setup database mock to return user with station data
      const userWithStation = [
        {
          user: testManagerUser,
          station: testStation
        }
      ]

      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve(userWithStation))
            }))
          }))
        }))
      }))

      const { getCurrentUserProfile } = await import("@/actions/auth")
      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual({
        user: testManagerUser,
        station: testStation
      })
      expect(mockAuth).toHaveBeenCalled()
    })

    it("should return error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const { getCurrentUserProfile } = await import("@/actions/auth")
      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })

    it("should return error for user without profile", async () => {
      mockAuth.mockResolvedValue({ userId: "non_existent_user" })

      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve([]))
            }))
          }))
        }))
      }))

      const { getCurrentUserProfile } = await import("@/actions/auth")
      const result = await getCurrentUserProfile()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User profile not found")
    })
  })

  describe("getUserRole", () => {
    it("should return manager role for manager user", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testManagerUser)

      const { getUserRole } = await import("@/actions/auth")
      const result = await getUserRole()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe("manager")
    })

    it("should return staff role for staff user", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const { getUserRole } = await import("@/actions/auth")
      const result = await getUserRole()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBe("staff")
    })

    it("should return error for inactive user", async () => {
      mockAuth.mockResolvedValue({ userId: testInactiveUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testInactiveUser)

      const { getUserRole } = await import("@/actions/auth")
      const result = await getUserRole()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User account is inactive")
    })

    it("should return error for unauthenticated user", async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const { getUserRole } = await import("@/actions/auth")
      const result = await getUserRole()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })
  })

  describe("validateUserRole", () => {
    it("should allow manager to access manager-only functions", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testManagerUser)

      const { validateUserRole } = await import("@/actions/auth")
      const result = await validateUserRole("manager")

      expect(result.isSuccess).toBe(true)
    })

    it("should allow manager to access staff functions", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testManagerUser)

      const { validateUserRole } = await import("@/actions/auth")
      const result = await validateUserRole("staff")

      expect(result.isSuccess).toBe(true)
    })

    it("should allow staff to access staff functions", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const { validateUserRole } = await import("@/actions/auth")
      const result = await validateUserRole("staff")

      expect(result.isSuccess).toBe(true)
    })

    it("should deny staff access to manager-only functions", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const { validateUserRole } = await import("@/actions/auth")
      const result = await validateUserRole("manager")

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Insufficient permissions")
    })
  })

  describe("createStationUser", () => {
    it("should allow manager to create staff user", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      // Mock the database queries for role validation and user creation
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For validateUserRole call
        .mockResolvedValueOnce(null) // For duplicate username check
        .mockResolvedValueOnce(null) // For duplicate Clerk user ID check

      // Mock getCurrentUserProfile result for the createStationUser function
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const newStaffData = {
        clerkUserId: "clerk_new_staff_456",
        username: "newstaff",
        role: "staff" as const,
        stationId: testStation.id,
        email: "newstaff@example.com",
        sendInvitation: true
      }

      const createdUser = {
        id: createTestUUID("1005"),
        ...newStaffData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock the insert operation after all the select operations
      let selectCallCount = 0
      dbMock.select.mockImplementation(() => {
        selectCallCount++
        if (selectCallCount <= 1) {
          // Return user profile data for getCurrentUserProfile
          return {
            from: jest.fn(() => ({
              innerJoin: jest.fn(() => ({
                where: jest.fn(() => ({
                  limit: jest.fn(() =>
                    Promise.resolve([
                      {
                        user: testManagerUser,
                        station: testStation
                      }
                    ])
                  )
                }))
              }))
            }))
          }
        }
        // For any subsequent select calls
        return createChainableMock([])
      })

      dbMock.insert.mockImplementation(() => ({
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([createdUser]))
        }))
      }))

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser(newStaffData)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual(createdUser)
    })

    it("should allow manager to create another manager", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      // Mock getCurrentUserProfile for manager validation
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const newManagerData = {
        clerkUserId: "clerk_new_manager_789",
        username: "newmanager",
        role: "manager" as const,
        stationId: testStation.id,
        email: "newmanager@example.com",
        sendInvitation: true
      }

      const createdManager = {
        id: createTestUUID("1006"),
        ...newManagerData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      dbMock.insert.mockImplementation(() => ({
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([createdManager]))
        }))
      }))

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser(newManagerData)

      expect(result.isSuccess).toBe(true)
    })

    it("should deny staff from creating users", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const newUserData = {
        clerkUserId: "clerk_new_user_999",
        username: "newuser",
        role: "staff" as const,
        email: "newuser@example.com",
        sendInvitation: true
      }

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser({
        ...newUserData,
        stationId: testStation.id
      })

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can create user accounts")
    })

    it("should prevent duplicate usernames", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role validation
        .mockResolvedValueOnce(testStaffUser) // Existing user with same username

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const duplicateUsernameData = {
        clerkUserId: "clerk_duplicate_username_123",
        username: testStaffUser.username,
        role: "staff" as const,
        stationId: testStation.id,
        email: "duplicate@example.com",
        sendInvitation: true
      }

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser(duplicateUsernameData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Username already exists")
    })

    it("should prevent duplicate Clerk user IDs", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role validation
        .mockResolvedValueOnce(null) // Username check - no duplicate
        .mockResolvedValueOnce(testStaffUser) // Existing user with same Clerk ID

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const duplicateClerkIdData = {
        clerkUserId: testStaffUser.clerkUserId,
        username: "uniqueusername",
        role: "staff" as const,
        stationId: testStation.id,
        email: "unique@example.com",
        sendInvitation: true
      }

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser(duplicateClerkIdData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("User already has a station account")
    })
  })

  describe("updateUserStatus", () => {
    it("should allow manager to deactivate staff user", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role validation
        .mockResolvedValueOnce(testStaffUser) // For finding target user

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const updatedUser = { ...testStaffUser, isActive: false }

      dbMock.update.mockImplementation(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([updatedUser]))
          }))
        }))
      }))

      const { updateUserStatus } = await import("@/actions/auth")
      const result = await updateUserStatus(testStaffUser.id, false)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.isActive).toBe(false)
    })

    it("should allow manager to activate staff user", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role validation
        .mockResolvedValueOnce(testInactiveUser) // For finding target user

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const updatedUser = { ...testInactiveUser, isActive: true }

      dbMock.update.mockImplementation(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([updatedUser]))
          }))
        }))
      }))

      const { updateUserStatus } = await import("@/actions/auth")
      const result = await updateUserStatus(testInactiveUser.id, true)

      expect(result.isSuccess).toBe(true)
      expect(result.data?.isActive).toBe(true)
    })

    it("should prevent manager from deactivating themselves", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst
        .mockResolvedValueOnce(testManagerUser) // For role validation
        .mockResolvedValueOnce(testManagerUser) // For finding target user (same as current user)

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const { updateUserStatus } = await import("@/actions/auth")
      const result = await updateUserStatus(testManagerUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Cannot deactivate your own account")
    })

    it("should deny staff from updating user status", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const { updateUserStatus } = await import("@/actions/auth")
      const result = await updateUserStatus(testManagerUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update user status")
    })
  })

  describe("getStationUsers", () => {
    it("should allow manager to get all station users", async () => {
      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      dbMock.query.users.findFirst.mockResolvedValue(testManagerUser) // For role validation

      // Mock getCurrentUserProfile
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const stationUsers = [testManagerUser, testStaffUser, testInactiveUser]
      dbMock.query.users.findMany.mockResolvedValue(stationUsers)

      const { getStationUsers } = await import("@/actions/auth")
      const result = await getStationUsers()

      expect(result.isSuccess).toBe(true)
      expect(result.data).toEqual(stationUsers)
      expect(result.data).toHaveLength(3)
    })

    it("should deny staff from getting all users", async () => {
      mockAuth.mockResolvedValue({ userId: testStaffUser.clerkUserId })
      dbMock.query.users.findFirst.mockResolvedValue(testStaffUser)

      const { getStationUsers } = await import("@/actions/auth")
      const result = await getStationUsers()

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can view all users")
    })
  })

  describe("Cross-station security", () => {
    it("should prevent manager from creating users for other stations", async () => {
      const otherStation = {
        ...testStation,
        id: createTestUUID("2001"),
        name: "Other Station"
      }

      const otherStationManager = {
        ...testManagerUser,
        id: createTestUUID("2000"),
        stationId: otherStation.id,
        clerkUserId: "clerk_other_manager_456"
      }

      mockAuth.mockResolvedValue({ userId: otherStationManager.clerkUserId })

      // Mock role validation - manager is valid
      dbMock.query.users.findFirst
        .mockResolvedValueOnce(otherStationManager) // For role validation
        .mockResolvedValueOnce(null) // Username check
        .mockResolvedValueOnce(null) // Clerk ID check

      // Mock getCurrentUserProfile to return different station
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: otherStationManager,
                    station: otherStation
                  }
                ])
              )
            }))
          }))
        }))
      }))

      const newUserData = {
        clerkUserId: "clerk_cross_station_user_789",
        username: "crossstationuser",
        role: "staff",
        stationId: testStation.id // Different station than manager's
      }

      const { createStationUser } = await import("@/actions/auth")
      const result = await createStationUser(newUserData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Cannot create users for other stations")
    })

    it("should prevent manager from updating users from other stations", async () => {
      // Reset all mocks for clean state
      jest.clearAllMocks()
      resetDbMocks(dbMock)

      const otherStationUser = {
        ...testStaffUser,
        id: createTestUUID("3000"),
        stationId: createTestUUID("3001"), // Different station
        clerkUserId: "clerk_other_station_staff_123"
      }

      mockAuth.mockResolvedValue({ userId: testManagerUser.clerkUserId })

      // Mock getUserRole for validateUserRole - this must return manager role
      dbMock.query.users.findFirst
        .mockResolvedValueOnce({ role: "manager", isActive: true }) // For getUserRole in validateUserRole
        .mockResolvedValueOnce(otherStationUser) // For finding target user in updateUserStatus

      // Mock getCurrentUserProfile to return manager's station
      dbMock.select.mockImplementation(() => ({
        from: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() =>
                Promise.resolve([
                  {
                    user: testManagerUser,
                    station: testStation // Manager's station
                  }
                ])
              )
            }))
          }))
        }))
      }))

      // Fresh import to avoid cached module issues
      delete require.cache[require.resolve("@/actions/auth")]
      const { updateUserStatus } = await import("@/actions/auth")
      const result = await updateUserStatus(otherStationUser.id, false)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe("Only managers can update user status")
    })
  })
})
