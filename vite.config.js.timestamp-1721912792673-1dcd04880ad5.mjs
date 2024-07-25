// vite.config.js
import { defineConfig } from "file:///C:/Users/Administrator/Documents/TCC/sm-click-library-ui/node_modules/.pnpm/vite@5.3.3/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Administrator/Documents/TCC/sm-click-library-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.0.5_vite@5.3.3_vue@3.4.31/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Documents\\TCC\\sm-click-library-ui";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "sm-click-library-ui",
      fileName: (format) => `sm-click-library-ui.${format}.js`
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      "~/": path.resolve(__vite_injected_original_dirname, "src") + "/"
    }
  },
  css: {
    extract: {
      filename: "custom-name.css"
      // Specify the desired filename
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvY3VtZW50c1xcXFxUQ0NcXFxcc20tY2xpY2stbGlicmFyeS11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxEb2N1bWVudHNcXFxcVENDXFxcXHNtLWNsaWNrLWxpYnJhcnktdWlcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvRG9jdW1lbnRzL1RDQy9zbS1jbGljay1saWJyYXJ5LXVpL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJ1aWxkOiB7XHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6ICdzcmMvaW5kZXguanMnLFxyXG4gICAgICBuYW1lOiAnc20tY2xpY2stbGlicmFyeS11aScsXHJcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgc20tY2xpY2stbGlicmFyeS11aS4ke2Zvcm1hdH0uanNgXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBleHRlcm5hbDogWyd2dWUnXSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgdnVlOiAnVnVlJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3Z1ZSgpLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJ+L1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSArICcvJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIGV4dHJhY3Q6IHtcclxuICAgICAgZmlsZW5hbWU6ICdjdXN0b20tbmFtZS5jc3MnLCAvLyBTcGVjaWZ5IHRoZSBkZXNpcmVkIGZpbGVuYW1lXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csU0FBUyxvQkFBb0I7QUFDblksT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixVQUFVLENBQUMsV0FBVyx1QkFBdUIsTUFBTTtBQUFBLElBQ3JEO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsS0FBSztBQUFBLE1BQ2hCLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLEtBQUs7QUFBQSxRQUNQO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFBQyxJQUFJO0FBQUEsRUFDZDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsTUFBTSxLQUFLLFFBQVEsa0NBQVcsS0FBSyxJQUFJO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxVQUFVO0FBQUE7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
