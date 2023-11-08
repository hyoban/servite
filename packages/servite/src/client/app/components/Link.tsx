import React, { useTransition } from "react"
import {
  matchRoutes,
  resolvePath,
  useHref,
  useLinkClickHandler,
  useLocation,
} from "react-router-dom"

import { useAppState } from "../context.js"

import type { To } from "react-router-dom"

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  reloadDocument?: boolean
  replace?: boolean
  state?: unknown
  to: To
}

/**
 * Based on the Link component of react-router-dom
 *
 * features:
 * - wait for new page ready
 * - prefetch page assets while mouse enter
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    { onClick, reloadDocument, replace = false, state, target, to, ...rest },
    ref,
  ) {
    const href = useHref(to)
    const internalOnClick = useLinkClickHandler(to, { replace, state, target })
    const [, startTransition] = useTransition()
    const { pathname } = useLocation()
    const { routes } = useAppState()

    const handleClick = (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) => {
      if (onClick) {
        onClick(event)
      }

      if (!event.defaultPrevented && !reloadDocument) {
        startTransition(() => {
          internalOnClick(event)
        })
      }
    }

    const handleMouseEnter = () => {
      if (
        (typeof to === "string" && to.startsWith("/")) ||
        (typeof to === "object" && to.pathname?.startsWith("/"))
      ) {
        const { pathname: targetPath } = resolvePath(to, pathname)

        if (targetPath !== pathname) {
          matchRoutes(routes || [], targetPath)?.forEach((m) => {
            m.route.component?.prefetch?.()
          })
        }
      }
    }

    return (
      <a
        {...rest}
        href={href}
        onClick={handleClick}
        ref={ref}
        target={target}
        onMouseEnter={handleMouseEnter}
      />
    )
  },
)
