import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import cssOnly from 'rollup-plugin-css-only';
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'sm-click-library-ui',
      fileName: (format) => `sm-click-library-ui.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  plugins: [vue(),
    // cssOnly({
    //   output: 'styleSmClick.css'
    // })
  ],
  resolve: {
    alias: {
      "~/": path.resolve(__dirname, "src") + '/',
    },
  },
  css: {
    extract: true, // Consolidate all CSS into a single file
  },
})
