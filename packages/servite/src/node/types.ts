export interface PagesDir {
  base?: string
  dir: string
  ignore?: string[]
}

export interface UserServiteConfig {
  /**
   * Directory for finding pages
   * @default [{ dir: 'src/app' }]
   */
  pagesDirs?: PagesDir[]
  /**
   * Prerender routes (Static Site Generate)
   *
   * supports glob patterns
   * @default false
   */
  ssg?: boolean | string[]
  /**
   * Switch to CSR (Client Side Rendering)
   * @default false
   */
  csr?: boolean
  baseHTML?: {
    /**
     * @default 'use-dark'
     */
    themeKey?: string
  }
}

export interface ServiteConfig extends UserServiteConfig {
  serverRenderFile?: string
}
