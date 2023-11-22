import { renderSSRHead } from "@unhead/ssr"
import {
  defineRenderHandler,
  useRuntimeConfig,
  useStorage,
} from "#internal/nitro"
import { getHeader, getQuery } from "h3"
import { parseURL } from "ufo"
import { createHead } from "unhead"

import ssrStylesCleanerCode from "../../prebuild/ssr-styles-cleaner.prebuilt.js"
import { wrapViteId } from "../../shared/utils.js"
import { renderPreloadLink, renderTag, trapConsole } from "./utils.js"
import { collectRoutesStyles, getViteDevServer } from "./vite.js"

import type {
  Route,
  SSRContext,
  SSRData,
  SSREntry,
  SSREntryRenderContext,
  SSREntryRenderResult,
} from "../../shared/types.js"
import type { SSRHeadPayload } from "@unhead/ssr"
import type { EventHandler, H3Event } from "h3"
import type { RouteMatch } from "react-router-dom"

const isDev = process.env.NODE_ENV === "development"

const storage = useStorage()

export default <EventHandler>defineRenderHandler(async (event) => {
  const url = event.node.req.url!
  const { pathname } = parseURL(url)

  const ssrContext: SSRContext = {
    event,
    url,
    pathname,
    noSSR: isNoSSR(event),
  }
  const ssrEntry = ssrContext.noSSR ? undefined : await loadSSREntry()

  const { renderResult, renderContext } = await renderAppHtml(
    ssrContext,
    ssrEntry,
  )

  const fullHtml = await renderFullHtml(ssrContext, {
    renderResult,
    renderContext,
  })

  return {
    body: fullHtml,
    statusCode: event.res.statusCode,
    statusMessage: event.res.statusMessage,
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "X-Powered-By": "servite",
    },
  }
})

function isNoSSR(event: H3Event): boolean {
  const noSSR = Boolean(
    useRuntimeConfig()?.serviteConfig?.csr ||
      getQuery(event)["servite-no-ssr"] ||
      getHeader(event, "x-servite-no-ssr") ||
      process.env.SERVITE_NO_SSR,
  )

  if (noSSR) {
    return noSSR
  }

  return false
}

async function loadSSREntry() {
  if (isDev) {
    const viteDevServer = await getViteDevServer()
    const resolved = await viteDevServer.pluginContainer.resolveId(
      "virtual:servite-dist/client/app/entry.server.js",
      undefined,
      {
        ssr: true,
      },
    )

    if (!resolved) {
      throw new Error(
        "[servite] Failed to resolve module: virtual:servite-dist/client/app/entry.server.js",
      )
    }

    // Ensure refresh module for hydrate correctly
    // viteDevServer.moduleGraph.invalidateAll();

    return (await viteDevServer.ssrLoadModule(resolved.id)) as SSREntry
  }

  return import("virtual:servite/prod-ssr-entry")
}

let _prodAppHtml: string | undefined

async function loadTemplate(ssrContext: SSRContext) {
  let template = ""

  if (isDev) {
    const viteDevServer = await getViteDevServer()

    template = await viteDevServer.transformIndexHtml(
      "/.nitro/index.html",
      (await storage.getItem("root/.nitro/index.html")) as string,
      ssrContext.url,
    )
  } else {
    if (!_prodAppHtml) {
      _prodAppHtml = (await storage.getItem(
        "/assets/servite/index.html",
      )) as string
    }
    template = _prodAppHtml!
  }

  return template
}

interface RenderAppHtmlResult {
  renderResult: SSREntryRenderResult
  renderContext?: SSREntryRenderContext
}

async function renderAppHtml(
  ssrContext: SSRContext,
  ssrEntry?: SSREntry,
): Promise<RenderAppHtmlResult> {
  if (ssrContext.noSSR || !ssrEntry) {
    return {
      renderResult: { appHtml: "" },
    }
  }

  const renderContext: SSREntryRenderContext = {
    ssrContext,
    headContext: createHead(),
  }

  // Disable console while rendering in production
  const recoverConsole = isDev ? undefined : trapConsole()
  const renderResult = await ssrEntry.render(renderContext)
  recoverConsole?.()

  return {
    renderResult,
    renderContext,
  }
}

