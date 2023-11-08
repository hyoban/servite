import fg from "fast-glob"
import path from "upath"

import { resolveServiteConfig } from "./config.js"
import { CLIENT_DIR, DIST_DIR, PKG_DIR } from "./constants.js"
import { serviteHtml } from "./html/plugin.js"
import { serviteNitro } from "./nitro/plugin.js"
import { servitePages } from "./pages/plugin.js"

import type { UserServiteConfig } from "./types.js"
import type { PluginOption } from "vite"

export function servite(userServiteConfig?: UserServiteConfig): PluginOption[] {
  const serviteConfig = resolveServiteConfig(userServiteConfig)

  const plugins: PluginOption[] = [
    {
      name: "servite",
      enforce: "pre",
      async config() {
        return {
          resolve: {
            alias: {
              "virtual:servite-dist": DIST_DIR,
            },
          },
        }
      },
      async configureServer(server) {
        // for local dev
        if (path.normalize(server.config.root).startsWith(PKG_DIR)) {
          const files = await fg("**/*", {
            cwd: DIST_DIR,
            ignore: [`${CLIENT_DIR}/**/*`],
            absolute: true,
          })
          server.config.configFileDependencies.push(...files)
          server.watcher.add(files)
        }
      },
      api: {
        getServiteConfig() {
          return serviteConfig
        },
      },
    },
    serviteHtml({ serviteConfig }),
    servitePages({ serviteConfig }),
    ...serviteNitro({ serviteConfig }),
  ]

  return plugins
}

export default servite
