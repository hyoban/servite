/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Unhead } from "@unhead/schema"
import type { H3Event } from "h3"
import type { RouteMatch } from "react-router-dom"

export interface Page {
  routePath: string
  filePath: string
  isLayout: boolean
  is404: boolean
  meta: Record<string, any>
}

export interface Route {
  path: string
  filePath: string
  component: any
  element: any
  children?: Route[]
  meta?: Record<string, any>
}

export interface SSRContext {
  event: H3Event
  url: string
  pathname: string
  noSSR: boolean
}

export interface AppState {
  routes: Route[]
  pages: Page[]
  pagePath?: string
  pageData?: Page
  pageModule?: any
  pageLoading: boolean
  pageError: Error | null
  loaderData?: Record<string, any>
}

export interface SSREntryRenderContext {
  ssrContext?: SSRContext
  headContext: Unhead
  routeMatches?: RouteMatch[]
  appState?: Pick<
    AppState,
    "pagePath" | "pageData" | "pageModule" | "loaderData"
  >
}

export interface SSREntryRenderResult {
  appHtml: string
  headTags?: string
}

export type SSREntryRender = (
  context: SSREntryRenderContext,
) => Promise<SSREntryRenderResult>

export interface SSREntry {
  render: SSREntryRender
  pages: Page[]
  routes: Route[]
}

export interface SSRData {
  context: Omit<SSRContext, "event">
  serverRendered: boolean
  appState?: SSREntryRenderContext["appState"]
}

export interface LoaderBaseContext {
  url: string
  pathname: string
  search: string
  hash: string
  query: Record<string, any>
  params: Record<string, any>
}

export interface LoaderServerContext extends LoaderBaseContext {
  isBrowser: false
  event: H3Event
}

export interface LoaderClientContext extends LoaderBaseContext {
  isBrowser: true
}

export type LoaderContext = LoaderServerContext | LoaderClientContext
