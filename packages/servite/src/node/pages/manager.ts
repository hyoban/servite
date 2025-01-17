import fg from "fast-glob"
import fs from "fs-extra"
import matter from "gray-matter"
import { extract, parse } from "jest-docblock"
import mm from "micromatch"
import { debounce } from "perfect-debounce"
import path from "upath"

import enhanceRouteCode from "../../prebuild/enhance-route.prebuilt.js"
import { PAGES_IGNORE_PATTERN, PAGES_PATTERN } from "../constants.js"
import { isMarkdown } from "../utils.js"

import type { Page, Route } from "../../shared/types.js"
import type { PagesDir, ServiteConfig } from "../types.js"
import type { ResolvedConfig } from "vite"

export class PagesManager {
  private reloadPromise: Promise<Page[]> | null = null

  constructor(
    private viteConfig: ResolvedConfig,
    private serviteConfig: ServiteConfig,
  ) {
    this.reload()
  }

  reload = () => {
    this.reloadPromise = debouncedScanPages(this.viteConfig, this.serviteConfig)
  }

  getPages = async () => {
    return (await this.reloadPromise) || []
  }

  generatePagesCode = async (write = false) => {
    const pages = await this.getPages()
    const code = `export const pages = ${JSON.stringify(pages, null, 2)};
export default pages;
`

    if (write) {
      await writeFile(this.viteConfig!, "pages.js", code)
    }

    return code
  }

  generatePagesRoutesCode = async (write = false) => {
    const pages = await this.getPages()
    const routes = createRoutes(pages)
    const rootLayout = routes[0]?.children ? routes[0] : null

    let importsCode = ""
    let componentIndex = 0

    let routesCode = JSON.stringify(routes, null, 2).replace(
      /( *)"component":\s"(.*?)"/g,
      (_str: string, space: string, component: string) => {
        const localName = `__Route__${componentIndex++}`
        const localNameStar = `${localName}__star`

        if (rootLayout && component === rootLayout.component) {
          importsCode += [
            `import * as ${localNameStar} from '${component}';`,
            `const ${localName} = enhance(${localNameStar})\n`,
          ].join("\n")
        } else {
          importsCode += `const ${localName} = enhance(() => import('${component}'));\n`
        }

        return `${space}"component": ${localName},
${space}"element": React.createElement(${localName}.component, null, React.createElement(Outlet))`
      },
    )

    routesCode = `import React from 'react';
  import { Outlet } from 'react-router-dom';
  ${generateEnhanceCode(this.viteConfig!)}
  ${importsCode}
  export const routes = ${routesCode};
  export default routes;
  `

    if (write) {
      await writeFile(this.viteConfig!, "pages-routes.js", routesCode)
    }

    return routesCode
  }

  checkPageFile = async (absFilePath: string) => {
    const isPageFile = this.serviteConfig.pagesDirs?.some(
      ({ dir, ignore = [] }) => {
        const prefixPath = path.join(
          path.resolve(this.viteConfig.root, dir),
          "/",
        )

        return (
          absFilePath.startsWith(prefixPath) &&
          mm.isMatch(absFilePath.substring(prefixPath.length), PAGES_PATTERN, {
            ignore: PAGES_IGNORE_PATTERN.concat(ignore),
          })
        )
      },
    )

    const existingPage = isPageFile
      ? (await this.getPages()).find((p) => absFilePath.endsWith(p.filePath))
      : undefined

    return {
      isPageFile,
      existingPage,
    }
  }
}

const debouncedScanPages = debounce(scanPages, 50)

async function scanPages(
  viteConfig: ResolvedConfig,
  serviteConfig: ServiteConfig,
): Promise<Page[]> {
  async function createPage(
    base: string,
    pageDir: string,
    pageFile: string,
  ): Promise<Page> {
    const basename = path.basename(path.trimExt(pageFile))
    const routePath = resolveRoutePath(base, pageFile)
    const absFilePath = path.join(pageDir, pageFile)
    const filePath = path.relative(viteConfig.root, absFilePath)
    const fileContent = fs.readFileSync(absFilePath, "utf-8")
    const meta = await parsePageMeta(filePath, fileContent)

    return {
      routePath,
      filePath,
      isLayout: basename === "layout",
      is404: basename === "404",
      meta,
    }
  }

  async function scan({
    dir,
    base = "/",
    ignore = [],
  }: PagesDir): Promise<Page[]> {
    const pageDir = path.resolve(viteConfig.root, dir)

    const pageFiles = await fg(PAGES_PATTERN, {
      cwd: pageDir,
      ignore: PAGES_IGNORE_PATTERN.concat(ignore),
      absolute: false,
    })

    return Promise.all(
      pageFiles.map((pageFile) => createPage(base, pageDir, pageFile)),
    )
  }

  return (await Promise.all(serviteConfig.pagesDirs?.map(scan) ?? [])).flat()
}

