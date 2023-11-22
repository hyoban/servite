import { fileURLToPath } from "url"

import { cac } from "cac"
import fs from "fs-extra"
import { createNitro, scanHandlers, writeTypes } from "nitropack"
import colors from "picocolors"

const pkgPath = fileURLToPath(new URL("../../package.json", import.meta.url))
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))

const cli = cac("servite").version(pkg.version)

cli
  .command("build [root]", "build for production")
  .action(async (root: string) => {
    const { createLogger } = await import("vite")
    const { build } = await import("./build/build.js")

    try {
      await build({
        root,
      })
    } catch (e) {
      if (e instanceof Error) {
        createLogger().error(colors.red(`error during build:\n${e.stack}`), {
          error: e,
        })
        process.exit(1)
      }
    }
  })

cli.command("prepare", "generate types for the project").action(async () => {
  const nitro = await createNitro()
  await scanHandlers(nitro)
  await writeTypes(nitro)
})

cli.parse()
