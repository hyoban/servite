declare const seen: Record<string, boolean>
declare const base: string
declare const assetsDir: string

type PageFactory = (() => Promise<any>) & { _result?: Promise<any> }
interface PageModule {
  [key: string]: any
  default: any
}

interface EnhanceResult {
  preload: () => any
  prefetch?: () => void
  component: any
}

/**
 * Enhance route.
 * Add preload function to `React.lazy`.
 * This function will be injected into routes code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function enhance(factoryOrModules: PageFactory | PageModule): EnhanceResult {
  const relativeBase = base === "" || base.startsWith(".")

  function enhanceFactory(factory: PageFactory): EnhanceResult {
    const links = factory
      .toString()
      .match(/('|")(.*?)\1/g)
      ?.map((link) => {
        // remove quotes
        link = link.slice(1, -1)

        if (link.startsWith("/")) {
          return link
        }

        if (link.startsWith("./")) {
          link = assetsDir + link.slice(1)
        }

        return relativeBase ? new URL(link, base).href : base + link
      })

    // @ts-ignore
    const LazyComponent: any = React.lazy(factory)

    async function preload() {
      if (LazyComponent._payload && typeof LazyComponent._init === "function") {
        try {
          await LazyComponent._init(LazyComponent._payload)
          // return page module
          return LazyComponent._payload._result
        } catch (err) {
          // lazy init function will throw promise,
          // so we should return it
          if (
            err instanceof Promise ||
            typeof (err as any)?.then === "function"
          ) {
            return err
          }
          throw err
        }
      }

      if (factory._result) {
        return factory._result
      }

      return (factory._result = factory())
    }

    async function prefetch() {
      if (!links || !links.length) {
        return
      }

      links.forEach((link) => {
        if (link in seen) {
          return
        }
        seen[link] = true

        const isCss = link.endsWith(".css")

        // check if the file is already prefetched / preloaded
        if (document.querySelector(`link[href="${link}"]`)) {
          return
        }

        const el = document.createElement("link")

        el.rel = "prefetch"
        if (!isCss) {
          el.as = "script"
          el.crossOrigin = ""
        }
        el.href = link

        document.head.appendChild(el)
      })
    }

    return {
      preload,
      prefetch,
      component: LazyComponent,
    }
  }

  function enhanceModules(mod: PageModule): EnhanceResult {
    return {
      preload() {
        return mod
      },
      component: mod.default,
    }
  }

  if ((factoryOrModules as any).default) {
    return enhanceModules(factoryOrModules as PageModule)
  }

  return enhanceFactory(factoryOrModules as PageFactory)
}
