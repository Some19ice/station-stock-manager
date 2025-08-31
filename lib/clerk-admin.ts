import { createClerkClient } from "@clerk/backend"

// Validate required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required")
}

// Create Clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export interface CreateUserParams {
  email: string
  username: string
  firstName?: string
  lastName?: string
  password?: string
}

export interface InviteUserParams {
  email: string
  username?: string
  role?: string
  redirectUrl?: string
}

/**
 * Create a new Clerk user programmatically
 */
export async function createClerkUser(params: CreateUserParams) {
  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [params.email],
      username: params.username,
      firstName: params.firstName || params.username,
      lastName: params.lastName || "",
      skipPasswordRequirement: true, // Allow passwordless creation for invitations
      skipPasswordChecks: true,
    })

    return {
      success: true,
      userId: user.id,
      user
    }
  } catch (error: unknown) {
    console.error("Failed to create Clerk user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user account"
    }
  }
}

/**
 * Send invitation email to user
 */
export async function sendUserInvitation(params: InviteUserParams) {
  try {
    const invitationData = {
      emailAddress: params.email,
      redirectUrl: params.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      notify: true, // Send email notification
      publicMetadata: {
        ...(params.username && { username: params.username }),
        ...(params.role && { role: params.role })
      }
    }

    const invitation = await clerkClient.invitations.createInvitation(invitationData)

    return {
      success: true,
      invitationId: invitation.id,
      invitation
    }
  } catch (error: unknown) {
    console.error("Failed to send invitation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation"
    }
  }
}

/**
 * Find Clerk user by email
 */
export async function findClerkUserByEmail(email: string) {
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
      limit: 1
    })

    return {
      success: true,
      user: users.data[0] || null
    }
  } catch (error: unknown) {
    console.error("Failed to find user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to find user"
    }
  }
}

/**
 * Update user metadata
 */
export async function updateClerkUserMetadata(userId: string, metadata: Record<string, unknown>) {
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: metadata
    })

    return {
      success: true,
      user
    }
  } catch (error: unknown) {
    console.error("Failed to update user metadata:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user metadata"
    }
  }
}

/**
 * Update Clerk user profile (username, name, etc.)
 */
export async function updateClerkUserProfile(userId: string, profile: {
  username?: string
  firstName?: string
  lastName?: string
}) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      ...(profile.username && { username: profile.username }),
      ...(profile.firstName && { firstName: profile.firstName }),
      ...(profile.lastName && { lastName: profile.lastName })
    })

    return {
      success: true,
      user
    }
  } catch (error: unknown) {
    console.error("Failed to update user profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user profile"
    }
  }
}
