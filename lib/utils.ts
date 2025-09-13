import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Nigerian Naira currency
 */
export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return "₦0"
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numAmount)
}

// Error handling utilities
export interface ApiResponse<T = unknown> {
  isSuccess: boolean
  data?: T
  error?: string
  code?: string
}

export interface ErrorDetails {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
}

// Error codes for consistent error handling
export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    isSuccess: true,
    data
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode = ErrorCodes.UNKNOWN_ERROR,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    isSuccess: false,
    error: message,
    code,
    ...(details && { details })
  }
}

/**
 * Creates a validation error response from Zod errors
 */
export function createValidationErrorResponse(
  error: z.ZodError
): ApiResponse<never> {
  const message = error.issues[0]?.message || "Validation failed"
  return createErrorResponse(message, ErrorCodes.VALIDATION_ERROR, {
    issues: error.issues
  })
}

/**
 * Handles async operations with consistent error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage = "Operation failed"
): Promise<ApiResponse<T>> {
  try {
    const result = await operation()
    return createSuccessResponse(result)
  } catch (error) {
    console.error(`${errorMessage}:`, error)

    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Database connection errors
      if (
        error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return createErrorResponse(
          "Database connection failed",
          ErrorCodes.DATABASE_ERROR
        )
      }

      // Network errors
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        return createErrorResponse(
          "Network error occurred",
          ErrorCodes.NETWORK_ERROR
        )
      }

      return createErrorResponse(error.message, ErrorCodes.UNKNOWN_ERROR)
    }

    return createErrorResponse(errorMessage, ErrorCodes.UNKNOWN_ERROR)
  }
}

/**
 * Wraps database operations with error handling
 */
export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName = "Database operation"
): Promise<ApiResponse<T>> {
  return handleAsyncOperation(operation, `${operationName} failed`)
}

/**
 * Validates input data with Zod schema and returns standardized response
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: true; data: T } | { isValid: false; error: ApiResponse<never> } {
  try {
    const validatedData = schema.parse(data)
    return { isValid: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: createValidationErrorResponse(error) }
    }
    return {
      isValid: false,
      error: createErrorResponse(
        "Validation failed",
        ErrorCodes.VALIDATION_ERROR
      )
    }
  }
}

/**
 * Safely executes a function that might throw
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  errorMessage = "Function execution failed"
): T {
  try {
    return fn()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    return fallback
  }
}

/**
 * Logs errors with context for debugging
 */
export function logError(
  error: unknown,
  context: string,
  additionalData?: Record<string, unknown>
): void {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    ...additionalData
  }

  console.error(`[ERROR] ${context}:`, errorDetails)
}

// Common validation schemas
export const commonSchemas = {
  id: z.string().min(1, "ID is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  positiveNumber: z.number().min(0, "Must be a positive number"),
  positiveInteger: z.number().int().min(0, "Must be a non-negative integer"),
  requiredString: z.string().min(1, "This field is required"),
  optionalString: z.string().optional(),
  boolean: z.boolean(),
  dateString: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), "Invalid date format"),
  uuid: z.string().uuid("Invalid UUID format"),
  url: z.string().url("Invalid URL format")
} as const

// Product validation schemas
export const productSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    name: commonSchemas.requiredString,
    brand: commonSchemas.optionalString,
    type: z.enum(["pms", "lubricant"]),
    viscosity: commonSchemas.optionalString,
    containerSize: commonSchemas.optionalString,
    currentStock: commonSchemas.positiveNumber,
    unitPrice: commonSchemas.positiveNumber,
    minThreshold: commonSchemas.positiveNumber,
    unit: z.enum(["litres", "units"])
  }),

  update: z.object({
    name: commonSchemas.requiredString.optional(),
    brand: commonSchemas.optionalString,
    viscosity: commonSchemas.optionalString,
    containerSize: commonSchemas.optionalString,
    currentStock: commonSchemas.positiveNumber.optional(),
    unitPrice: commonSchemas.positiveNumber.optional(),
    minThreshold: commonSchemas.positiveNumber.optional(),
    isActive: commonSchemas.boolean.optional()
  })
} as const

// Supplier validation schemas
export const supplierSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    name: commonSchemas.requiredString,
    contactPerson: commonSchemas.optionalString,
    phone: commonSchemas.optionalString,
    email: commonSchemas.email.optional(),
    address: commonSchemas.optionalString,
    notes: commonSchemas.optionalString
  }),

  update: z.object({
    name: commonSchemas.requiredString.optional(),
    contactPerson: commonSchemas.optionalString,
    phone: commonSchemas.optionalString,
    email: commonSchemas.email.optional(),
    address: commonSchemas.optionalString,
    notes: commonSchemas.optionalString,
    isActive: commonSchemas.boolean.optional()
  })
} as const

