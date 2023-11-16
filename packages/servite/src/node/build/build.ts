import { nodeResolve } from "@rollup/plugin-node-resolve"
import fs from "fs-extra"
import mm from "micromatch"
import { copyPublicAssets, build as nitroBuild, prepare } from "nitropack"
import path from "upath"
import { build as viteBuild } from "vite"

import { SSR_ENTRY_FILE } from "../constants.js"
import { initNitro } from "../nitro/init.js"

import type { Page } from "../../shared/types.js"
import type { ServiteConfig } from "../types.js"
import type { Nitro } from "nitropack"
import type { RollupOutput } from "rollup"
import type { InlineConfig, ResolvedConfig } from "vite"

export async function build(inlineConfig: InlineConfig) {
  return new Builder(inlineConfig).build()
}

class Builder {
  constructor(private inlineConfig?: InlineConfig) {}

  baseBuild = async (extraConfig?: InlineConfig) => {
    let viteConfig = {} as ResolvedConfig
    let serviteConfig = {} as ServiteConfig
    let outDir = "dist"
    let pages: Page[] = []

    const { outDir: extraOutDir } = extraConfig?.build || {}

    delete extraConfig?.build?.outDir

    const getPlugin = (name: string) => {
      const plugin = viteConfig.plugins.find((p) => p.name === name)
      if (!plugin) {
        throw new Error(`vite plugin "${name}" not found`)
      }
      return plugin
    }

    const rollupOutput = (await viteBuild({
      ...this.inlineConfig,
      logLevel: extraConfig?.logLevel || "info",
      plugins: [
        ...(this.inlineConfig?.plugins || []),
        ...(extraConfig?.plugins || []),
        {
          name: "servite:build:base",
          enforce: "post",
          config() {
            return {
              ...extraConfig,
              build: {
                ...extraConfig?.build,
                rollupOptions: {
                  ...extraConfig?.build?.rollupOptions,
                  // add `nodeResolve` to fix resolve `chalk` package.json imports
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  plugins: [nodeResolve() as any],
                },
              },
            }
          },
          async configResolved(config) {
            viteConfig = config

            // Save servite config
            serviteConfig = getPlugin("servite").api.getServiteConfig()

            // Save some config for generate bootstrap code and ssg
            ;({ outDir } = config.build)

            // Append extraOutDir
            if (extraOutDir) {
              config.build.outDir = path.join(outDir, extraOutDir)
            }
          },
          async buildEnd() {
            // Save pages to prerender
            pages = await getPlugin("servite:pages").api.getPages()
          },
        },
      ],
    })) as RollupOutput

    return {
      rollupOutput,
      viteConfig,
      serviteConfig,
      outDir,
      pages,
    }
  }

  clientBuild = async () => {
    process.env.SERVITE_CLIENT_BUILD = "1"

    return this.baseBuild({
      build: {
        ssrManifest: true, // generate ssr manifest while client bundle
      },
    })
  }

  ssrBuild = async () => {
    process.env.SERVITE_SSR_BUILD = "1"

    return this.baseBuild({
      build: {
        outDir: "ssr",
        ssr: SSR_ENTRY_FILE,
      },
    })
  }

  build = async () => {
    // Client bundle
    const { rollupOutput, viteConfig, serviteConfig } = await this.clientBuild()
    getEntryUrl(rollupOutput, viteConfig)

    let pages: Page[] = []

    if (!serviteConfig.csr) {
      emptyLine()
      // SSR bundle
      ;({ pages } = await this.ssrBuild())
    }

    emptyLine()

    const nitro = await initNitro({
      serviteConfig,
      viteConfig,
      nitroConfig: {
        dev: false,
        prerender: {
          routes: getPrerenderRoutes(pages, serviteConfig),
        },
      },
    })

    await prepare(nitro)
    await copyServerAssets(viteConfig)
    await copyPublicAssets(nitro)

    if (serviteConfig.csr) {
      await copyCsrHtml(viteConfig, nitro)
    }

    // Build nitro output
    await nitroBuild(nitro)
    await nitro.close()
  }
}

function emptyLine() {
  // eslint-disable-next-line no-console
  console.log("")
}

function getEntryUrl(rollupOutput: RollupOutput, viteConfig: ResolvedConfig) {
  return path.join(viteConfig.base || "/", rollupOutput.output[0].fileName)
}

function getPrerenderRoutes(pages: Page[], { ssg, csr }: ServiteConfig) {
  if (csr || !ssg || (Array.isArray(ssg) && !ssg.length)) {
    return []
  }

  const allRoutes = pages.filter((p) => !p.isLayout).map((p) => p.routePath)

  if (ssg === true) {
    return allRoutes
  }

  return mm(allRoutes, ssg)
}

async function copyCsrHtml(viteConfig: ResolvedConfig, nitro: Nitro) {
  await fs.copy(
    path.resolve(viteConfig.root, viteConfig.build.outDir, "index.html"),
    path.resolve(nitro.options.output.publicDir, "index.html"),
  )
}

/**
 * Copy some client bundle result to '.output/server-assets'.
 * Renderer will read server-assets by useStorage().getItem('/assets/servite/...')
 */
async function copyServerAssets(viteConfig: ResolvedConfig) {
  await Promise.all([
    fs.copy(
      path.resolve(viteConfig.root, viteConfig.build.outDir, "index.html"),
      path.resolve(
        viteConfig.root,
        viteConfig.build.outDir,
        ".output/server-assets",
        "index.html",
      ),
    ),
    fs.copy(
      path.resolve(
        viteConfig.root,
        viteConfig.build.outDir,
        ".vite",
        "ssr-manifest.json",
      ),
      path.resolve(
        viteConfig.root,
        viteConfig.build.outDir,
        ".output/server-assets",
        "ssr-manifest.json",
      ),
    ),
  ])
}
