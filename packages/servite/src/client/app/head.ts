import { debouncedRenderDOMHead } from "@unhead/dom"
import { createContext, useContext, useEffect } from "react"
import { useHead as useUnhead } from "unhead"

import type { Head, Unhead } from "@unhead/schema"

export const UnheadContext = createContext<Unhead | null>(null)

export const useHead = (head: Head) => {
  const unhead = useContext(UnheadContext)
  useUnhead(head)
  useEffect(() => {
    if (!unhead) return
    debouncedRenderDOMHead(unhead)
  }, [unhead, head])
}
