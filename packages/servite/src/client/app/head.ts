import { createContext, useContext } from "react"
import { useHead as useUnhead } from "unhead"

import type { Unhead } from "@unhead/schema"

export const HeadContext = createContext<Unhead | null>(null)
export const useHead = (head: Parameters<typeof useUnhead>[0]) => {
  const unhead = useContext(HeadContext)
  if (!unhead) {
    console.warn("useHead must be used within a HeadProvider")
    return
  }

  useUnhead(head, {
    head: unhead,
  })
}
