# @hyoban/servite

## 介绍

从 [Codpoe/servite](https://github.com/codpoe/servite) fork 而来，做一些修改满足个人需求。
移除了 Islands 和 一体化 API 调用的支持。

## 安装

```bash
ni servite defu h3 nitropack servite
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

1. 添加 `"prepare": "nitropack prepare",` 到 package.json 的 scripts 中。
1. 在 `tsconfig.json` 添加 `"extends": "./.nitro/types/tsconfig.json",`
