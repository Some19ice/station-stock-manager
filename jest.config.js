const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./"
})

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig({
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "**/?(*.)+(spec|test).{js,jsx,ts,tsx}"
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "db/**/*.{js,jsx,ts,tsx}",
    "actions/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  testTimeout: 30000
})
