import fs from "fs-extra"
import path from "upath"

import { APP_HTML_FILE, FS_PREFIX_CLIENT_ENTRY } from "../constants.js"

import type { ServiteConfig } from "../types.js"
import type { HtmlTagDescriptor, Plugin } from "vite"

export interface ServiteHtmlPluginConfig {
  serviteConfig: ServiteConfig
}

export function serviteHtml({
  serviteConfig,
}: ServiteHtmlPluginConfig): Plugin {
  return {
    name: "servite:html",
    enforce: "post",
    async config(config) {
      if (process.env.SERVITE_SSR_BUILD) {
        return
      }

      const root = path.resolve(config.root || "")
      const target = path.resolve(root, ".nitro/index.html")
      const customHtmlFile = path.resolve(root, "src/index.html")

      if (fs.existsSync(customHtmlFile)) {
        if (fs.existsSync(target)) {
          await fs.rm(target)
        }
        await fs.ensureLink(customHtmlFile, target)
      } else {
        await fs.copy(APP_HTML_FILE, target)
      }

      return {
        build: {
          rollupOptions: {
            input: target,
          },
        },
      }
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const htmlTags: HtmlTagDescriptor[] = []

        // inject theme inline script
        if (serviteConfig?.baseHTML?.themeKey) {
          htmlTags.push({
            tag: "script",
            injectTo: "head",
            children: `
              !(function () {
                var e =
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches,
                  t = localStorage.getItem("${serviteConfig.baseHTML.themeKey}") || "system"
                ;('"dark"' === t || (e && '"light"' !== t)) &&
                  document.documentElement.classList.toggle("dark", !0)
              })()
            `,
          })
        }

        // inject div#root
        if (!/<div.*?id=('|")root(\1)/.test(html)) {
          htmlTags.push({
            tag: "div",
            attrs: {
              id: "root",
            },
            injectTo: "body",
          })
        }

        // inject client entry
        if (serviteConfig?.csr || process.env.SERVITE_CLIENT_BUILD) {
          htmlTags.push({
            tag: "script",
            attrs: {
              type: "module",
              src: FS_PREFIX_CLIENT_ENTRY,
            },
            injectTo: "head",
          })
        }

        return htmlTags
      },
    },
    ...((serviteConfig?.csr || process.env.SERVITE_CLIENT_BUILD) && {
      async generateBundle(_options, bundle) {
        Object.values(bundle).forEach((chunk) => {
          if (
            chunk.type === "asset" &&
            path.normalize(chunk.fileName) === ".nitro/index.html"
          ) {
            chunk.fileName = "index.html"
          }
        })
      },
    }),
  }
}
