import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom/server"
import { withBase, withoutTrailingSlash } from "ufo"
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
  const { pathname } = context.ssrContext
  const App = await createApp({ pagePath: pathname, context })

  const element = (
    <StaticRouter basename={basename} location={withBase(pathname, basename)}>
      <App />
    </StaticRouter>
  )

  const { appHtml, headTags } = await (customRender || fallbackRender)(element)

  return { appHtml, headTags }
}

export { pages } from "virtual:servite/pages"
export { routes } from "virtual:servite/pages-routes"

function fallbackRender(element: ReactElement): SSREntryRenderResult {
  return {
    appHtml: renderToString(element),
  }
}
