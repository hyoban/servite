import crypto from 'crypto';
import { Connect, Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { conventionalEntries } from 'vite-plugin-conventional-entries';
import { conventionalRoutes } from 'vite-plugin-conventional-routes';
import { resolveServiteConfig } from './config';
import { APP_DIR } from './constants';
import { ResolvedServiteConfig } from './types';

const GLOBAL: any = global;

const HTTP_DEV_SERVER_MODULE_ID = 'servite/http-dev-server';
const VITE_DEV_SERVER_MODULE_ID = 'servite/vite-dev-server';

const randomString = () => {
  crypto.randomBytes(20).toString('hex');
};

export interface ServiteConfig {
  serverEntry?: string;
  appFile?: string;
}

export function servite(serviteConfig: ServiteConfig = {}): Plugin[] {
  let resolvedServiteConfig: ResolvedServiteConfig;
  let viteConfig: ResolvedConfig;
  let viteDevServer: ViteDevServer;
  let httpDevServerGlobalKey: string;
  let viteDevServerGlobalKey: string;

  const loadServerEntry = async () => {
    const { serverEntry } = resolvedServiteConfig;

    if (!serverEntry) {
      return;
    }

    const resolvedId = await viteDevServer.pluginContainer.resolveId(
      serverEntry,
      undefined,
      { ssr: true }
    );

    if (!resolvedId) {
      viteConfig.logger.error(
        `[servite] server entry '${serverEntry}' can not be resolved`
      );
      return;
    }

    await viteDevServer.ssrLoadModule(resolvedId.id);
  };

  const plugins: Plugin[] = [
    {
      name: 'servite',

      enforce: 'post',

      configResolved(config) {
        resolvedServiteConfig = resolveServiteConfig(
          config.root,
          serviteConfig
        );
        viteConfig = config;
      },

      configureServer(server) {
        viteDevServer = server;

        let requestListener: Connect.NextHandleFunction | undefined;

        viteDevServer.httpServer?.on('listening', () => {
          // proxy httpServer to get request listener
          GLOBAL[httpDevServerGlobalKey] = new Proxy(server.httpServer!, {
            get(target, prop) {
              if (prop === 'addListener' || prop === 'on') {
                return (event: string, ...rest: any[]) => {
                  if (event === 'request') {
                    requestListener = rest[0];
                  } else {
                    // @ts-expect-error
                    return target[prop].call(target, event, ...rest);
                  }
                };
              }

              // for 'listen`, just execute the callback directly
              if (prop === 'listen') {
                return (...args: any[]) => {
                  const listeningListener = args.find(
                    arg => typeof arg === 'function'
                  );
                  if (listeningListener) {
                    Promise.resolve().then(listeningListener);
                  }
                };
              }
            },
          });

          loadServerEntry();
        });

        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (!requestListener) {
              next();
              return;
            }

            const { url, originalUrl } = req;

            // set url for requestListener
            if (originalUrl) {
              req.url = req.originalUrl;
            }

            try {
              await requestListener(req, res, () => {
                // if the response is not ended, continue to execute the next handler
                if (!res.writableEnded) {
                  // set url back for vite middleware
                  req.url = url;
                  next();
                }
              });
            } catch (err) {
              res.statusCode = 500;

              if (err instanceof Error) {
                server.ssrFixStacktrace(err);
                res.end(err.stack || err.message);
              } else {
                res.end('Unknown error');
              }
            }
          });
        };
      },

      buildStart() {
        httpDevServerGlobalKey = '__SERVITE_HTTP_DEV_SERVER__' + randomString();
        viteDevServerGlobalKey = '__SERVITE_VITE_DEV_SERVER__' + randomString();

        GLOBAL[viteDevServerGlobalKey] = viteDevServer;
      },

      closeBundle() {
        delete GLOBAL[httpDevServerGlobalKey];
        delete GLOBAL[viteDevServerGlobalKey];
      },

      resolveId(source) {
        if (
          source === HTTP_DEV_SERVER_MODULE_ID ||
          source === VITE_DEV_SERVER_MODULE_ID
        ) {
          return source;
        }
      },

      load(id) {
        if (
          id === HTTP_DEV_SERVER_MODULE_ID &&
          viteConfig.command === 'serve'
        ) {
          return `export default global.${httpDevServerGlobalKey}`;
        }

        if (
          id === VITE_DEV_SERVER_MODULE_ID &&
          viteConfig.command === 'serve'
        ) {
          return `export default global.${viteDevServerGlobalKey}`;
        }
      },

      handleHotUpdate(ctx) {
        // eslint-disable-next-line no-console
        console.log(ctx.modules.map(m => m.id));
      },
    },
    ...conventionalEntries({
      entries: APP_DIR,
    }),
    conventionalRoutes({
      pages: {
        dir: 'src/pages',
        pattern: ['**/page{.js,.jsx,.ts,.tsx}', '**/*{.md,.mdx}'],
      },
    }),
  ];

  return plugins;
}

export default servite;
