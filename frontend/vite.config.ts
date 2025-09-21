import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Explicit Vue plugin configuration
      template: {
        compilerOptions: {
          // Add any compiler options if needed
        }
      }
    }),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Add some debugging options
  server: {
    hmr: true,
  },
  // Clear cache on build
  build: {
    sourcemap: true,
  } // restart server
})
