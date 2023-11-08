import type { SSRContext } from "../shared/types"

export { isBrowser, ssrData } from "./app/constants.js"
export * from "./app/context.js"
export * from "unhead"
export * from "./app/types.js"

export type LoaderFunction<
  T extends Record<string, unknown> | undefined | null | void,
> = (context: SSRContext) => T | Promise<T>

export type LoaderFunctionArgs = Parameters<LoaderFunction<void>>[0]