let _ssrManifestJson: Record<string, string[]> | undefined

async function renderAssets(
  ssrContext: SSRContext,
  routeMatches: RouteMatch[],
): Promise<string> {
  if (isDev) {
    const devAssets = useRuntimeConfig()?.["serviteConfig"]?.csr
      ? []
      : [
          // inject csr client entry
          renderTag({
            tag: "script",
            attrs: {
              type: "module",
              crossorigin: "",
              src: wrapViteId(
                "virtual:servite-dist/client/app/entry.client.js",
              ),
            },
          }),
        ]

    if (!ssrContext.noSSR) {
      // Collect routes styles to avoid FOUC
      const collectedStyles = await collectRoutesStyles(routeMatches)

      if (collectedStyles.length) {
        collectedStyles.forEach(({ id, url, code }) => {
          if (code) {
            // Vite handles HMR for styles injected as scripts
            devAssets.push(
              renderTag({
                tag: "script",
                attrs: {
                  type: "module",
                  crossorigin: "",
                  src: url,
                },
              }),
            )
            // - We still want to inject the styles to avoid FOUC.
            // - The `data-ssr-dev-id` attribute will be used by ssr-styles-cleaner
            //   to determine whether a style element is injected in ssr
            devAssets.push(
              renderTag({
                tag: "style",
                attrs: {
                  "data-ssr-dev-id": id,
                },
                children: `\n${code}\n`,
              }),
            )
          } else if (url) {
            // eg. css modules file
            devAssets.push(
              renderTag({
                tag: "link",
                attrs: {
                  rel: "stylesheet",
                  href: url,
                  "data-ssr-dev-id": id,
                },
              }),
            )
          }
        })

        devAssets.push(
          renderTag({
            tag: "script",
            children: ssrStylesCleanerCode,
          }),
        )
      }
    }

    return devAssets.filter(Boolean).join("\n    ")
  }

  if (!_ssrManifestJson) {
    _ssrManifestJson = (await storage.getItem(
      "/assets/servite/ssr-manifest.json",
    )) as Record<string, string[]>
  }

  return routeMatches
    .flatMap((m) => {
      const route = m.route as Route
      return (_ssrManifestJson?.[route.filePath] || []).map((link) =>
        link.endsWith(".js") ? "" : renderPreloadLink(link),
      )
    })
    .filter(Boolean)
    .join("\n    ")
}

async function renderFullHtml(
  ssrContext: SSRContext,
  { renderResult, renderContext }: RenderAppHtmlResult,
) {
  const routeMatches = renderContext?.routeMatches || []
  let template = await loadTemplate(ssrContext)

  const headPayload: SSRHeadPayload = renderContext?.headContext
    ? await renderSSRHead(renderContext.headContext)
    : {
        headTags: "",
        bodyTags: "",
        bodyTagsOpen: "",
        htmlAttrs: "",
        bodyAttrs: "",
      }

  // Assets
  const assets = await renderAssets(ssrContext, routeMatches)

  const headTags = [assets, renderResult.headTags]
    .map((x) => x?.toString())
    .filter(Boolean)
    .join("\n    ")

  headPayload.headTags = headTags + "\n" + headPayload.headTags

  Object.entries(headPayload).forEach(([key, value]) => {
    template = template.replace(`$\{${key}\}`, value)
  })

  const ssrData: SSRData = {
    context: {
      url: ssrContext.url,
      pathname: ssrContext.pathname,
      noSSR: ssrContext.noSSR,
    },
    serverRendered: Boolean(renderResult.appHtml),
    appState: renderContext?.appState,
  }

  template = template.replace(
    '<div id="root"></div>',
    `<script>window.__SERVITE__ssrData = ${JSON.stringify(ssrData)}</script>
    <div id="root" data-server-rendered="${ssrData.serverRendered}">${
      renderResult.appHtml
    }</div>`,
  )

  return template
}
