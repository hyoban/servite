import assert from "assert"

import type { ServiteConfig, UserServiteConfig } from "./types.js"

export function resolveServiteConfig(
  userServiteConfig: UserServiteConfig = {},
): ServiteConfig {
  const {
    pagesDirs = [{ dir: "src/app" }],
    ssg = false,
    csr = false,
    baseHTML = {
      themeKey: "use-dark",
    },
    ...rest
  } = userServiteConfig

  assert(pagesDirs.length, "pagesDirs is empty")

  return {
    ...rest,
    pagesDirs,
    ssg,
    csr,
    baseHTML,
  }
}
