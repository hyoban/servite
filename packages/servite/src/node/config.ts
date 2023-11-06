import assert from "assert"

import { ServiteConfig, UserServiteConfig } from "./types.js"

export function resolveServiteConfig(
  userServiteConfig: UserServiteConfig = {},
): ServiteConfig {
  const {
    pagesDirs = [{ dir: "src/app" }],
    ssg = false,
    csr = false,
    baseHTML = {
      title: "Servite App",
      description: "Servite App",
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
