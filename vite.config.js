import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "sm-click-library-ui",
      fileName: (format) => `sm-click-library-ui.${format}.js`,
    },
    rollupOptions: {
      external: [
        "vue",
        "pinia",
        /^@capacitor\//,
        /^@capacitor-community\//,
        "@fancyapps/ui",
        "wavesurfer.js",
        /^leaflet/,
        "notiwind",
      ],
      output: {
        globals: {
          vue: "Vue",
          pinia: "Pinia",
          "@capacitor/filesystem": "CapacitorFilesystem",
          "@capacitor-community/file-opener": "CapacitorFileOpener",
          "@fancyapps/ui": "Fancybox",
          "wavesurfer.js": "WaveSurfer",
          leaflet: "L",
          notiwind: "notiwind",
        },
      },
    },
  },
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/test-utils/setup.js",
          dest: "test-utils",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "~/": path.resolve(__dirname, "src") + "/",
    },
  },
  css: {
    extract: {
      filename: "custom-name.css", // Specify the desired filename
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-utils/setup.js",
  },
});
