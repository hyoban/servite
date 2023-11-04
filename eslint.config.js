import { planetMatrix } from "@planet-matrix/eslint-config"

export default planetMatrix({
  configs: [
    {
      ignores: [
        "packages/create-servite/**/*",
        "packages/docs/**/*",
        "packages/playground/**/*",
      ],
    },
  ],
})
