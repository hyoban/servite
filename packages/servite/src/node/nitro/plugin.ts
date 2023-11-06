import { isMainThread } from "worker_threads"

import { H3Event } from "h3"
import { build, createDevServer, Nitro, prepare } from "nitropack"
import path from "upath"
import { Plugin, ResolvedConfig } from "vite"

import { ApiHandler, ServiteConfig } from "../types.js"
import { initNitro } from "./init.js"

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

function hasApiHandlerCode(code: string) {
  return (
    code.includes("defineApiHandler") ||
    code.includes("apiHandler") ||
    code.includes("defineCachedApiHandler") ||
    code.includes("cachedApiHandler")
  )
}

const httpMethodRegex =
  /\.(connect|delete|get|head|options|patch|post|put|trace)/

function getHandler(id: string): ApiHandler {
  let method = "get"
  let route = path.trimExt(id.replace(/^\/routes/, ""))

  const methodMatch = route.match(httpMethodRegex)

  if (methodMatch) {
    route = route.slice(0, Math.max(0, methodMatch.index!))
    method = methodMatch[1]
  }

  route = route.replace(/\/index$/, "") || "/"

  return {
    method,
    route,
  }
}

// / -> <method>Index
// /foo/bar -> <method>FooBar
function getApiName({ method = "get", route = "/" }: ApiHandler) {
  let name = method.toLowerCase()

  name += (route.match(/[A-Za-z0-9]+/g) || ["index"])
    .map((x) => x[0].toUpperCase() + x.substring(1))
    .join("")

  return name
}

function getExportEnumCode(code: string) {
  return code.match(/^export\s+enum.*?\{[\s\S]*?\}/m)?.[0] || ""
}
