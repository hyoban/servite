import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server"
import { withBase, withoutBase, withoutTrailingSlash } from "ufo"
import { islands as devIslands } from "virtual:servite-dist/jsx/jsx-dev-runtime"
import { islands } from "virtual:servite-dist/jsx/jsx-runtime"
import customRender from "virtual:servite/custom-server-render"

// import ssrPrepass from 'react-ssr-prepass';
import { createApp } from "./main.js"

import type {
  SSREntryRenderContext,
  SSREntryRenderResult,
} from "../../shared/types.js"
import type { ReactElement } from "react"

const basename = withoutTrailingSlash(import.meta.env.BASE_URL)

export async function render(
  context: SSREntryRenderContext,
): Promise<SSREntryRenderResult> {
  // We need to reset the array before rendering
  // to avoid confusion of the array from the previous render
  islands.length = 0
  devIslands.length = 0

  const { pathname } = context.ssrContext
  const App = await createApp({ pagePath: pathname, context })

  const element = (
    <StaticRouter basename={basename} location={withBase(pathname, basename)}>
      <App />
    </StaticRouter>
  )

  const { appHtml, headTags } = await (customRender || fallbackRender)(element)

  // `islandComponents` are filled during rendering.
  // add islandComponents in context
  // so that server/runtime/renderer can render the island components script
  context.islands = islands.concat(devIslands)

  return { appHtml, headTags }
}

export { pages } from "virtual:servite/pages"
export { routes } from "virtual:servite/pages-routes"

function fallbackRender(element: ReactElement): SSREntryRenderResult {
  return {
    appHtml: renderToString(element),
  }
}
