import react from "@vitejs/plugin-react"
import servite from "servite"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), servite()],
})
