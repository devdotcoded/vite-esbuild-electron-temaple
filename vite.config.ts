import vue from "@vitejs/plugin-vue";
import { compileFile } from "bytenode";
import { writeFileSync } from "fs";
import { join } from "path";
import { defineConfig } from "vite";
import { VitePluginElectronBuilder } from "./plugin";

export default defineConfig({
  root: join(__dirname, "src/render"),
  plugins: [
    vue(),
    VitePluginElectronBuilder({
      root: process.cwd(),
      tsconfig: "./tsconfig.main.json",
      afterEsbuildBuild: async () => {
        await compileFile({
          filename: "./app/index.js",
          output: "./app/main.jsc",
          electron: true,
        });
        await compileFile({
          filename: "./app/preload.js",
          output: "./app/preload.jsc",
          electron: true,
        });
        writeFileSync(
          "./app/index.js",
          "require('bytenode');require('./main.jsc')"
        );
        writeFileSync(
          "./app/preload.js",
          "require('bytenode');require('./preload.jsc')"
        );
      },
    }),
  ],
  resolve: {
    alias: {
      "@render": join(__dirname, "src/render"),
      "@main": join(__dirname, "src/main"),
      "@common": join(__dirname, "src/common"),
    },
  },
  base: "./",
  build: {
    outDir: join(__dirname, "app/render"),
    emptyOutDir: true,
  },
});
