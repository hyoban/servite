import { defineEventHandler, getQuery, isMethod, readBody } from "h3"
import { defineCachedEventHandler } from "nitropack/dist/runtime/index.js"

import type { H3Event } from "h3"
import type { FetchOptions } from "ofetch"

export * from "nitropack/dist/runtime/index.js"
export * from "h3"

export interface ApiHandler<Args extends Record<string, any>, Result = any> {
  (params: Args, event: H3Event): Result | Promise<Result>
}

export interface ClientApiHandler<
  Args extends Record<string, any>,
  Result = any,
> {
  (args: Args, options?: FetchOptions): Promise<Result>
}

export function defineApiHandler<
  Args extends Record<string, any>,
  Result = any,
>(handler: ApiHandler<Args, Result>): ClientApiHandler<Args, Result> {
  return defineEventHandler(async (event) => {
    const args = isMethod(event, "GET")
      ? getQuery(event)
      : await readBody(event)

    return handler(args, event)
  }) as any
}

export const apiHandler = defineApiHandler

export function defineCachedApiHandler<
  Args extends Record<string, any>,
  Result = any,
>(handler: ApiHandler<Args, Result>): ClientApiHandler<Args, Result> {
  return defineCachedEventHandler(async (event) => {
    const args = isMethod(event, "GET")
      ? getQuery(event)
      : await readBody(event)

    return handler(args, event)
  }) as any
}

export const cachedApiHandler = defineCachedApiHandler
