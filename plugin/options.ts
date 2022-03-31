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

  const devFile = join(root, "src/main/index.ts");
  const prodFile = join(root, "src/main/index.prod.ts");

  const {
    outdir = join(root, "app/main"),
    entryFile = viteConfig.command === "build" ? prodFile : devFile,
    preloadFile = join(root, "src/main/preload.ts"),
    tsconfig,
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
      env,
      command,
      external,
      afterEsbuildBuild,
    };

  return resolvedViteElectronBuilderOptions;
}
