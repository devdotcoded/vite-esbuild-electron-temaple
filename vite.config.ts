import reactRefresh from "@vitejs/plugin-react-refresh";
import { compileFile } from "bytenode";
import { rename, writeFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";
import { defineConfig } from "vite";

import { VitePluginElectronBuilder } from "./plugin";

async function Ofusque(filename: string) {
  const fileName = basename(filename, extname(filename));
  const dir = dirname(filename);

  await compileFile({
    filename,
    output: join(dir, `${fileName}.jsc`),
    electron: true,
  });

  await writeFile(filename, `require('bytenode');require('./${fileName}.jsc')`);
}

export default defineConfig({
  root: join(__dirname, "src/render"),
  plugins: [
    reactRefresh(),
    VitePluginElectronBuilder({
      root: process.cwd(),
      tsconfig: "./tsconfig.main.json",
      afterEsbuildBuild: async () => {
        await rename("./app/main/index.prod.js", "./app/main/index.js");
        await Ofusque("./app/main/index.js");
        await Ofusque("./app/main/preload.js");
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
