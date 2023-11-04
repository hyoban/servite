import type { AppState, Page as PageData } from "../../shared/types.js"

export type { PageData, AppState }

export class PageError extends Error {
  isNotFound?: boolean
  cause?: Error

  constructor(
    message?: string,
    options?: {
      cause?: Error
      isNotFound?: boolean
    },
  ) {
    super(message)
    this.cause = options?.cause
    this.isNotFound = options?.isNotFound
  }
}

export type LoaderFunction<
  T extends Record<string, any> | undefined | null | void,
> = () => T | Promise<T>
