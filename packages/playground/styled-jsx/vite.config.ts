import { servite } from "servite"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    servite({
      ssg: ["/islands"],
      react: {
        babel: {
          plugins: ["styled-jsx/babel"],
        },
      },
    }),
  ],
})
