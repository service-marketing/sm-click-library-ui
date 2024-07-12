import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssOnly from 'rollup-plugin-css-only';
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
      // Externalize deps that shouldn't be bundled into your library
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  plugins: [vue(),
  cssOnly({
    output: 'styleSmClick.css'
  })
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  }
})
