# @hyoban/servite

## 介绍

从 [Codpoe/servite](https://github.com/codpoe/servite) fork 而来，做一些修改满足个人需求。
移除了 Islands 和 一体化 API 调用的支持。

## 安装

```bash
ni servite@npm:@hyoban/servite defu h3 nitropack react-router-dom
```

```ts
// vite.config.ts

import react from "@vitejs/plugin-react"
import servite from "servite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), servite()],
})
```

1. 添加 `"prepare": "servite prepare",` 到 package.json 的 scripts 中
1. 修改 `build` 脚本为 `"build": "servite build",`
1. 在 `tsconfig.node.json` 中添加 `include` 内容 `"routes", "api", "./.nitro/types/nitro.d.ts"`

## 如何定义路由

1. 程序的路由约定定义于 `src/app` 目录下，支持 `page.tsx` 和 `layout.tsx`
1. 使用 `()` 作为路由分组，允许在不影响路由的情况下，共享 layout
1. layout 默认导出一个接收 `children` 参数的组件

## 如何定义 Loader

在 page 或者 layout 文件中导出名为 `loader` 的函数，你可以结合 `useLoaderData` 来获取 loader 的返回值。

```tsx
import { useLoaderData } from "servite/client"

import type { LoaderFunctionArgs } from "servite/client"

export function loader(context: LoaderFunctionArgs) {
  return {
    hello: context.pathname,
  }
}

export default function Page() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>Page</h1>
      <p>{data.hello}</p>
    </div>
  )
}
```

## 如何自定义 HTML

使用来自 [Unhead](https://unhead.unjs.io/) 的 `useHead` 函数
