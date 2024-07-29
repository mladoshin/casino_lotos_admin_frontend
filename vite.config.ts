import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      components: `${path.resolve(__dirname, "./src/components/")}`,
      public: `${path.resolve(__dirname, "./public/")}`,
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": `${path.resolve(__dirname, "./src/types")}`,
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  }
})
