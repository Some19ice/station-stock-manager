// Comprehensive Zod mock for Jest testing
// This mock provides functional validation to ensure tests behave correctly

// Mock fetch for test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    clone: jest.fn()
  })
)

class ZodError extends Error {
  constructor(issues = []) {
    super("Validation failed")
    this.name = "ZodError"
    this.issues = Array.isArray(issues) ? issues : [issues]
  }

  get errors() {
    return this.issues
  }

  format() {
    return this.issues.reduce((acc, issue) => {
      const path =
        issue.path && issue.path.length > 0 ? issue.path.join(".") : "_errors"
      if (!acc[path]) acc[path] = []
      if (Array.isArray(acc[path])) {
        acc[path].push(issue.message)
      } else {
        acc[path] = issue.message
      }
      return acc
    }, {})
  }

  flatten() {
    return {
      formErrors: this.issues
        .filter(i => !i.path || i.path.length === 0)
        .map(i => i.message),
      fieldErrors: this.issues
        .filter(i => i.path && i.path.length > 0)
        .reduce((acc, issue) => {
          const path = issue.path.join(".")
          if (!acc[path]) acc[path] = []
          acc[path].push(issue.message)
          return acc
        }, {})
    }
  }

  toString() {
    return `ZodError: ${this.issues.map(i => i.message).join(", ")}`
  }
}

// Enhanced validation functions with better type checking
const validators = {
  required: (value, rule) => {
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value === "")
    ) {
      return {
        code: "invalid_type",
        message: rule.message || "Required",
        path: []
      }
    }
    return null
  },

  type: (value, rule) => {
    const expectedType = rule.expectedType
    let actualType = typeof value

    if (value === null) actualType = "null"
    if (Array.isArray(value)) actualType = "array"
    if (value instanceof Date) actualType = "date"

    if (actualType !== expectedType && value !== undefined && value !== null) {
      return {
        code: "invalid_type",
        message:
          rule.message || `Expected ${expectedType}, received ${actualType}`,
        path: []
      }
    }
    return null
  },

  min: (value, rule) => {
    if (value === undefined || value === null) return null

    if (typeof value === "string" && value.length < rule.value) {
      return {
        code: "too_small",
        message:
          rule.message ||
          `String must contain at least ${rule.value} character(s)`,
        path: []
      }
    }
    if (typeof value === "number" && value < rule.value) {
      return {
        code: "too_small",
        message:
          rule.message ||
          `Number must be greater than or equal to ${rule.value}`,
        path: []
      }
    }
    if (Array.isArray(value) && value.length < rule.value) {
      return {
        code: "too_small",
        message:
          rule.message ||
          `Array must contain at least ${rule.value} element(s)`,
        path: []
      }
    }
    return null
  },

  max: (value, rule) => {
    if (value === undefined || value === null) return null

    if (typeof value === "string" && value.length > rule.value) {
      return {
        code: "too_big",
        message:
          rule.message ||
          `String must contain at most ${rule.value} character(s)`,
        path: []
      }
    }
    if (typeof value === "number" && value > rule.value) {
      return {
        code: "too_big",
        message:
          rule.message || `Number must be less than or equal to ${rule.value}`,
        path: []
      }
    }
    if (Array.isArray(value) && value.length > rule.value) {
      return {
        code: "too_big",
        message:
          rule.message || `Array must contain at most ${rule.value} element(s)`,
        path: []
      }
    }
    return null
  },

  email: (value, rule) => {
    if (value === undefined || value === null || value === "") return null

    if (typeof value !== "string") {
      return {
        code: "invalid_type",
        message: "Expected string",
        path: []
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return {
        code: "invalid_string",
        message: rule.message || "Invalid email format",
        path: []
      }
    }
    return null
  },

  uuid: (value, rule) => {
    if (value === undefined || value === null || value === "") return null

    if (typeof value !== "string") {
      return {
        code: "invalid_type",
        message: "Expected string",
        path: []
      }
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      return {
        code: "invalid_string",
        message: rule.message || "Invalid UUID format",
        path: []
      }
    }
    return null
  },

  url: (value, rule) => {
    if (value === undefined || value === null || value === "") return null

    if (typeof value !== "string") {
      return {
        code: "invalid_type",
        message: "Expected string",
        path: []
      }
    }

    try {
      new URL(value)
      return null
    } catch {
      return {
        code: "invalid_string",
        message: rule.message || "Invalid URL format",
        path: []
      }
    }
  },

  regex: (value, rule) => {
    if (value === undefined || value === null || value === "") return null

    if (typeof value !== "string") {
      return {
        code: "invalid_type",
        message: "Expected string",
        path: []
      }
    }

    if (!rule.pattern.test(value)) {
      return {
        code: "invalid_string",
        message: rule.message || "Invalid format",
        path: []
      }
    }
    return null
  },

  int: (value, rule) => {
    if (value === undefined || value === null) return null

    if (typeof value !== "number" || !Number.isInteger(value)) {
      return {
        code: "invalid_type",
        message: rule.message || "Expected integer",
        path: []
      }
    }
    return null
  },

  positive: (value, rule) => {
    if (value === undefined || value === null) return null

    if (typeof value !== "number" || value <= 0) {
      return {
        code: "too_small",
        message: rule.message || "Number must be positive",
        path: []
      }
    }
    return null
  },

  nonnegative: (value, rule) => {
    if (value === undefined || value === null) return null

    if (typeof value !== "number" || value < 0) {
      return {
        code: "too_small",
        message: rule.message || "Number must be non-negative",
        path: []
      }
    }
    return null
  },

  enum: (value, rule) => {
    if (value === undefined || value === null) return null

    if (!rule.values.includes(value)) {
      return {
        code: "invalid_enum_value",
        message:
          rule.message ||
          `Invalid enum value. Expected ${rule.values.join(" | ")}, received '${value}'`,
        path: []
      }
    }
    return null
  },

  literal: (value, rule) => {
    if (value !== rule.value) {
      return {
        code: "invalid_literal",
        message:
          rule.message ||
          `Invalid literal value. Expected ${rule.value}, received ${value}`,
        path: []
      }
    }
    return null
  }
}

