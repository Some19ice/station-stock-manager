const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./"
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Use jsdom environment for React component tests
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  },

  // Handle ESM modules
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react-jsx"
        }
      }
    ]
  },

  // Module name mapping
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "**/?(*.)+(spec|test).{js,jsx,ts,tsx}"
  ],

  // Ignore e2e tests (run with Playwright)
  testPathIgnorePatterns: [
    "<rootDir>/e2e/",
    "<rootDir>/.next/",
    "<rootDir>/node_modules/"
  ],

  // Coverage settings
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "db/**/*.{js,jsx,ts,tsx}",
    "actions/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**"
  ],

  // Test timeout
  testTimeout: 30000,

  // Transform ignore patterns for ESM modules
  transformIgnorePatterns: ["node_modules/(?!(postgres|drizzle-orm)/)"],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output for debugging
  verbose: false
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
