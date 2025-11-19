export const ROLES = {
  STAFF: "staff",
  MANAGER: "manager",
  DIRECTOR: "director"
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Role hierarchy for permission checks - higher numeric values indicate higher privilege levels
export const ROLE_HIERARCHY = {
  [ROLES.STAFF]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.DIRECTOR]: 3
} as const