// User validation schemas
export const userSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    clerkUserId: commonSchemas.uuid,
    username: commonSchemas.requiredString,
    role: z.enum(["staff", "manager"])
  }),

  update: z.object({
    username: commonSchemas.requiredString.optional(),
    role: z.enum(["staff", "manager"]).optional(),
    isActive: commonSchemas.boolean.optional()
  })
} as const

// Station validation schemas
export const stationSchemas = {
  create: z.object({
    customerId: commonSchemas.uuid,
    name: commonSchemas.requiredString,
    address: commonSchemas.optionalString
  }),

  update: z.object({
    name: commonSchemas.requiredString.optional(),
    address: commonSchemas.optionalString
  })
} as const

// Transaction validation schemas
export const transactionSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    userId: commonSchemas.uuid,
    items: z
      .array(
        z.object({
          productId: commonSchemas.uuid,
          quantity: commonSchemas.positiveNumber,
          unitPrice: commonSchemas.positiveNumber,
          totalPrice: commonSchemas.positiveNumber
        })
      )
      .min(1, "At least one item is required"),
    totalAmount: commonSchemas.positiveNumber
  }),

  filters: z
    .object({
      userId: commonSchemas.uuid.optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      productType: z.enum(["pms", "lubricant"]).optional()
    })
    .optional()
} as const

// PMS Pump Configuration validation schemas
export const pumpConfigurationSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    pmsProductId: commonSchemas.uuid,
    pumpNumber: commonSchemas.requiredString,
    meterCapacity: z.number().positive().min(1),
    installDate: commonSchemas.dateString
  }),

  update: z.object({
    pumpNumber: commonSchemas.requiredString.optional(),
    meterCapacity: z.number().positive().min(1).optional(),
    lastCalibrationDate: commonSchemas.dateString.optional()
  }),

  statusUpdate: z.object({
    status: z.enum(["active", "maintenance", "calibration", "repair"]),
    notes: commonSchemas.optionalString
  })
} as const

// Meter Reading validation schemas
export const meterReadingSchemas = {
  create: z.object({
    pumpId: commonSchemas.uuid,
    readingDate: commonSchemas.dateString,
    readingType: z.enum(["opening", "closing"]),
    meterValue: z.number().min(0),
    notes: commonSchemas.optionalString,
    isEstimated: commonSchemas.boolean.optional(),
    estimationMethod: z.enum(["transaction_based", "historical_average", "manual"]).optional()
  }),

  update: z.object({
    meterValue: z.number().min(0),
    notes: commonSchemas.optionalString
  }),

  bulk: z.object({
    stationId: commonSchemas.uuid,
    readingDate: commonSchemas.dateString,
    readingType: z.enum(["opening", "closing"]),
    readings: z.array(z.object({
      pumpId: commonSchemas.uuid,
      meterValue: z.number().min(0),
      notes: commonSchemas.optionalString
    }))
  })
} as const

// PMS Calculation validation schemas
export const pmsCalculationSchemas = {
  create: z.object({
    stationId: commonSchemas.uuid,
    calculationDate: commonSchemas.dateString,
    forceRecalculate: commonSchemas.boolean.optional()
  }),

  approve: z.object({
    approved: commonSchemas.boolean,
    notes: commonSchemas.optionalString
  }),

  rollover: z.object({
    pumpId: commonSchemas.uuid,
    calculationDate: commonSchemas.dateString,
    rolloverValue: z.number().positive(),
    newReading: z.number().min(0)
  }),

  deviations: z.object({
    stationId: commonSchemas.uuid,
    thresholdPercent: z.number().positive().default(20),
    days: z.number().int().positive().default(7)
  })
} as const

// Form validation helpers
export function getFieldError(
  error: z.ZodError,
  fieldName: string
): string | undefined {
  const fieldError = error.issues.find(issue => issue.path.includes(fieldName))
  return fieldError?.message
}

export function getFormErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.issues.forEach(issue => {
    const fieldName = issue.path.join(".")
    errors[fieldName] = issue.message
  })
  return errors
}

// API validation helper for client-side validation
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData | Record<string, unknown>
):
  | { isValid: true; data: T }
  | { isValid: false; errors: Record<string, string> } {
  try {
    let dataToValidate: unknown

    if (formData instanceof FormData) {
      // Convert FormData to object
      const obj: Record<string, unknown> = {}
      for (const [key, value] of formData.entries()) {
        // Handle multiple values for the same key (arrays)
        if (obj[key] !== undefined) {
          if (Array.isArray(obj[key])) {
            ;(obj[key] as unknown[]).push(value)
          } else {
            obj[key] = [obj[key], value]
          }
        } else {
          obj[key] = value
        }
      }
      dataToValidate = obj
    } else {
      dataToValidate = formData
    }

    const validatedData = schema.parse(dataToValidate)
    return { isValid: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: getFormErrors(error) }
    }
    return {
      isValid: false,
      errors: { general: "Validation failed" }
    }
  }
}
