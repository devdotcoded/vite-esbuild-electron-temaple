import reactRefresh from "@vitejs/plugin-react-refresh";
import { compileFile } from "bytenode";
import { writeFileSync } from "fs";
import { join } from "path";
import { defineConfig } from "vite";

import { VitePluginElectronBuilder } from "./plugin";

export default defineConfig({
  root: join(__dirname, "src/render"),
  plugins: [
    reactRefresh(),
    VitePluginElectronBuilder({
      root: process.cwd(),
      tsconfig: "./tsconfig.main.json",
      afterEsbuildBuild: async () => {
        await compileFile({
          filename: "./app/main/index.js",
          output: "./app/main/main.jsc",
          electron: true,
        });
        await compileFile({
          filename: "./app/main/preload.js",
          output: "./app/main/preload.jsc",
          electron: true,
        });
        writeFileSync(
          "./app/main/index.js",
          "require('bytenode');require('./main.jsc')"
        );
        writeFileSync(
          "./app/main/preload.js",
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