function validateValue(value, rules = []) {
  const issues = []

  for (const rule of rules) {
    // Handle default values
    if (rule.type === "default" && (value === undefined || value === null)) {
      value = typeof rule.value === "function" ? rule.value() : rule.value
      continue
    }

    // Skip validation if value is undefined/null and field is optional
    if ((value === undefined || value === null) && rule.type !== "required") {
      continue
    }

    const validator = validators[rule.type]
    if (validator) {
      const issue = validator(value, rule)
      if (issue) {
        issues.push(issue)
      }
    }
  }

  return issues
}

// Create base schema with all chainable methods
function createSchema(type = "unknown", initialRules = []) {
  const rules = [...initialRules]
  const schemaId = Math.random().toString(36)

  const schema = {
    _type: type,
    _rules: rules,
    _schemaId: schemaId,
    _isOptional: false,
    _isNullable: false,

    // Core parsing methods
    parse: jest.fn(data => {
      let processedData = data

      // Apply transformations first
      const transformRule = rules.find(r => r.type === "transform")
      if (transformRule) {
        processedData = transformRule.transform(data)
      }

      // Apply default values
      const defaultRule = rules.find(r => r.type === "default")
      if (
        defaultRule &&
        (processedData === undefined || processedData === null)
      ) {
        processedData =
          typeof defaultRule.value === "function"
            ? defaultRule.value()
            : defaultRule.value
      }

      const issues = validateValue(processedData, rules)
      if (issues.length > 0) {
        throw new ZodError(issues)
      }
      return processedData
    }),

    safeParse: jest.fn(data => {
      try {
        const result = schema.parse(data)
        return {
          success: true,
          data: result,
          error: undefined
        }
      } catch (error) {
        return {
          success: false,
          error,
          data: undefined
        }
      }
    }),

    // String methods
    min: jest.fn((value, message) => {
      const newRules = [...rules, { type: "min", value, message }]
      return createSchema(type, newRules)
    }),

    max: jest.fn((value, message) => {
      const newRules = [...rules, { type: "max", value, message }]
      return createSchema(type, newRules)
    }),

    length: jest.fn((value, message) => {
      const newRules = [
        ...rules,
        { type: "min", value, message },
        { type: "max", value, message }
      ]
      return createSchema(type, newRules)
    }),

    email: jest.fn(message => {
      const newRules = [...rules, { type: "email", message }]
      return createSchema(type, newRules)
    }),

    uuid: jest.fn(message => {
      const newRules = [...rules, { type: "uuid", message }]
      return createSchema(type, newRules)
    }),

    url: jest.fn(message => {
      const newRules = [...rules, { type: "url", message }]
      return createSchema(type, newRules)
    }),

    regex: jest.fn((pattern, message) => {
      const newRules = [...rules, { type: "regex", pattern, message }]
      return createSchema(type, newRules)
    }),

    // Number methods
    int: jest.fn(message => {
      const newRules = [...rules, { type: "int", message }]
      return createSchema(type, newRules)
    }),

    positive: jest.fn(message => {
      const newRules = [...rules, { type: "positive", message }]
      return createSchema(type, newRules)
    }),

    negative: jest.fn(message => {
      const newRules = [...rules, { type: "negative", message }]
      return createSchema(type, newRules)
    }),

    nonnegative: jest.fn(message => {
      const newRules = [...rules, { type: "nonnegative", message }]
      return createSchema(type, newRules)
    }),

    nonpositive: jest.fn(() => schema),
    finite: jest.fn(() => schema),
    safe: jest.fn(() => schema),
    multipleOf: jest.fn(() => schema),
    step: jest.fn(() => schema),

    // Modifiers
    optional: jest.fn(() => {
      const newRules = rules.filter(r => r.type !== "required")
      const optionalSchema = createSchema(type, newRules)
      optionalSchema._isOptional = true
      return optionalSchema
    }),

    nullable: jest.fn(() => {
      const nullableSchema = createSchema(type, rules)
      nullableSchema._isNullable = true
      return nullableSchema
    }),

    default: jest.fn(value => {
      const newRules = [
        ...rules.filter(r => r.type !== "default"),
        { type: "default", value }
      ]
      return createSchema(type, newRules)
    }),

    // Transformation
    transform: jest.fn(transform => {
      const newRules = [...rules, { type: "transform", transform }]
      return createSchema(type, newRules)
    }),

    // Refinement
    refine: jest.fn((validator, message) => {
      const newRules = [
        ...rules,
        {
          type: "custom",
          validator: val =>
            validator(val)
              ? null
              : { code: "custom", message: message || "Validation failed" }
        }
      ]
      return createSchema(type, newRules)
    }),

    superRefine: jest.fn(() => schema),

    // Union and other types
    or: jest.fn(other => {
      return createUnionSchema([schema, other])
    }),

    and: jest.fn(other => {
      return createIntersectionSchema(schema, other)
    }),

    // Array-specific methods
    nonempty: jest.fn(() => {
      const newRules = [
        ...rules,
        { type: "min", value: 1, message: "Array cannot be empty" }
      ]
      return createSchema(type, newRules)
    }),

    // String-specific methods
    startsWith: jest.fn(() => schema),
    endsWith: jest.fn(() => schema),
    includes: jest.fn(() => schema),
    trim: jest.fn(() => schema),
    toLowerCase: jest.fn(() => schema),
    toUpperCase: jest.fn(() => schema),

    // Async methods
    parseAsync: jest.fn(async data => {
      return schema.parse(data)
    }),

    safeParseAsync: jest.fn(async data => {
      return schema.safeParse(data)
    }),

    // Utility methods
    describe: jest.fn(() => schema),
    brand: jest.fn(() => schema),
    readonly: jest.fn(() => schema),
    catch: jest.fn(() => schema),
    pipe: jest.fn(() => schema),

    // Properties
    isOptional: jest.fn(() => schema._isOptional),
    isNullable: jest.fn(() => schema._isNullable),
    _def: {
      typeName: `Zod${type.charAt(0).toUpperCase() + type.slice(1)}`
    }
  }

  return schema
}

