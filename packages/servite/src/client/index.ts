import type { SSRContext } from "../shared/types"

export { Helmet } from "react-helmet-async"

export { isBrowser, ssrData } from "./app/constants.js"

export { useAppState, useLoaderData } from "./app/context.js"
export * from "./app/types.js"

export * from "./app/components/ClientOnly.js"

export type LoaderFunction<
  T extends Record<string, unknown> | undefined | null | void,
> = (context: SSRContext) => T | Promise<T>

export type LoaderFunctionArgs = Parameters<LoaderFunction<void>>[0]
