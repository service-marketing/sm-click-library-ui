import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'sm-click-library-ui',
      fileName: (format) => `sm-click-library-ui.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      }
    }
  },
  plugins: [vue(),
  ],
  resolve: {
    alias: {
      "~/": path.resolve(__dirname, "src") + '/',
    },
  },
  css: {
    extract: {
      filename: 'custom-name.css', // Specify the desired filename
    },
  },
})