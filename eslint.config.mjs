import { FlatCompat } from "@eslint/eslintrc"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off"
    }
  },
  {
    files: [
      "actions/pump-configurations.ts",
      "actions/meter-readings.ts",
      "actions/pms-calculations.ts",
      "db/schema/pump-*.ts",
      "db/schema/daily-pms-*.ts",
      "db/schema/pms-sales-*.ts"
    ],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error"
    }
  },
  {
    files: ["components/pms/**/*.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/explicit-function-return-type": "error"
    }
  },
  {
    files: [
      "__tests__/**/*pms*.test.ts",
      "__tests__/**/*pump*.test.ts",
      "__tests__/**/*meter*.test.ts"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "jest/expect-expect": "error",
      "jest/no-focused-tests": "error"
    }
  }
]

export default eslintConfig
