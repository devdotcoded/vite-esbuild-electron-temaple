import { builtinModules } from "module";
import { join } from "path";
import { ResolvedConfig } from "vite";
import {
  ResolvedViteElectronBuilderOptions,
  ViteElectronBuilderOptions,
} from "./types";

export function resolveOptions(
  options: Partial<ViteElectronBuilderOptions>,
  viteConfig: ResolvedConfig
) {
  const root = options.root || process.cwd();
  const external = Array.from(
    new Set([
      ...builtinModules.filter(
        (x) => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)
      ),
      "electron",
      ...(Array.isArray(options.external) ? options.external : []),
    ])
  );

  const {
    outdir = join(root, "dist/main/"),
    entryFile = join(root, "src/main/index.ts"),
    preloadFile = join(root, "src/main/preload.ts"),
    tsconfig,
    electronBuilderConfig,
    afterEsbuildBuild = async () => {},
  } = options;

  const { env, command } = viteConfig;

  const resolvedViteElectronBuilderOptions: ResolvedViteElectronBuilderOptions =
    {
      root,
      outdir,
      entryFile,
      preloadFile,
      tsconfig,
      electronBuilderConfig,
      env,
      command,
      external,
      afterEsbuildBuild,
    };

  return resolvedViteElectronBuilderOptions;
}
