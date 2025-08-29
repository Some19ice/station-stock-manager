// Mock for @clerk/nextjs/server
// This mock provides server-side Clerk authentication functions for testing

const mockAuth = jest.fn(() =>
  Promise.resolve({
    userId: "mock-user-id",
    sessionId: "mock-session-id",
    getToken: jest.fn(() => Promise.resolve("mock-token")),
    claims: {
      sub: "mock-user-id",
      email: "test@example.com"
    }
  })
)

const mockCurrentUser = jest.fn(() =>
  Promise.resolve({
    id: "mock-user-id",
    firstName: "Test",
    lastName: "User",
    emailAddresses: [
      {
        emailAddress: "test@example.com",
        id: "mock-email-id"
      }
    ],
    publicMetadata: {
      role: "manager"
    },
    privateMetadata: {},
    unsafeMetadata: {}
  })
)

const mockRedirectToSignIn = jest.fn(() => {
  throw new Error("Redirecting to sign in")
})

const mockRedirectToSignUp = jest.fn(() => {
  throw new Error("Redirecting to sign up")
})

const mockGetAuth = jest.fn(() => ({
  userId: "mock-user-id",
  sessionId: "mock-session-id",
  getToken: jest.fn(() => Promise.resolve("mock-token"))
}))

const mockClerkClient = {
  users: {
    getUser: jest.fn(() =>
      Promise.resolve({
        id: "mock-user-id",
        firstName: "Test",
        lastName: "User",
        emailAddresses: [
          {
            emailAddress: "test@example.com",
            id: "mock-email-id"
          }
        ],
        publicMetadata: { role: "manager" }
      })
    ),
    updateUser: jest.fn(() => Promise.resolve({})),
    deleteUser: jest.fn(() => Promise.resolve({})),
    getUserList: jest.fn(() =>
      Promise.resolve({
        data: [],
        totalCount: 0
      })
    )
  },
  sessions: {
    getSession: jest.fn(() =>
      Promise.resolve({
        id: "mock-session-id",
        userId: "mock-user-id",
        status: "active"
      })
    ),
    revokeSession: jest.fn(() => Promise.resolve({}))
  },
  organizations: {
    getOrganization: jest.fn(() => Promise.resolve(null)),
    getOrganizationList: jest.fn(() =>
      Promise.resolve({
        data: [],
        totalCount: 0
      })
    )
  }
}

const mockWebhookEvent = {
  type: "user.created",
  data: {
    id: "mock-user-id",
    email_addresses: [
      {
        email_address: "test@example.com"
      }
    ]
  }
}

const mockVerifyWebhook = jest.fn(() => mockWebhookEvent)

module.exports = {
  auth: mockAuth,
  currentUser: mockCurrentUser,
  redirectToSignIn: mockRedirectToSignIn,
  redirectToSignUp: mockRedirectToSignUp,
  getAuth: mockGetAuth,
  clerkClient: mockClerkClient,
  verifyWebhook: mockVerifyWebhook,

  // Additional exports that might be needed
  buildClerkProps: jest.fn(() => ({})),
  getClerkJWTClaims: jest.fn(() => Promise.resolve({})),
  requireAuth: jest.fn(() => mockGetAuth()),

  // Webhook helpers
  WebhookEvent: jest.fn(),
  Webhook: {
    construct: jest.fn(() => mockWebhookEvent)
  }
}
