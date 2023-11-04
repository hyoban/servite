import "./layout.css"

import { DocLayout } from "@/components/DocLayout"
import { Header } from "@/components/Header"
import { HomeLayout } from "@/components/HomeLayout"
import { SITE_DESCRIPTION, SITE_TITLE } from "@/constants"
import { createSiteState, siteContext } from "@/context"
import { useScrollToTop } from "@/hooks/useScrollToTop"
import { useMemo } from "react"
import { Helmet, Outlet, useAppState } from "servite/client"

export default function Layout() {
  const appState = useAppState()
  const { pagePath, pageData } = appState

  const siteState = useMemo(() => createSiteState(appState), [appState])
  const { currentLocale } = siteState

  useScrollToTop()

  if (!pagePath || !pageData) {
    return null
  }

  return (
    <>
      <Helmet titleTemplate={`%s | ${SITE_TITLE}`} defaultTitle={SITE_TITLE}>
        <html lang={currentLocale.locale} />
        <title>{pageData.meta?.title}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
      </Helmet>
      <siteContext.Provider value={siteState}>
        <Header />
        {pageData.routePath === currentLocale.localePath ? (
          <HomeLayout />
        ) : /\.mdx?$/.test(pageData.filePath) ? (
          <DocLayout />
        ) : (
          <Outlet />
        )}
      </siteContext.Provider>
    </>
  )
}