// Object schema creation with enhanced validation
function createObjectSchema(shape = {}) {
  const schema = createSchema("object", [
    { type: "type", expectedType: "object" }
  ])

  schema.shape = shape
  schema._objectShape = shape

  // Override parse for object validation
  schema.parse = jest.fn(data => {
    const issues = []

    if (data === null || data === undefined) {
      if (!schema._isOptional) {
        throw new ZodError([
          {
            code: "invalid_type",
            message: "Required",
            path: []
          }
        ])
      }
      return data
    }

    if (typeof data !== "object" || Array.isArray(data)) {
      throw new ZodError([
        {
          code: "invalid_type",
          message:
            "Expected object, received " +
            (Array.isArray(data) ? "array" : typeof data),
          path: []
        }
      ])
    }

    const result = { ...data }

    // Validate each field in the shape
    if (shape) {
      Object.keys(shape).forEach(key => {
        const fieldSchema = shape[key]
        if (fieldSchema && fieldSchema.parse) {
          const value = data[key]

          // Skip validation for optional fields when value is undefined
          if (value === undefined && fieldSchema._isOptional) {
            // Don't set the field in result if it's undefined and optional
            return
          }

          try {
            result[key] = fieldSchema.parse(value)
          } catch (error) {
            if (error instanceof ZodError) {
              error.issues.forEach(issue => {
                issue.path = [key, ...(issue.path || [])]
                issues.push(issue)
              })
            }
          }
        }
      })
    }

    if (issues.length > 0) {
      throw new ZodError(issues)
    }

    return result
  })

  schema.safeParse = jest.fn(data => {
    try {
      const result = schema.parse(data)
      return { success: true, data: result, error: undefined }
    } catch (error) {
      return { success: false, error, data: undefined }
    }
  })

  // Object-specific methods
  schema.extend = jest.fn(extension => {
    return createObjectSchema({ ...shape, ...extension })
  })

  schema.merge = jest.fn(other => {
    const otherShape = other.shape || other._objectShape || {}
    return createObjectSchema({ ...shape, ...otherShape })
  })

  schema.pick = jest.fn(keys => {
    const picked = {}
    keys.forEach(key => {
      if (shape[key]) picked[key] = shape[key]
    })
    return createObjectSchema(picked)
  })

  schema.omit = jest.fn(keys => {
    const omitted = { ...shape }
    keys.forEach(key => delete omitted[key])
    return createObjectSchema(omitted)
  })

  schema.partial = jest.fn(() => {
    const partial = {}
    Object.keys(shape).forEach(key => {
      partial[key] = shape[key].optional()
    })
    return createObjectSchema(partial)
  })

  schema.deepPartial = jest.fn(() => {
    // Simplified implementation
    return schema.partial()
  })

  schema.required = jest.fn(keys => {
    if (keys) {
      // Specific keys
      const required = { ...shape }
      keys.forEach(key => {
        if (required[key] && required[key]._isOptional) {
          const fieldRules = [
            ...required[key]._rules,
            { type: "required", message: "Required" }
          ]
          required[key] = createSchema(required[key]._type, fieldRules)
        }
      })
      return createObjectSchema(required)
    } else {
      // All keys
      const required = {}
      Object.keys(shape).forEach(key => {
        const fieldRules = [...shape[key]._rules]
        if (!fieldRules.some(r => r.type === "required")) {
          fieldRules.push({ type: "required", message: "Required" })
        }
        required[key] = createSchema(shape[key]._type, fieldRules)
      })
      return createObjectSchema(required)
    }
  })

  schema.strict = jest.fn(() => schema)
  schema.strip = jest.fn(() => schema)
  schema.passthrough = jest.fn(() => schema)
  schema.catchall = jest.fn(() => schema)
  schema.keyof = jest.fn(() => createEnumSchema(Object.keys(shape)))

  return schema
}

