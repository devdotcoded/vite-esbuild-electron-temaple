import { BuildOptions } from "esbuild";
import { ResolvedViteElectronBuilderOptions } from "./types";

export function createEsbuildOptions(
  options: ResolvedViteElectronBuilderOptions
): BuildOptions {
  const define = Object.entries(options.env).reduce(
    (preVal, [key, value]) => ({
      ...preVal,
      [`process.env.${key}`]: JSON.stringify(value),
    }),
    {}
  );

  const { entryFile, outdir, tsconfig, external, preloadFile, command } =
    options;
  return {
    entryPoints: [entryFile, preloadFile],
    target: "es2020",
    outdir,
    format: "cjs",
    bundle: true,
    platform: "node",
    define,
    tsconfig,
    sourcemap: command !== "build",
    external,
  };
}