function resolveRoutePath(base: string, pageFile: string) {
  let routePath = path.trimExt(path.join("/", base, pageFile))

  if (isMarkdown(pageFile)) {
    routePath = routePath
      .replace(/\/index$/, "") // remove '/index'
      .replace(/\/README$/i, "") // remove '/README'
  } else {
    routePath = routePath.replace(/\/(page|layout)$/, "") // remove '/page' and '/layout'
  }

  routePath = routePath
    .replace(/\/404$/, "/*") // transform '/404' to '/*' so this route acts like a catch-all for URLs that we don't have explicit routes for
    .replace(/\/\[\.{3}.*?\]$/, "/*") // transform '/post/[...]' to '/post/*'
    .replace(/\/\[(.*?)\]/g, "/:$1") // transform '/user/[id]' to '/user/:id'
    // remove Route Groups /(ignore)/a/b => /a/b
    .replace(/\/\([^/]*?\)/g, "")

  return routePath || "/"
}

export async function parsePageMeta(filePath: string, fileContent: string) {
  // Markdown frontmatter
  if (isMarkdown(filePath)) {
    const { data: frontMatter, content } = matter(fileContent)

    if (!frontMatter.title) {
      const m = content.match(/^#\s+(.*)$/m)
      frontMatter.title = m?.[1]
    }

    return frontMatter
  }

  // JS/TS docblock
  if (fileContent.trim().startsWith("/*")) {
    return parse(extract(fileContent))
  }

  return {}
}

function depth(route: Route) {
  return route.path.split("/").filter(Boolean).length
}

function getRouteGroup(str: string) {
  // /src/pages/(admin)/layout.tsx -> admin
  const m = str.match(/\/\((.*?)\)/)
  return m?.[1]
}

function findParentRoute(routes: Route[], currentRoute: Route): Route | null {
  for (const route of routes) {
    if (route.children !== undefined) {
      const result = findParentRoute(route.children, currentRoute)
      if (result) {
        return result
      }
    }

    if (route.path === currentRoute.path && route.children) {
      return route
    }

    if (
      route.children &&
      getRouteGroup(route.filePath) &&
      getRouteGroup(route.filePath) === getRouteGroup(currentRoute.filePath)
    ) {
      return route
    }

    if (
      route.children &&
      !getRouteGroup(route.filePath) &&
      depth(route) + 1 === depth(currentRoute)
    ) {
      return route
    }

    if (
      route.path === "/" &&
      route.children &&
      !getRouteGroup(route.filePath) &&
      !currentRoute.children
    ) {
      return route
    }
  }
  return null
}

export function createRoutes(pages: Page[]): Route[] {
  const routes: Route[] = []

  const pagesWithDepth = pages.map((page) => ({
    ...page,
    depth: page.routePath.split("/").filter(Boolean).length + 1,
  }))

  pagesWithDepth.sort((a, b) => {
    if (a.depth !== b.depth) {
      return a.depth - b.depth
    }

    if (!a.isLayout && !b.isLayout) {
      return a.filePath.length - b.filePath.length
    }

    if (a.isLayout && !b.isLayout) {
      return -1
    }

    if (!a.isLayout && b.isLayout) {
      return 1
    }

    return a.filePath.length - b.filePath.length
  })

  for (const page of pagesWithDepth) {
    const route = {
      path: page.routePath,
      filePath: page.filePath,
      component: path.join("/", page.filePath),
      children: page.isLayout ? [] : undefined,
      meta: page.meta,
    } as Route

    const parentRoute = findParentRoute(routes, route)
    if (!parentRoute) {
      routes.push(route)
    } else {
      parentRoute.children?.push(route)
    }
  }

  return routes
}

function generateEnhanceCode(viteConfig: ResolvedConfig) {
  return `const seen = {};
const base = '${viteConfig.base}';
const assetsDir = '${viteConfig.build.assetsDir}';
${enhanceRouteCode}`
}

async function writeFile(
  viteConfig: ResolvedConfig,
  filePath: string,
  content: string,
) {
  return fs.outputFile(
    path.resolve(viteConfig.root, viteConfig.build.outDir, filePath),
    content,
    "utf-8",
  )
}