// Array schema creation with enhanced validation
function createArraySchema(elementSchema) {
  const schema = createSchema("array", [
    { type: "type", expectedType: "array" }
  ])

  schema.element = elementSchema
  schema._elementSchema = elementSchema

  schema.parse = jest.fn(data => {
    if (data === null || data === undefined) {
      if (!schema._isOptional) {
        throw new ZodError([
          {
            code: "invalid_type",
            message: "Required",
            path: []
          }
        ])
      }
      return data
    }

    if (!Array.isArray(data)) {
      throw new ZodError([
        {
          code: "invalid_type",
          message: "Expected array, received " + typeof data,
          path: []
        }
      ])
    }

    // Apply array-level rules (like min/max length)
    const arrayIssues = validateValue(data, schema._rules)
    if (arrayIssues.length > 0) {
      throw new ZodError(arrayIssues)
    }

    // Validate each element if element schema is provided
    if (elementSchema && elementSchema.parse) {
      const issues = []
      const result = data.map((item, index) => {
        try {
          return elementSchema.parse(item)
        } catch (error) {
          if (error instanceof ZodError) {
            error.issues.forEach(issue => {
              issue.path = [index, ...(issue.path || [])]
              issues.push(issue)
            })
          }
          return item
        }
      })

      if (issues.length > 0) {
        throw new ZodError(issues)
      }

      return result
    }

    return data
  })

  return schema
}

