// Mock for @clerk/nextjs (client-side)
// This mock provides client-side Clerk hooks and components for testing

const mockUser = {
  id: "mock-user-id",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  username: "testuser",
  imageUrl: "https://example.com/avatar.jpg",
  hasImage: true,
  primaryEmailAddress: {
    id: "mock-email-id",
    emailAddress: "test@example.com",
    verification: {
      status: "verified"
    }
  },
  emailAddresses: [
    {
      id: "mock-email-id",
      emailAddress: "test@example.com",
      verification: {
        status: "verified"
      }
    }
  ],
  primaryPhoneNumber: null,
  phoneNumbers: [],
  publicMetadata: {
    role: "manager"
  },
  privateMetadata: {},
  unsafeMetadata: {},
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

const mockSession = {
  id: "mock-session-id",
  status: "active",
  lastActiveAt: new Date(),
  expireAt: new Date(Date.now() + 86400000), // 24 hours from now
  user: mockUser
}

const mockAuth = {
  userId: "mock-user-id",
  sessionId: "mock-session-id",
  actor: null,
  claims: {
    sub: "mock-user-id",
    email: "test@example.com"
  },
  getToken: jest.fn(() => Promise.resolve("mock-token"))
}

const mockOrganization = {
  id: "mock-org-id",
  name: "Test Organization",
  slug: "test-org",
  imageUrl: "https://example.com/org-logo.jpg",
  membersCount: 5,
  pendingInvitationsCount: 2,
  adminDeleteEnabled: true,
  maxAllowedMemberships: 100,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
}

// Hook mocks
const useUser = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockUser
}))

const useAuth = jest.fn(() => mockAuth)

const useSession = jest.fn(() => ({
  isLoaded: true,
  session: mockSession
}))

const useClerk = jest.fn(() => ({
  user: mockUser,
  session: mockSession,
  signOut: jest.fn(() => Promise.resolve()),
  openSignIn: jest.fn(),
  openSignUp: jest.fn(),
  openUserProfile: jest.fn(),
  openOrganizationProfile: jest.fn(),
  redirectToSignIn: jest.fn(),
  redirectToSignUp: jest.fn(),
  redirectToUserProfile: jest.fn()
}))

const useSignIn = jest.fn(() => ({
  isLoaded: true,
  signIn: {
    create: jest.fn(() => Promise.resolve()),
    prepareFirstFactor: jest.fn(() => Promise.resolve()),
    prepareSecondFactor: jest.fn(() => Promise.resolve()),
    attemptFirstFactor: jest.fn(() => Promise.resolve()),
    attemptSecondFactor: jest.fn(() => Promise.resolve())
  },
  setActive: jest.fn(() => Promise.resolve())
}))

const useSignUp = jest.fn(() => ({
  isLoaded: true,
  signUp: {
    create: jest.fn(() => Promise.resolve()),
    prepareEmailAddressVerification: jest.fn(() => Promise.resolve()),
    attemptEmailAddressVerification: jest.fn(() => Promise.resolve())
  },
  setActive: jest.fn(() => Promise.resolve())
}))

const useOrganization = jest.fn(() => ({
  isLoaded: true,
  organization: mockOrganization,
  membership: {
    id: "mock-membership-id",
    role: "admin",
    permissions: ["read", "write", "admin"]
  }
}))

const useOrganizationList = jest.fn(() => ({
  isLoaded: true,
  organizationList: [mockOrganization],
  setActive: jest.fn(() => Promise.resolve())
}))

// Component mocks
const ClerkProvider = jest.fn(({ children }) => children)

const SignInButton = jest.fn(({ children, ...props }) => (
  React.createElement('button', props, children || 'Sign In')
))

const SignUpButton = jest.fn(({ children, ...props }) => (
  React.createElement('button', props, children || 'Sign Up')
))

const SignOutButton = jest.fn(({ children, signOutCallback, ...props }) => (
  React.createElement('button', {
    ...props,
    onClick: () => {
      if (signOutCallback) signOutCallback()
    }
  }, children || 'Sign Out')
))

const UserButton = jest.fn((props) => (
  React.createElement('div', props, 'User Menu')
))

const OrganizationSwitcher = jest.fn((props) => (
  React.createElement('div', props, 'Organization Switcher')
))

const SignIn = jest.fn((props) => (
  React.createElement('div', props, 'Sign In Component')
))

const SignUp = jest.fn((props) => (
  React.createElement('div', props, 'Sign Up Component')
))

const UserProfile = jest.fn((props) => (
  React.createElement('div', props, 'User Profile Component')
))

const OrganizationProfile = jest.fn((props) => (
  React.createElement('div', props, 'Organization Profile Component')
))

const CreateOrganization = jest.fn((props) => (
  React.createElement('div', props, 'Create Organization Component')
))

const OrganizationList = jest.fn((props) => (
  React.createElement('div', props, 'Organization List Component')
))

// Higher-order components
const withClerk = jest.fn((Component) => {
  const WrappedComponent = (props) => {
    const clerkProps = {
      user: mockUser,
      session: mockSession,
      clerk: {
        signOut: jest.fn(),
        openSignIn: jest.fn(),
        openSignUp: jest.fn()
      }
    }
    return React.createElement(Component, { ...props, ...clerkProps })
  }
  WrappedComponent.displayName = `withClerk(${Component.displayName || Component.name})`
  return WrappedComponent
})

const withUser = jest.fn((Component) => {
  const WrappedComponent = (props) => {
    return React.createElement(Component, { ...props, user: mockUser })
  }
  WrappedComponent.displayName = `withUser(${Component.displayName || Component.name})`
  return WrappedComponent
})

const withSession = jest.fn((Component) => {
  const WrappedComponent = (props) => {
    return React.createElement(Component, { ...props, session: mockSession })
  }
  WrappedComponent.displayName = `withSession(${Component.displayName || Component.name})`
  return WrappedComponent
})

// Utility functions
const isClerkAPIResponseError = jest.fn(() => false)
const isEmailLinkError = jest.fn(() => false)
const isKnownError = jest.fn(() => false)
const isMetamaskError = jest.fn(() => false)

module.exports = {
  // Hooks
  useUser,
  useAuth,
  useSession,
  useClerk,
  useSignIn,
  useSignUp,
  useOrganization,
  useOrganizationList,

  // Components
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
  OrganizationSwitcher,
  SignIn,
  SignUp,
  UserProfile,
  OrganizationProfile,
  CreateOrganization,
  OrganizationList,

  // Higher-order components
  withClerk,
  withUser,
  withSession,

  // Utility functions
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,

  // Mock data for tests
  __mockUser: mockUser,
  __mockSession: mockSession,
  __mockAuth: mockAuth,
  __mockOrganization: mockOrganization
}
