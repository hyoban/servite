import { fileURLToPath } from "url"

import path from "upath"

export const PKG_DIR = path.resolve(fileURLToPath(import.meta.url), "../../..")
export const DIST_DIR = path.resolve(PKG_DIR, "dist")
export const JSX_DIR = path.resolve(DIST_DIR, "jsx")
export const SERVER_DIR = path.resolve(DIST_DIR, "server")
export const CLIENT_DIR = path.resolve(DIST_DIR, "client")
export const APP_DIR = path.resolve(CLIENT_DIR, "app")
export const APP_HTML_FILE = path.resolve(APP_DIR, "index.html")
export const CLIENT_ENTRY_FILE = path.resolve(APP_DIR, "entry.client.js")
export const FS_PREFIX_CLIENT_ENTRY = `/@fs/${CLIENT_ENTRY_FILE}`
export const SSR_ENTRY_FILE = path.resolve(APP_DIR, "entry.server.js")

export const PAGES_MODULE_ID = "virtual:servite/pages"
export const RESOLVED_PAGES_MODULE_ID = "\0" + PAGES_MODULE_ID

export const PAGES_ROUTES_MODULE_ID = "virtual:servite/pages-routes"
export const RESOLVED_PAGES_ROUTES_MODULE_ID = "\0" + PAGES_ROUTES_MODULE_ID

export const CUSTOM_SERVER_RENDER_MODULE_ID =
  "virtual:servite/custom-server-render"
export const RESOLVED_CUSTOM_SERVER_RENDER_MODULE_ID =
  "\0" + CUSTOM_SERVER_RENDER_MODULE_ID

export const SCRIPT_EXTS = [".js", ".jsx", ".ts", ".tsx"]

export const PAGES_PATTERN = [
  "**/{page,layout}.{js,jsx,ts,tsx}",
  "**/*.{md,mdx}",
]
export const PAGES_IGNORE_PATTERN = [
  "**/{test,tests,__tests__}/**",
  "**/*.test.*",
]

export const MARKDOWN_EXTS = [".md", ".mdx"]