// Union schema creation
function createUnionSchema(options) {
  const schema = createSchema("union", [])
  schema.options = options

  // Inherit optional and nullable properties from options
  schema._isOptional = options.some(option => option._isOptional)
  schema._isNullable = options.some(option => option._isNullable)

  schema.parse = jest.fn(data => {
    const errors = []

    for (const option of options) {
      try {
        return option.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...error.issues)
        }
      }
    }

    throw new ZodError([
      {
        code: "invalid_union",
        message: "Invalid input",
        path: []
      }
    ])
  })

  return schema
}

// Intersection schema creation
function createIntersectionSchema(left, right) {
  const schema = createSchema("intersection", [])
  schema.left = left
  schema.right = right

  schema.parse = jest.fn(data => {
    const leftResult = left.parse(data)
    const rightResult = right.parse(data)

    // For objects, merge them
    if (
      typeof leftResult === "object" &&
      typeof rightResult === "object" &&
      leftResult !== null &&
      rightResult !== null &&
      !Array.isArray(leftResult) &&
      !Array.isArray(rightResult)
    ) {
      return { ...leftResult, ...rightResult }
    }

    return rightResult
  })

  return schema
}

// Enum schema creation
function createEnumSchema(values) {
  const schema = createSchema("enum", [{ type: "enum", values }])
  schema.enum = values
  schema.options = Array.isArray(values) ? values : Object.values(values)

  return schema
}

// Literal schema creation
function createLiteralSchema(value) {
  const schema = createSchema("literal", [{ type: "literal", value }])
  schema.value = value

  return schema
}

