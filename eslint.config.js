// @ts-check
import process from "node:process"

import ts from "@typescript-eslint/eslint-plugin"
// @ts-expect-error
import tsParser from "@typescript-eslint/parser"
import { defineFlatConfig } from "eslint-define-config"

const GLOB_EXCLUDE = [
  "**/node_modules",
  "**/dist",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/pnpm-lock.yaml",

  "**/output",
  "**/coverage",
  "**/temp",
  "**/.vitepress/cache",
  "**/.nitro",
  "**/.nuxt",
  "**/.next",
  "**/.vercel",
  "**/.changeset",
  "**/.idea",
  "**/.output",
  "**/.vite-inspect",

  "**/CHANGELOG*.md",
  "**/*.min.*",
  "**/LICENSE*",
  "**/__snapshots__",
  "**/auto-import?(s).d.ts",
  "**/components.d.ts",
]

export const GLOB_EXCLUDE_ROUTING_FILE = [
  "**/app/**/*.tsx",
  "**/server/**/*.ts",
]

export default defineFlatConfig([
  {
    ignores: GLOB_EXCLUDE,
  },
  {
    ignores: ["packages/playground/**/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...ts.configs["eslint-recommended"]?.overrides?.[0]?.rules,
      ...ts.configs["recommended"]?.rules,

      "@typescript-eslint/no-import-type-side-effects": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
])
