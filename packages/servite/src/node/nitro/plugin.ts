import { isMainThread } from "worker_threads"

import { H3Event } from "h3"
import { build, createDevServer, prepare } from "nitropack"

import { initNitro } from "./init.js"

import type { ServiteConfig } from "../types.js"
import type { Nitro } from "nitropack"
import type { Plugin, ResolvedConfig } from "vite"

export interface ServiteNitroPluginConfig {
  serviteConfig: ServiteConfig
}

export function serviteNitro({
  serviteConfig,
}: ServiteNitroPluginConfig): Plugin[] {
  let viteConfig: ResolvedConfig
  let nitro: Nitro

  return [
    {
      name: "servite:nitro-server",
      enforce: "post",
      async configResolved(config) {
        viteConfig = config

        nitro = await initNitro({
          serviteConfig,
          viteConfig,
          nitroConfig: { dev: config.command === "serve", logLevel: 2 },
        })
      },
      async configureServer(server) {
        // Only configure server in main thread, not worker thread
        if (!isMainThread) {
          return
        }

        const nitroDevServer = createDevServer(nitro)
        // Prepare directories
        await prepare(nitro)
        // Build dev server
        const buildPromise = build(nitro)

        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (res.writableEnded) {
              return next()
            }

            // Set url for custom server
            if (req.originalUrl) {
              req.url = req.originalUrl
            }

            await buildPromise

            try {
              await nitroDevServer.app.handler(new H3Event(req, res))
            } catch (err) {
              res.statusCode = 500

              if (err instanceof Error) {
                res.end(err.stack || err.message)
              } else {
                res.end("Unknown error")
              }
            }
          })
        }
      },
      async closeBundle() {
        await nitro?.close()
      },
    },
  ]
}