// Main z object
const z = {
  // Basic types
  string: jest.fn(() => {
    return createSchema("string", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "string" }
    ])
  }),

  number: jest.fn(() => {
    return createSchema("number", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "number" }
    ])
  }),

  boolean: jest.fn(() => {
    return createSchema("boolean", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "boolean" }
    ])
  }),

  date: jest.fn(() => {
    return createSchema("date", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "date" }
    ])
  }),

  bigint: jest.fn(() => {
    return createSchema("bigint", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "bigint" }
    ])
  }),

  symbol: jest.fn(() => {
    return createSchema("symbol", [
      { type: "required", message: "Required" },
      { type: "type", expectedType: "symbol" }
    ])
  }),

  // Special types
  undefined: jest.fn(() =>
    createSchema("undefined", [{ type: "type", expectedType: "undefined" }])
  ),
  null: jest.fn(() =>
    createSchema("null", [{ type: "type", expectedType: "null" }])
  ),
  void: jest.fn(() => createSchema("void", [])),
  any: jest.fn(() => createSchema("any", [])),
  unknown: jest.fn(() => createSchema("unknown", [])),
  never: jest.fn(() => createSchema("never", [])),

  // Complex types
  object: jest.fn(shape => {
    return createObjectSchema(shape)
  }),

  array: jest.fn(element => {
    return createArraySchema(element)
  }),

  tuple: jest.fn((...items) => {
    const schema = createSchema("tuple", [])
    schema.items = items

    schema.parse = jest.fn(data => {
      if (!Array.isArray(data)) {
        throw new ZodError([
          {
            code: "invalid_type",
            message: "Expected array",
            path: []
          }
        ])
      }

      if (data.length !== items.length) {
        throw new ZodError([
          {
            code: "invalid_type",
            message: `Expected array of length ${items.length}`,
            path: []
          }
        ])
      }

      const issues = []
      const result = data.map((item, index) => {
        try {
          return items[index].parse(item)
        } catch (error) {
          if (error instanceof ZodError) {
            error.issues.forEach(issue => {
              issue.path = [index, ...(issue.path || [])]
              issues.push(issue)
            })
          }
          return item
        }
      })

      if (issues.length > 0) {
        throw new ZodError(issues)
      }

      return result
    })

    return schema
  }),

  record: jest.fn((keyType, valueType) => {
    const schema = createSchema("record", [])
    schema.keyType = keyType
    schema.valueType = valueType || keyType // Handle single parameter case

    return schema
  }),

  map: jest.fn((keyType, valueType) => {
    const schema = createSchema("map", [])
    schema.keyType = keyType
    schema.valueType = valueType
    return schema
  }),

  set: jest.fn(valueType => {
    const schema = createSchema("set", [])
    schema.valueType = valueType
    return schema
  }),

  // Enums and literals
  enum: jest.fn(values => {
    return createEnumSchema(values)
  }),

  nativeEnum: jest.fn(enumObject => {
    return createEnumSchema(enumObject)
  }),

  literal: jest.fn(value => {
    return createLiteralSchema(value)
  }),

  // Union and intersection
  union: jest.fn(types => {
    return createUnionSchema(types)
  }),

  discriminatedUnion: jest.fn((discriminator, types) => {
    const schema = createSchema("discriminatedUnion", [])
    schema.discriminator = discriminator
    schema.options = types
    return schema
  }),

  intersection: jest.fn((left, right) => {
    return createIntersectionSchema(left, right)
  }),

  // Function types
  function: jest.fn((args, returns) => {
    const schema = createSchema("function", [])
    schema.args = args
    schema.returns = returns
    return schema
  }),

  // Promise types
  promise: jest.fn(type => {
    const schema = createSchema("promise", [])
    schema.unwrap = type
    return schema
  }),

  // Utility functions
  optional: jest.fn(type => {
    if (type && typeof type.optional === "function") {
      return type.optional()
    }
    return createSchema("optional", [])
  }),

  nullable: jest.fn(type => {
    if (type && typeof type.nullable === "function") {
      return type.nullable()
    }
    const schema = createSchema("nullable", [])
    schema._isNullable = true
    return schema
  }),

  lazy: jest.fn(fn => {
    const schema = createSchema("lazy", [])
    schema.schema = fn
    return schema
  }),

  instanceof: jest.fn(cls => {
    const schema = createSchema("instanceof", [])
    schema.constructor = cls
    return schema
  }),

  // Custom validation
  custom: jest.fn(validator => {
    const schema = createSchema("custom", [])
    schema.validator = validator
    return schema
  }),

  // Coercion utilities
  coerce: {
    string: jest.fn(() => createSchema("string", [])),
    number: jest.fn(() => createSchema("number", [])),
    boolean: jest.fn(() => createSchema("boolean", [])),
    date: jest.fn(() => createSchema("date", [])),
    bigint: jest.fn(() => createSchema("bigint", []))
  },

  // Preprocessing
  preprocess: jest.fn((preprocessor, schema) => {
    const newSchema = createSchema("preprocess", [])
    newSchema.preprocessor = preprocessor
    newSchema.schema = schema
    return newSchema
  }),

  // Error classes and constants
  ZodError,

  ZodIssueCode: {
    invalid_type: "invalid_type",
    invalid_literal: "invalid_literal",
    custom: "custom",
    invalid_union: "invalid_union",
    invalid_union_discriminator: "invalid_union_discriminator",
    invalid_enum_value: "invalid_enum_value",
    unrecognized_keys: "unrecognized_keys",
    invalid_arguments: "invalid_arguments",
    invalid_return_type: "invalid_return_type",
    invalid_date: "invalid_date",
    invalid_string: "invalid_string",
    too_small: "too_small",
    too_big: "too_big",
    invalid_intersection_types: "invalid_intersection_types",
    not_multiple_of: "not_multiple_of",
    not_finite: "not_finite"
  },

  // Type utilities
  infer: jest.fn(),
  input: jest.fn(),
  output: jest.fn(),

  // Version info
  version: "3.22.0"
}

// Export everything
module.exports = {
  z,
  ZodError,
  ZodIssueCode: z.ZodIssueCode,
  // Additional exports for compatibility
  ZodSchema: createSchema,
  ZodObject: createObjectSchema,
  ZodArray: createArraySchema,
  ZodString: () => z.string(),
  ZodNumber: () => z.number(),
  ZodBoolean: () => z.boolean(),
  ZodDate: () => z.date(),
  ZodEnum: createEnumSchema,
  ZodLiteral: createLiteralSchema,
  ZodUnion: createUnionSchema,
  ZodIntersection: createIntersectionSchema
}
