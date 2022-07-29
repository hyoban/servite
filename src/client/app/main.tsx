import { useEffect, useRef, useState } from 'react';
import { useLocation, matchRoutes, matchPath } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import nprogress from 'nprogress';
import { routes, Route } from 'virtual:servite/routes';
import { pages } from 'virtual:servite/pages';
import { appContext } from './context';
import { AppState, PageError } from './types';
import { Page } from './components/Page';

async function waitForPageReady(
  appState: AppState,
  pagePath: string
): Promise<AppState | undefined> {
  if (appState.pagePath === pagePath) {
    return;
  }

  const newAppState = { ...appState };
  const matches = matchRoutes(appState.routes, pagePath);

  if (!matches?.length) {
    newAppState.pageError = new PageError('Page not found', {
      isNotFound: true,
    });
    return newAppState;
  }

  try {
    const preloadResults = await Promise.all(
      matches.map(async m => {
        const mod = await (m.route as Route).component.preload?.();
        // execute loader
        // TODO: loader params ctx
        const data = await mod?.loader?.();
        return { mod, data };
      })
    );

    const pageModule = {};
    let loaderData: any = undefined;

    preloadResults.forEach(res => {
      Object.assign(pageModule, res.mod);

      if (res.data) {
        loaderData ??= {};
        Object.assign(loaderData, res.data);
      }
    });

    Object.assign<AppState, Partial<AppState>>(newAppState, {
      pagePath,
      pageData: appState.pages.find(p => matchPath(p.routePath, pagePath)),
      pageModule,
      pageError: null,
      loaderData,
    });
  } catch (err) {
    if (err instanceof Error) {
      newAppState.pageError = err;
    }
  } finally {
    newAppState.pageLoading = false;

    if (
      typeof document !== 'undefined' &&
      document.documentElement.hasAttribute('hidden')
    ) {
      setTimeout(() => {
        document.documentElement.removeAttribute('hidden');
      }, 0);
    }
  }

  return newAppState;
}

export interface CreateAppConfig {
  pagePath?: string;
  helmetContext?: Record<string, unknown>;
}

export async function createApp({
  pagePath,
  helmetContext,
}: CreateAppConfig = {}) {
  let initialAppState: AppState = {
    routes,
    pages,
    pageLoading: false,
    pageError: null,
  };

  if (pagePath) {
    initialAppState =
      (await waitForPageReady(initialAppState, pagePath)) || initialAppState;
  }

  return function App() {
    const [appState, setAppState] = useState(initialAppState);
    const appStateRef = useRef(appState);
    appStateRef.current = appState;

    const { pathname } = useLocation();

    useEffect(() => {
      (async () => {
        const timer = setTimeout(() => {
          setAppState(prev => ({
            ...prev,
            pageLoading: true,
          }));
        }, 100);

        const newAppState = await waitForPageReady(
          appStateRef.current,
          pathname
        );

        if (newAppState) {
          setAppState(newAppState);
        }

        clearTimeout(timer);
      })();
    }, [pathname]);

    useEffect(() => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[servite] appState', appState);
      }
    }, [appState]);

    useEffect(() => {
      if (appState.pageLoading) {
        nprogress.start();

        return () => {
          nprogress.done();
        };
      }
    }, [appState.pageLoading]);

    return (
      <HelmetProvider context={helmetContext}>
        <Helmet defaultTitle="Servite App"></Helmet>
        <appContext.Provider value={appState}>
          <Page />
        </appContext.Provider>
      </HelmetProvider>
    );
  };
}
